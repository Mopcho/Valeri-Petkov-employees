import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto {
	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;
}
