import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtGuard } from '../guards/jwtGuard';
import { CreatePostDto } from './dto/createPostDto';
import { UpdatePostDto } from './dto/UpdatePostDto';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService){}

    @Get()
    findAll(){
        return this.postsService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.postsService.findOne(+id)
    }

    @UseGuards(JwtGuard)
    @Post()
    create(@Body() createPostDto: CreatePostDto, @Req() request: any) {
        const userId = request.user.sub; 
        console.log(userId)
        return this.postsService.create(createPostDto, userId);
    }

    @UseGuards(JwtGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto){
        return this.postsService.update(+id, updatePostDto)
    }

    @Delete(':id')
    delete(@Param('id') id: string){
        return this.postsService.delete(+id)
    }

    @UseGuards(JwtGuard)
    @Post(":id/comments")
    commentPost(@Param('id') id: string, @Req() request: any, @Body() createCommentDto: {text: string, parentId?: number}){
        const userId = request.user.sub
        return this.postsService.commentPost(+id, userId, createCommentDto.text, createCommentDto.parentId )
    }

    @Get(":id/comments")
    getComments(
        @Param('id') id: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10'
    ) {
        return this.postsService.getComments(+id, +page, +limit);
    }
    
    @Get(":id/replies")
    getReplies(
        @Param('id') id: string,
        @Query('page') page = '1',
        @Query('limit') limit = '5'
    ) {
        return this.postsService.getReplies(+id, +page, +limit);
    }
    
}
