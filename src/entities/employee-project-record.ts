import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Project } from './project.entity';

@Entity()
export class EmployeeProjectRecord {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Employee, (emp) => emp.projectRecords, {
		onDelete: 'CASCADE',
		onUpdate: 'RESTRICT',
		nullable: true,
	})
	@JoinColumn({
		name: 'employeeId',
	})
	employee: Employee;

	@Column()
	employeeId: number;

	@ManyToOne(() => Project, (proj) => proj.employeeRecords, {
		onDelete: 'CASCADE',
		onUpdate: 'RESTRICT',
		nullable: true,
	})
	@JoinColumn({
		name: 'projectId',
	})
	project: Project;

	@Column()
	projectId: number;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	from: Date;

	@Column({ type: 'timestamptz', nullable: true })
	to?: Date;
}
