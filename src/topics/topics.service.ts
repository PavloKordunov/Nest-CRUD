import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TopicsService {
    constructor(private readonly dataBaseService: DatabaseService){}

    async findAll(){
        return this.dataBaseService.topic.findMany()
    }

    async findOne(id: number) {
        return this.dataBaseService.topic.findUnique({
            where: {
                id,
            }
        })
    }

    async getComments(topicId: number){
        return this.dataBaseService.comment.findMany({
            where: {
                topicId
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

    async create(createTopicDto: {title: string, description: string}) {
        return this.dataBaseService.topic.create({
            data: createTopicDto
        })
    }

    async commentTopic(id: number, userId: number, text: string, parentId?: number){
        return this.dataBaseService.comment.create({
            data: {
                userId,
                topicId: id,
                text,
                parentId
            }
        })
    }

    async update(id: number, updateTopicDto: {title: string, description: string}){
        return this.dataBaseService.topic.update({
            where: {
                id,
            },
            data: updateTopicDto
        })
    }

    async delete(id: number) {
        return this.dataBaseService.topic.delete({
            where: {
                id,
            }
        })
    }
}
