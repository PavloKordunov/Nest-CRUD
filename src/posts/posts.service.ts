import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';;
import { DatabaseService } from '../database/database.service';
import { CreatePostDto } from './dto/createPostDto';
import { UpdatePostDto } from './dto/UpdatePostDto';

@Injectable()
export class PostsService {
    constructor(private readonly dataBaseService: DatabaseService){}

    async findAll(){
        try {
            return this.dataBaseService.post.findMany()
    
        } catch (error) {         
            throw new InternalServerErrorException(`failed to get all posts with error: ${error.message}`)
        }
    }

    async findOne(id: number){
        try {
            const post = await this.dataBaseService.post.findUnique({
                where: {
                    id,
                },
                include: {
                    user: {
                        select: {name: true}
                    },
                    group: {
                        select: {name: true}
                    }
                }
            })
    
            if(!post) {
                throw new NotFoundException("Post not found")
            }
    
            return post    
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error
            }

            throw new InternalServerErrorException(`failed to get post by id with error: ${error}` )
        }
    }

    async getComments(postId: number, page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;
    
            const [comments, total] = await Promise.all([
                this.dataBaseService.comment.findMany({
                    where: { postId, parentId: null },
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: "asc" },
                    skip,
                    take: limit
                }),
                this.dataBaseService.comment.count({
                    where: { postId, parentId: null }
                })
            ]);

            return { comments, total };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to fetch comments: ${error.message}`);
        }
    }

    async getReplies(commentId: number, page: number = 1, limit: number = 5) {
        try {
            const skip = (page - 1) * limit;
    
            const [replies, total] = await Promise.all([
                this.dataBaseService.comment.findMany({
                    where: { parentId: commentId },
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: "asc" },
                    skip,
                    take: limit
                }),
                this.dataBaseService.comment.count({
                    where: { parentId: commentId }
                })
            ]);

            return { replies, total };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to fetch replies: ${error.message}`);
        }
    }
    

    async create(createPostDto: CreatePostDto, userId: number) {
        try {
            return this.dataBaseService.post.create({
                data: {
                    title: createPostDto.title,
                    description: createPostDto.description,
                    user: {connect: {id: userId}},
                    group: {connect: {id: createPostDto.groupId}},
                },
                include: {user: {select: {name: true}}}
            })   
        } catch (error) {
            throw new InternalServerErrorException(`failed to create post with error: ${error}` )
        }
    }

    async commentPost(id: number, userId: number, text: string, parentId?: number) {
        try {
            const post = await this.dataBaseService.post.findUnique({ where: { id } });
            if (!post) {
                throw new NotFoundException(`Post with ID ${id} not found`);
            }

            if (parentId) {
                const parentComment = await this.dataBaseService.comment.findUnique({ where: { id: parentId } });
                if (!parentComment) {
                    throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
                }
            }
    
            const comment = await this.dataBaseService.comment.create({
                data: {
                    userId,
                    postId: id,
                    text,
                    parentId
                }
            });
    
            return comment;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to create comment: ${error.message}`);
        }
    }

    async update(id: number, updatePostDto: UpdatePostDto){
    try{
        const updatePost = await this.dataBaseService.post.update({
            where: {
                id,
            },
            data: updatePostDto,
            include: {
                user: {
                    select: {name: true}
                }
            }
        })

        if(!updatePost) {
            throw new NotFoundException("Post not found")
        }

        return updatePost    
    } catch (error) {
        if(error instanceof NotFoundException){
            throw error
        }

        throw new InternalServerErrorException(`failed to update post by id with error: ${error}` )
    }
    }

    async delete(id: number){
        try {
            const post = await this.dataBaseService.post.delete({
                where: {
                    id,
                }
            })
    
            if(!post) {
                throw new NotFoundException("Post not found")
            }
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error
            }
            throw new InternalServerErrorException(`failed to delete post by id with error: ${error}`)
        }
    }
}
