import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
                }
            }
        })
    }

    async create(createPostDto: { title: string; description: string, userId: number }) {
        return this.dataBaseService.post.create({
            data: {
                title: createPostDto.title,
                description: createPostDto.description,
                user: {connect: {id: createPostDto.userId}}
            },
            include: {user: {select: {name: true}}}
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
