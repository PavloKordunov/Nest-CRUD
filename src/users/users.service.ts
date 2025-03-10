import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(private readonly dataBaseService: DatabaseService, private jwtService: JwtService) {}

    async findAll(status?: "ACTIVE" | "INACTIVE"){
        if(status) {
            return this.dataBaseService.user.findMany({
                where: {
                    status,
                }
            })
        }
        return this.dataBaseService.user.findMany()
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
        return this.dataBaseService.user.findUnique({
            where : {
                id,
            }
        })
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
