import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { group } from 'console';

@Injectable()
export class UsersService {
    constructor(private readonly dataBaseService: DatabaseService, private jwtService: JwtService) {}

    async findAll(status?: "ACTIVE" | "INACTIVE") {
        const users = await this.dataBaseService.user.findMany({
            where: status ? { status } : undefined,
            include: {
                membership: {
                    include: {
                        group: true,
                    },
                },
            },
        });

        return users.map(user => ({
            ...user,
            groups: user.membership.map(m => m.group),
            membership: undefined
        })
        )
    }

    async register(registerDto: Prisma.UserCreateInput){
        const hashedpassword = await bcrypt.hash(registerDto.password, 10)
        
        const user = await this.dataBaseService.user.create({
            data: {...registerDto, password: hashedpassword}
        })

        return this.generateToken(user)
    }

    async login(email: string, password: string) {
        const user = await this.dataBaseService.user.findUnique({
            where: {
                email,
            }
        })

        if(!user) throw new UnauthorizedException('Invalid credentials')

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid) throw new UnauthorizedException('Invalid credentials')

        return this.generateToken(user)
    }

    async generateToken(user: any) {
        return {access_token : this.jwtService.sign({ sub: user.id, email: user.email })}
    }

    async findOne(id: number) {
        const user = await this.dataBaseService.user.findUnique({
            where: { id },
            include: {
                membership: { include: { group: true } },
                followers: {
                    select: {
                        followerId: true,
                        follower: { select: { id: true, name: true } }
                    }
                },
                following: {
                    select: {
                        followingId: true,
                        following: { select: { id: true, name: true } }
                    }
                }
            }
        }) as any & { membership: { group: any }[] };
    
        return {
            ...user,
            groups: user?.membership.map(m => m.group),
            followers: user?.followers.map(f => f.follower), 
            following: user?.following.map(f => f.following),
            membership: undefined
        };
    }
    

    async follow(followerId: number, followingId: number) {
        if (followerId === followingId) {
            throw new BadRequestException("You can't follow yourself.");
        }
    
        const existingFollow = await this.dataBaseService.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId }
            }
        });
    
        if (existingFollow) {
            await this.dataBaseService.follow.delete({
                where: { id: existingFollow.id }
            });
            return { message: "Unfollowed successfully" };
        } else {
            console.log(`Trying to follow: followerId=${followerId}, followingId=${followingId}`);
            await this.dataBaseService.follow.create({
                data: {
                    followerId,
                    followingId
                }
            });
            return { message: "Followed successfully" };
        }
    

    }

    async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
        return this.dataBaseService.user.update({
            where: {
                id,
            },
            data: updateUserDto,
        })
    }

    async delete(id: number) {
        return this.dataBaseService.user.delete({
            where : {
                id,
            }
        })
    }
}
