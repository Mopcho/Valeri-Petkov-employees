import 'dotenv/config'
import { DataSource } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeProjectRecord } from './entities/employee-project-record';
import { Project } from './entities/project.entity';
import { join } from 'path';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT ?? '5432'),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	synchronize: process.env.NODE_ENV === 'development' ? true : false,
	logging: process.env.NODE_ENV === 'development' ? true : false,
	entities: [Employee, EmployeeProjectRecord, Project],
	subscribers: [],
	migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
