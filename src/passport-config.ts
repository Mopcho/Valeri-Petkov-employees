import { Inject, Service } from 'typedi';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { Employee } from './entities/employee.entity';
import { DataSource } from 'typeorm';

@Service()
export class PassportConfig {
	constructor(@Inject('DataSource') private readonly dataSource: DataSource) {
		this.init();
	}

	private init() {
		if (!process.env.JWT_SECRET) {
			throw new Error('JWT_SECRET not set');
		}
		const options: StrategyOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
		};

		passport.use(
			new JwtStrategy(options, async (payload, done) => {
				try {
					const employee = await this.dataSource.getRepository(Employee).findOne({
						where: { id: payload.id },
					});
					if (employee) return done(null, employee);
					return done(null, false);
				} catch (err) {
					return done(err, false);
				}
			})
		);
	}
}
