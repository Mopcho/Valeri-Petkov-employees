import { Inject, Service } from 'typedi';
import { DataSource, QueryRunner } from 'typeorm';
import { parsePagination, runInTransaction } from '../utils';
import { AssignEmployee } from '../interfaces';
import { EmployeeProjectRecord } from '../entities/employee-project-record';

@Service()
export class EmployeesProjectsService {
	constructor(@Inject('DataSource') private readonly dataSource: DataSource) {}

	assignEmployeeToProject(assignData: AssignEmployee, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const epRecordRepo = qr.manager.getRepository(EmployeeProjectRecord);
				const epRecord = epRecordRepo.create(assignData);
				await epRecordRepo.save(epRecord);
				return epRecord;
			},
			this.dataSource,
			queryRunner
		);
	}

	listRecords(pagination?: { page: number; pageSize: number }, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const epRecordRepo = qr.manager.getRepository(EmployeeProjectRecord);
				return epRecordRepo.find(parsePagination(pagination));
			},
			this.dataSource,
			queryRunner
		);
	}

	/**
	 * Returns the employees that have the most days of collaboration. We use two pointers to iterate over all
	 * possible combinations.
	 */
	longestCollaboration(dataSet: EmployeeProjectRecord[]) {
		type LongestCollab = { employee1: number; employee2: number; daysWorked: number; projectId: number };
		let longestCollab: LongestCollab | null = null;

		for (let pointerLeft = 0; pointerLeft < dataSet.length; pointerLeft++) {
			const left = dataSet[pointerLeft];
			const leftStart = left.from;
			const leftTo = left.to;

			for (let pointerRight = pointerLeft + 1; pointerRight < dataSet.length; pointerRight++) {
				const right = dataSet[pointerRight];
				if (right.employeeId === left.employeeId || right.projectId !== left.projectId) continue;
				const rightStart = right.from;
				const rightTo = right.to;

				const overlapDays = this.getOverlapDays(leftStart, leftTo, rightStart, rightTo);

				if (overlapDays && (!longestCollab || longestCollab.daysWorked < overlapDays)) {
					longestCollab = {
						employee1: left.employeeId,
						employee2: right.employeeId,
						daysWorked: overlapDays,
						projectId: right.projectId,
					};
				}
			}
		}

		return longestCollab;
	}

	/**
	 * Parses the given date or string to an instance of Date. If invalid date is given, throws
	 */
	private toStdDate(date?: Date | string) {
		if (!date || date === 'undefined') {
			return new Date();
		}
		const stdDate = date instanceof Date ? date : new Date(date);
		if (isNaN(stdDate.getTime())) {
			throw new Error('Invalid Date Format');
		}
		return stdDate;
	}

	/**
	 * Returns the days that intersect between the 2 given date ranges
	 */
	private getOverlapDays(start1?: Date | string, end1?: Date | string, start2?: Date | string, end2?: Date | string) {
		const dateStart1 = this.toStdDate(start1);
		const dateEnd1 = this.toStdDate(end1);
		const dateStart2 = this.toStdDate(start2);
		const dateEnd2 = this.toStdDate(end2);

		const overlapStart = dateStart1 > dateStart2 ? dateStart1 : dateStart2;
		const overlapEnd = dateEnd1 < dateEnd2 ? dateEnd1 : dateEnd2;

		if (overlapStart <= overlapEnd) {
			const millisecondsPerDay = 1000 * 60 * 60 * 24;
			return (overlapEnd.getTime() - overlapStart.getTime()) / millisecondsPerDay;
		}

		return 0;
	}
}
