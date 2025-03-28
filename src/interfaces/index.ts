export interface AssignEmployee {
	from?: Date;
	to?: Date;
	employeeId: number;
	projectId: number;
}

export interface Pagination {
	page?: number;
	pageSize?: number;
}

export interface UpdateProject {
	name?: string;
}

export interface UpdateEmployee {
	firstName?: string;
	lastName?: string;
}
