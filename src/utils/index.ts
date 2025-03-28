import { QueryRunner, DataSource } from 'typeorm';

export async function getOrCreateQueryRunner(dataSource: DataSource, queryRunner?: QueryRunner) {
	queryRunner = queryRunner ?? dataSource.createQueryRunner();
	if (!queryRunner.isTransactionActive) {
		await queryRunner.connect();
		await queryRunner.startTransaction();
	}
	return queryRunner;
}

export async function runInTransaction<T>(
	callback: (queryRunner: QueryRunner) => Promise<T> | T,
	dataSource: DataSource,
	queryRunner?: QueryRunner
): Promise<T> {
	const runner = await getOrCreateQueryRunner(dataSource, queryRunner);

	try {
		const result = await callback(runner);

		if (!queryRunner) {
			await runner.commitTransaction();
		}

		return result;
	} catch (error) {
		if (!queryRunner && runner.isTransactionActive) {
			await runner.rollbackTransaction();
		}
		throw error;
	} finally {
		if (!queryRunner) {
			await runner.release();
		}
	}
}

export function parsePagination(pagination?: { page?: number; pageSize?: number }) {
	if (pagination?.pageSize === undefined || pagination?.page === undefined) {
		return { take: undefined, skip: undefined };
	}

	const take = pagination.pageSize;
	const skip = (pagination.page - 1) * pagination.pageSize;

	return { take, skip };
}
