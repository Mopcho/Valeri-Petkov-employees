import { Body, Delete, Get, JsonController, Param, Put, QueryParam, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { EmployeesService } from '../services/employees.service';
import passport from 'passport';
import { UpdateEmployeeDto } from '../dtos/update-employee.dto';

@JsonController('/employees')
@Service()
@UseBefore(passport.authenticate('jwt', { session: false }))
export class EmployeesController {
	constructor(private readonly employeesService: EmployeesService) {}

	@Get()
	list(@QueryParam('page') page: number, @QueryParam('pageSize') pageSize: number) {
		return this.employeesService.list({ page, pageSize });
	}

	@Put('/:id')
	update(@Body() data: UpdateEmployeeDto, @Param('id') id: number) {
		return this.employeesService.update({ id }, data);
	}

	@Delete('/:id')
	delete(@Param('id') id: number) {
		return this.employeesService.delete({ id });
	}
}
