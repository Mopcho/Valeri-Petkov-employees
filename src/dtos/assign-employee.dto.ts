import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class AssignEmployeeDto {
	@IsDateString()
	@IsOptional()
	from?: Date;

	@IsDateString()
	@IsOptional()
	to?: Date;

	@IsNumber()
	employeeId: number;

	@IsNumber()
	projectId: number;
}
