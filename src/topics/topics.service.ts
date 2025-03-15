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

    async create(createTopicDto: {title: string, description: string}) {
        return this.dataBaseService.topic.create({
            data: createTopicDto
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
