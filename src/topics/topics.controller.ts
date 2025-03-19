import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { Roles } from 'src/guards/roles.decorator';
import { JwtGuard } from 'src/guards/jwtGuard';
import { RolesGuard } from 'src/guards/RoleGuard';
import { CreateTopicDto } from './dto/CreateTopicDto';
import { UpdateTopicDto } from './dto/UpdateTopicDto';

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
    create(@Body() createTopicDto: CreateTopicDto) {
        return this.topicService.create(createTopicDto)
    }

    @Patch(":id")
    @Roles("Admin")
    update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto ){
        return this.topicService.update(+id, updateTopicDto)
    }

    @Delete(':id')
    @Roles("Admin")
    delete(@Param("id") id: string){
        return this.topicService.delete(+id)
    }

    @UseGuards(JwtGuard)
    @Post(":id/comments")
    commentPost(@Param('id') id: string, @Req() request: any, @Body() createCommentDto: {text: string, parentId?: number}){
        const userId = request.user.sub
        return this.topicService.commentTopic(+id, userId, createCommentDto.text, createCommentDto.parentId )
    }

    @Get(":id/comments")
    getComments(@Param('id') id: string) {
        return this.topicService.getComments(+id);
    }    
}
