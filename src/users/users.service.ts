import { Injectable, UnauthorizedException } from '@nestjs/common';
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
            where : {
                id,
            },
            include: {
                membership : {
                    include : {
                        group: true
                    }
                }
            }
        })

        return {
            ...user,
            groups: user?.membership.map(m => m.group),
            membership: undefined
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
