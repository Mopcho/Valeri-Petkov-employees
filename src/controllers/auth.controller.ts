import { JsonController, Post, Body, UnauthorizedError, InternalServerError } from 'routing-controllers';
import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { EmployeesService } from '../services/employees.service';
import { Register } from '../dtos/register.dto';
import { Login } from '../dtos/login.dto';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@JsonController('/auth')
export class AuthController {
	constructor(private readonly employeeService: EmployeesService) {}

	@Post('/register')
	async register(@Body() employeeData: Register) {
		const existingUser = await this.employeeService.findOne({ email: employeeData.email });

		if (existingUser) throw new UnauthorizedError('Email already in use');

		await this.employeeService.create(employeeData);

		return { message: 'User registered successfully' };
	}

	@Post('/login')
	@OpenAPI({
		description: 'Login with email and password. Upon success returns a JWT',
	})
	async login(@Body() loginData: Login) {
		if (!process.env.JWT_SECRET) {
			throw new InternalServerError('JWT_SECRET not set');
		}

		const employee = await this.employeeService.findOne({ email: loginData.email });

		if (!employee || !(await employee.comparePassword(loginData.password))) {
			throw new UnauthorizedError('Invalid credentials');
		}

		const token = jwt.sign({ id: employee.id, email: employee.email }, process.env.JWT_SECRET, {
			expiresIn: '12h',
		});

		return { token };
	}
}
