import 'reflect-metadata';
import { EmployeesProjectsService } from './employees-projects.service';
import Container from 'typedi';
import { mockDataSource } from '../tests/mocks';
import { EmployeeProjectRecord } from '../entities/employee-project-record';

/**
 * Will generate automatically records with random dates. You can set the range of maximum collaboration when passing maxYears
 */
function randomSeedGenerator(maxYears: number, employeesCount: number, projectsCount: number, recordsCount: number): EmployeeProjectRecord[] {
	return Array.from({ length: recordsCount }, (_, i) => {
		const employeeId = Math.floor(Math.random() * employeesCount) + 1;
		const projectId = Math.floor(Math.random() * projectsCount) + 1;
		const startDate = new Date(2020 + Math.floor(Math.random() * 5), Math.random() * 12, Math.random() * 28);
		const endDate = new Date(startDate);
		endDate.setFullYear(endDate.getFullYear() + Math.floor(Math.random() * maxYears));

		return {
			id: i,
			employeeId,
			projectId,
			from: startDate.toISOString(),
			to: endDate.toISOString(),
		};
	}) as unknown as EmployeeProjectRecord[];
}

describe('EmployeesProjectsService', () => {
	let service: EmployeesProjectsService;

	beforeAll(async () => {
		Container.set('DataSource', mockDataSource);
		service = Container.get(EmployeesProjectsService);
	});

	test('longestCollaboration with no overlap should be null', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2024-04-27',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-05-01',
				to: '2024-06-01',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeNull();
	});

	test('longestCollaboration with full overlap', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2025-02-27',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-03-27',
				to: '2025-02-27',
			},
			{
				id: 2,
				employeeId: 3,
				projectId: 1,
				from: '2024-03-28',
				to: '2025-02-27',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with one employee without end date', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2025-02-27',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-03-27',
			},
			{
				id: 2,
				employeeId: 3,
				projectId: 1,
				from: '2024-03-27',
				to: '2025-02-26',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with multiple employees and varying overlap', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2025-02-27',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-03-27',
				to: '2024-07-01',
			},
			{
				id: 2,
				employeeId: 3,
				projectId: 1,
				from: '2024-06-01',
				to: '2024-12-01',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 3]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with a single employee on multiple projects', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2024-06-27',
			},
			{
				id: 1,
				employeeId: 1,
				projectId: 2,
				from: '2024-07-01',
				to: '2024-12-01',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeNull();
	});

	test('longestCollaboration with partial overlap', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2024-07-01',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-06-01',
				to: '2024-12-01',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2022-06-01',
				to: '2024-06-01',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with single record', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: '2024-07-01',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeNull();
	});

	test('longestCollaboration with ISO format', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27T15:59:26.158Z',
				to: '2024-06-27T15:59:26.158Z',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-06-01T00:00:00Z',
				to: '2024-12-01T00:00:00Z',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with MM/DD/YYYY format', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '03/27/2024',
				to: '06/27/2024',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '06/01/2024',
				to: '12/01/2024',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with Date object format', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: new Date('2024-03-27T15:59:26.158Z'),
				to: new Date('2024-06-27T15:59:26.158Z'),
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: new Date('2024-06-01T00:00:00Z'),
				to: new Date('2024-12-01T00:00:00Z'),
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with timezone offset', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27T15:59:26.158+02:00',
				to: '2024-06-27T15:59:26.158+02:00',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-06-01T00:00:00+02:00',
				to: '2024-12-01T00:00:00+02:00',
			},
			{
				id: 2,
				employeeId: 3,
				projectId: 2,
				from: '2024-06-01T00:00:00+02:00',
				to: '2024-12-01T00:00:00+02:00',
			},
		] as unknown as EmployeeProjectRecord[];

		const result = service.longestCollaboration(recordsSeed);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([1, 2]));
		expect(result?.daysWorked).toBeGreaterThan(0); // TODO: Caulculate the days
	});

	test('longestCollaboration with invalid date format should throw', async () => {
		const recordsSeed = [
			{
				id: 0,
				employeeId: 1,
				projectId: 1,
				from: '2024-03-27',
				to: 'invalid-date',
			},
			{
				id: 1,
				employeeId: 2,
				projectId: 1,
				from: '2024-06-01',
				to: '2024-12-01',
			},
		] as unknown as EmployeeProjectRecord[];

		expect(() => service.longestCollaboration(recordsSeed)).toThrow();
	});

	test('longestCollaboration with big data', async () => {
		const longestMatch = [
			{
				id: 200,
				employeeId: 61,
				projectId: 70,
				from: '2015-03-27',
			},
			{
				id: 201,
				employeeId: 60,
				projectId: 70,
				from: '2015-06-01',
				to: '2025-12-01',
			},
		] as unknown as EmployeeProjectRecord[];

		const randomSeed = randomSeedGenerator(3, 50, 50, 10000).concat(longestMatch);

		const result = service.longestCollaboration(randomSeed);
		console.log(result);
		expect(result).toBeDefined();
		expect([result?.employee1, result?.employee2]).toEqual(expect.arrayContaining([60, 61]));
		console.log(result);
	});
});
