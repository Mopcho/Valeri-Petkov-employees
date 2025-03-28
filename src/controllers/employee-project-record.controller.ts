import { Body, Get, JsonController, Post, QueryParam, UploadedFile, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import passport from 'passport';
import { EmployeesProjectsService } from '../services/employees-projects.service';
import { AssignEmployeeDto } from '../dtos/assign-employee.dto';
import multer from 'multer';
import os from 'os';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { EmployeeProjectRecord } from '../entities/employee-project-record';
import { OpenAPI } from 'routing-controllers-openapi';

export const fileUploadOptions = () => ({
	storage: multer.diskStorage({
		destination: (req: any, file: any, cb: any) => {
			cb(null, os.tmpdir());
		},
		filename: (req: any, file: any, cb: any) => {
			cb(null, file.originalname);
		},
	}),
	fileFilter: (req: any, file: any, cb: any) => {
		if (file.mimetype === 'text/csv') {
			cb(null, true);
		} else {
			cb(new Error('Only CSV files are allowed'), false);
		}
	},
});

@JsonController('/employee-records')
@Service()
@UseBefore(passport.authenticate('jwt', { session: false }))
export class EmployeeProjectRecordsController {
	constructor(private readonly employeesProjectsService: EmployeesProjectsService) {}

	private async parseCSVFileToEmployeeRecordFormat(location: string): Promise<EmployeeProjectRecord[]> {
		return new Promise((resolve, reject) => {
			let results: any = [];
			fs.createReadStream(location)
				.pipe(csv())
				.on('data', (data) => {
					const employeeRecord = new EmployeeProjectRecord();
					employeeRecord.employeeId = data.EmpID;
					employeeRecord.projectId = data.ProjectID;
					employeeRecord.from = data.DateFrom;
					employeeRecord.to = data.DateTo;
					results.push(employeeRecord);
				})
				.on('error', (err) => reject(err))
				.on('end', () => {
					resolve(results);
				});
		});
	}

	@Post('/longest-collaboration')
	@OpenAPI({
		description:
			'Calculates longest collaboration of employees either from the database or from a given CSV file. The CSV file should be passed on the data field on multipart/form-data and the format should match this: EmpID,ProjectID,DateFrom,DateTo',
	})
	async longestCollaboration(@UploadedFile('data', { options: fileUploadOptions() }) csvFile: any) {
		if (csvFile) {
			const csvLocation = path.resolve(csvFile.destination, csvFile.filename);
			const result = await this.parseCSVFileToEmployeeRecordFormat(csvLocation);

			return this.employeesProjectsService.longestCollaboration(result);
		} else {
			const dataSet = await this.employeesProjectsService.listRecords();
			return this.employeesProjectsService.longestCollaboration(dataSet);
		}
	}

	@Post('/assign')
	@OpenAPI({
		description: 'Assign an employee to a project from a given date to another given date. If "to" is left unspecified it will be further treated as "now"',
	})
	async assignEmployee(@Body() assignEmployeeDto: AssignEmployeeDto) {
		return this.employeesProjectsService.assignEmployeeToProject(assignEmployeeDto);
	}

	@Get()
	async listRecords(@QueryParam('page') page: number, @QueryParam('pageSize') pageSize: number) {
		return this.employeesProjectsService.listRecords({ page, pageSize });
	}
}
