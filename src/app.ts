import 'reflect-metadata';
import 'dotenv/config';
import { getMetadataArgsStorage, useContainer, useExpressServer } from 'routing-controllers';
import { ProjectsController } from './controllers/projects.controller';
import { EmployeesController } from './controllers/employees.controller';
import { AppDataSource } from './data-source';
import Container from 'typedi';
import { PassportConfig } from './passport-config';
import passport from 'passport';
import express from 'express';
import { AuthController } from './controllers/auth.controller';
import { EmployeeProjectRecordsController } from './controllers/employee-project-record.controller';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUiExpress from 'swagger-ui-express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

const routingControllerOptions = {
	routePrefix: '/api',
	controllers: [EmployeesController, ProjectsController, AuthController, EmployeeProjectRecordsController],
};

async function main() {
	Container.set('DataSource', AppDataSource);
	useContainer(Container);
	await AppDataSource.initialize();

	// We run migrations only in production, because in development we have the synchronization: true flag set for the DataSource already.
	if (process.env.NODE_ENV === 'production') {
		await AppDataSource.runMigrations();
	}

	const app = express();

	const schemas = validationMetadatasToSchemas({
		classTransformerMetadataStorage: defaultMetadataStorage,
		refPointerPrefix: '#/components/schemas/',
	});

	const storage = getMetadataArgsStorage();
	const spec = routingControllersToSpec(storage, routingControllerOptions, {
		components: {
			schemas,
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [{ bearerAuth: [] }],
		info: {
			description: 'Manage employees and projects',
			title: 'Employees and Projects',
			version: '1.0.0',
		},
	});

	app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
	app.get('/spec', (_req, res) => {
		res.json(spec);
	});

	Container.get(PassportConfig);
	app.use(passport.initialize());

	useExpressServer(app, routingControllerOptions);

	const port = process.env.PORT ?? 3000;

	app.listen(port, () => {
		console.log(`Listening on ${port}`);
		console.log(`Swagger docs available at: /docs`);
		console.log(`Swagger spec available at: /spec`);
	});
}

main();
