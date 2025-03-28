import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeProjectRecord } from './employee-project-record';
import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity()
export class Employee {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	email: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	@Exclude()
	password: string;

	@OneToMany(() => EmployeeProjectRecord, (epr) => epr.employee)
	projectRecords: EmployeeProjectRecord[];

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}

	async comparePassword(password: string) {
		return bcrypt.compare(password, this.password);
	}
}
