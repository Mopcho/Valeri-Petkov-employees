import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeProjectRecord } from './employee-project-record';

@Entity()
export class Project {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(() => EmployeeProjectRecord, (epr) => epr.project)
	employeeRecords: EmployeeProjectRecord[];
}
