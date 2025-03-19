import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtGuard } from 'src/guards/jwtGuard';
import { Prisma } from '@prisma/client';
import { CreatePostDto } from './dto/createPostDto';
import { UpdatePostDto } from './dto/UpdatePostDto';

@Controller('posts')
export class PostsController {
    constructor(private readonly postService: PostsService){}

    @Get()
    findAll(){
        return this.postService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.postService.findOne(+id)
    }

    @UseGuards(JwtGuard)
    @Post()
    create(@Body() createPostDto: CreatePostDto, @Req() request: any) {
        const userId = request.user.sub; 
        console.log(userId)
        return this.postService.create(createPostDto, userId);
    }

    @UseGuards(JwtGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto){
        return this.postService.update(+id, updatePostDto)
    }

    @Delete(':id')
    delete(@Param('id') id: string){
        return this.postService.delete(+id)
    }

    @UseGuards(JwtGuard)
    @Post(":id/comments")
    commentPost(@Param('id') id: string, @Req() request: any, @Body() createCommentDto: {text: string, parentId?: number}){
        const userId = request.user.sub
        return this.postService.commentPost(+id, userId, createCommentDto.text, createCommentDto.parentId )
    }

    @Get(":id/comments")
    getComments(@Param('id') id: string) {
        return this.postService.getComments(+id);
    }
}
