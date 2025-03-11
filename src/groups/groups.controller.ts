import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtGuard } from 'src/guards/jwtGuard';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupService: GroupsService) {}

    @Get()
    findAll() {
        return this.groupService.findAll()
    }

    @UseGuards(JwtGuard)
    @Post()
    create(@Body() createGroupDto: {name: string, description: string}, @Req() request: any){
        const ownerId = request.user.sub
        return this.groupService.create({...createGroupDto, ownerId})
    }
}
