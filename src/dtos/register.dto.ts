import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class Register {
	@IsEmail()
	email: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 0,
		minSymbols: 0,
	})
	password: string;
}
