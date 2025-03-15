import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { Roles } from 'src/guards/roles.decorator';
import { JwtGuard } from 'src/guards/jwtGuard';
import { RolesGuard } from 'src/guards/RoleGuard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('topics')
export class TopicsController {
    constructor(private readonly topicService: TopicsService) {}

    @Get()
    findAll() {
        return this.topicService.findAll()
    }

    @Get(':id')
    findOne(@Param("id") id: string){
        return this.topicService.findOne(+id)
    }

    @Post()
    @Roles('Admin')
    create(@Body() createTopicDto: {title: string, description: string}) {
        return this.topicService.create(createTopicDto)
    }

    @Patch(":id")
    @Roles("Admin")
    update(@Param('id') id: string, @Body() updateTopicDto: {title: string, description: string} ){
        return this.topicService.update(+id, updateTopicDto)
    }

    @Delete(':id')
    @Roles("Admin")
    delete(@Param("id") id: string){
        return this.topicService.delete(+id)
    }
}
