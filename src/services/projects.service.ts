import { Inject, Service } from 'typedi';
import { parsePagination, runInTransaction } from '../utils';
import { Project } from '../entities/project.entity';
import { DataSource, DeepPartial, FindOptionsWhere, QueryRunner } from 'typeorm';
import { Pagination, UpdateProject } from 'src/interfaces';
import { NotFoundError } from 'routing-controllers';

@Service()
export class ProjectsService {
	constructor(@Inject('DataSource') private readonly dataSource: DataSource) {}
	create(createData: DeepPartial<Project>, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const projectRepo = qr.manager.getRepository(Project);
				const employee = projectRepo.create(createData);
				await projectRepo.save(employee);
				return employee;
			},
			this.dataSource,
			queryRunner
		);
	}

	findOne(findData: FindOptionsWhere<Project>, queryRunner?: QueryRunner) {
		return runInTransaction(
			(qr) => {
				return qr.manager.getRepository(Project).findOneBy(findData);
			},
			this.dataSource,
			queryRunner
		);
	}

	list(criteria?: FindOptionsWhere<Project> | FindOptionsWhere<Project>[], pagination?: Pagination, queryRunner?: QueryRunner) {
		return runInTransaction(
			(qr) => {
				return qr.manager.getRepository(Project).find({ where: criteria, ...parsePagination(pagination) });
			},
			this.dataSource,
			queryRunner
		);
	}

	delete(criteria?: FindOptionsWhere<Project>, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const projectToRemove = await this.findOne(criteria, qr);
				if (!projectToRemove) {
					throw new NotFoundError('Project not found');
				}
				return qr.manager.getRepository(Project).remove(projectToRemove);
			},
			this.dataSource,
			queryRunner
		);
	}

	update(criteria: FindOptionsWhere<Project>, updateData: UpdateProject, queryRunner?: QueryRunner) {
		return runInTransaction(
			async (qr) => {
				const project = await this.findOne(criteria, qr);
				if (!project) {
					throw new NotFoundError('Project not found');
				}
				project.name = updateData.name;
				return qr.manager.getRepository(Project).save(project);
			},
			this.dataSource,
			queryRunner
		);
	}
}
