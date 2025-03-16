import { Injectable } from '@nestjs/common';;
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PostsService {
    constructor(private readonly dataBaseService: DatabaseService){}

    async findAll(){
        return this.dataBaseService.post.findMany({
            include: {
                user: {
                    select: {name: true}
                }
            }
        })
    }

    async findOne(id: number){
        return this.dataBaseService.post.findUnique({
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
    }

    async getComments(postId: number){
        return this.dataBaseService.comment.findMany({
            where: {
                postId
            },
            include: {
                user: {
                    select: {name: true, email: true }
                },
                replies: {
                    select: {
                        user: {
                            select: {name: true, email: true }
                        },
                        replies: true
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        })
    }

    async create(createPostDto: { title: string; description: string, groupId: number, userId: number }) {
        return this.dataBaseService.post.create({
            data: {
                title: createPostDto.title,
                description: createPostDto.description,
                user: {connect: {id: createPostDto.userId}},
                group: {connect: {id: createPostDto.groupId}},
            },
            include: {user: {select: {name: true}}}
        })
    }

    async commentPost(id: number, userId: number, text: string, parentId?: number){
        return this.dataBaseService.comment.create({
            data: {
                userId,
                postId: id,
                text,
                parentId
            }
        })
    }

    async update(id: number, updateUserDto: {title: string, description: string}){
        return this.dataBaseService.post.update({
            where: {
                id,
            },
            data: updateUserDto,
            include: {
                user: {
                    select: {name: true}
                }
            }
        })
    }

    async delete(id: number){
        return this.dataBaseService.post.delete({
            where: {
                id,
            }
        })
    }
}
