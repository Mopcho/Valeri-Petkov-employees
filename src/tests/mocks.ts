import { DataSource } from 'typeorm';

export const mockDataSource = {
	initialize: jest.fn().mockResolvedValue(true),
	getRepository: jest.fn().mockReturnValue({
		save: jest.fn(),
		find: jest.fn(),
	}),
	destroy: jest.fn().mockResolvedValue(true),
} as unknown as DataSource;
