import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { JwtGuard } from 'src/guards/jwtGuard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@Query('status') status?: "User" | "Admin"){
        return this.usersService.findAll(status)
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.usersService.findOne(+id)
    }

    @Post('register')
    register(@Body() registerDto: Prisma.UserCreateInput) {
        return this.usersService.register(registerDto)
    }

    @Post('login')
    login(@Body() loginDto: {email: string, password: string} ){
        return this.usersService.login(loginDto.email, loginDto.password)
    }

    @UseGuards(JwtGuard)
    @Post('follow/:id')
    async follow(@Param("id") followingId: string, @Req() request: any) {
        console.log("Decoded JWT User:", request.user); 
        const followerId = request.user.sub;
        console.log(`Trying to follow: followerId=${followerId}, followingId=${followingId}`);
        
        return this.usersService.follow(followerId, +followingId);
    }
    
    @UseGuards(JwtGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: Prisma.UserUpdateInput){
        return this.usersService.update(+id, updateUserDto)
    }

    @UseGuards(JwtGuard)
    @Delete(':id')
    delete(@Param('id') id: string){
        return this.usersService.delete(+id)
    }
}
