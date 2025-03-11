import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class GroupsService {
    constructor(private readonly dataBaseService: DatabaseService){}

    async findAll () {
        return this.dataBaseService.group.findMany({
            include: {
                owner: {
                    select: {
                        name: true
                    }
                }
            }
        })
    }
    async create(createGroupDto: { name: string; description: string, ownerId: number }) {
        return this.dataBaseService.group.create({
            data: {
                name: createGroupDto.name,
                description: createGroupDto.description,
                ownerId: createGroupDto.ownerId
            }
        })
    }
}
