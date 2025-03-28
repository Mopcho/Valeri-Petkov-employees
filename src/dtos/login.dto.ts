import { IsString } from 'class-validator';

export class Login {
	@IsString()
	email: string;

	@IsString()
	password: string;
}
