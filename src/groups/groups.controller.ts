import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtGuard } from 'src/guards/jwtGuard';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupService: GroupsService) {}

    @Get()
    findAll() {
        return this.groupService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.groupService.findOne(+id)
    }

    @UseGuards(JwtGuard)
    @Post()
    create(@Body() createGroupDto: {name: string, description: string}, @Req() request: any){
        const ownerId = request.user.sub
        return this.groupService.create({...createGroupDto, ownerId})
    }

    @UseGuards(JwtGuard)
    @Patch(':id')
    update(@Param("id") id: string, @Body() updateGroupDto: {name: string, description: string}, @Req() request: any) {
        const ownerId = request.user.sub
        return this.groupService.update(+id, {...updateGroupDto, ownerId})
    }

    @UseGuards(JwtGuard)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.groupService.delete(+id)
    }

    @UseGuards(JwtGuard)
    @Post("follow/:id")
    follow(@Param("id") id: string, @Req() request: any){
        const userId = request.user.sub
        return this.groupService.follow(userId, +id)
    }
}
