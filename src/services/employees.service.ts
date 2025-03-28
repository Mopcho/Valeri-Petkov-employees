import { Inject, Service } from 'typedi';
import { Employee } from '../entities/employee.entity';
import { DataSource, DeepPartial, FindOptionsWhere, QueryRunner } from 'typeorm';
import { parsePagination, runInTransaction } from '../utils';
import { NotFoundError } from 'routing-controllers';
import { UpdateEmployee } from 'src/interfaces';

@Service()
export class EmployeesService {
	constructor(@Inject('DataSource') private readonly dataSource: DataSource) {}
	create(createData: DeepPartial<Employee>, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const employeesRepo = qr.manager.getRepository(Employee);
				const employee = employeesRepo.create(createData);
				await employeesRepo.save(employee);
				return employee;
			},
			this.dataSource,
			queryRunner
		);
	}

	findOne(findData: FindOptionsWhere<Employee>, queryRunner?: QueryRunner) {
		return runInTransaction(
			(qr) => {
				return qr.manager.getRepository(Employee).findOneBy(findData);
			},
			this.dataSource,
			queryRunner
		);
	}

	list(pagination: { page: number; pageSize: number }, queryRunner?: QueryRunner) {
		return runInTransaction(
			(qr) => {
				return qr.manager.getRepository(Employee).find(parsePagination(pagination));
			},
			this.dataSource,
			queryRunner
		);
	}

	delete(criteria?: FindOptionsWhere<Employee>, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const employeeToRemove = await this.findOne(criteria, qr);
				if (!employeeToRemove) {
					throw new NotFoundError('Project not found');
				}
				return qr.manager.getRepository(Employee).remove(employeeToRemove);
			},
			this.dataSource,
			queryRunner
		);
	}

	update(criteria: FindOptionsWhere<Employee>, updateData: UpdateEmployee, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const employee = await this.findOne(criteria, qr);
				if (!employee) {
					throw new NotFoundError('Project not found');
				}
				employee.firstName = updateData.firstName;
				employee.lastName = updateData.lastName;
				return qr.manager.getRepository(Employee).save(employee);
			},
			this.dataSource,
			queryRunner
		);
	}
}
