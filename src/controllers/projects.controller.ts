import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParam, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { ProjectsService } from '../services/projects.service';
import passport from 'passport';
import { UpdateProjectDto } from '../dtos/update-project.dto';

@JsonController('/projects')
@Service()
@UseBefore(passport.authenticate('jwt', { session: false }))
export class ProjectsController {
	constructor(private readonly projectsService: ProjectsService) {}

	@Post()
	create(@Body() data: CreateProjectDto) {
		return this.projectsService.create(data);
	}

	@Put('/:id')
	update(@Body() data: UpdateProjectDto, @Param('id') id: number) {
		return this.projectsService.update({ id }, data);
	}

	@Delete('/:id')
	delete(@Param('id') id: number) {
		return this.projectsService.delete({ id });
	}

	@Get()
	list(@QueryParam('page') page: number, @QueryParam('pageSize') pageSize: number) {
		return this.projectsService.list({}, { page, pageSize });
	}
}
