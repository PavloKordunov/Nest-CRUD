import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateGroupDto } from './dto/createGroupDto';
import { UpdateGroupDto } from './dto/updateGroupDto';

@Injectable()
export class GroupsService {
    constructor(private readonly dataBaseService: DatabaseService){}

    async findAll () {
        const groups = await this.dataBaseService.group.findMany({
            include: {
                owner: {
                    select: {
                        name: true
                    }
                },
                members: {
                    include: {
                        user: true
                    }
                }
            }
        })

        return groups.map((group) => ({
            ...group,
            users: group.members,
            members: undefined
        })) 
    }

    async create(createGroupDto: CreateGroupDto, ownerId:number) {
        return this.dataBaseService.group.create({
            data: {
                name: createGroupDto.name,
                description: createGroupDto.description,
                ownerId: ownerId
            }
        })
    }

    async follow(userId: number, groupId: number) {
        const existedGroup = await this.dataBaseService.groupSubsription.findUnique({
            where: {
                userId_groupId: {userId, groupId}
            }
        })

        if (existedGroup) {
            await this.dataBaseService.groupSubsription.delete({
                where: {
                    id: existedGroup.id,
                },
            });
            return { message: "Unfollowed the group." };
        } else {
            await this.dataBaseService.groupSubsription.create({
                data: {
                    userId,
                    groupId,
                },
            });
            return { message: "Followed the group." };
        }
    }

    async findOne(id: number) {
        return this.dataBaseService.group.findUnique({
            where: {
                id,
            },
            include: {
                owner: {
                    select: {
                        name: true
                    }
                },
                posts: true
            }
        })
    }

    async update(id: number, updateGroupDto: UpdateGroupDto, ownerId: number) {
        return this.dataBaseService.group.update({
            where: {
                id,
            },
            data: {
                name: updateGroupDto.name,
                description: updateGroupDto.description,
                ownerId
            }
        })
    }

    async delete(id: number) {
        return this.dataBaseService.group.delete({
            where: {
                id,
            },
        })
    }
}
