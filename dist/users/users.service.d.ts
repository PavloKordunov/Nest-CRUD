import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
export declare class UsersService {
    private readonly dataBaseService;
    private jwtService;
    constructor(dataBaseService: DatabaseService, jwtService: JwtService);
    findAll(status?: "User" | "Admin"): Promise<{
        groups: {
            id: number;
            name: string;
            createdAt: Date;
            description: string;
            ownerId: number;
        }[];
        following: {
            id: number;
            followerId: number;
            followingId: number;
        }[];
        followers: {
            id: number;
            followerId: number;
            followingId: number;
        }[];
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }[]>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
    }>;
    generateToken(user: any): Promise<{
        access_token: string;
    }>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
    follow(followerId: number, followingId: number): Promise<{
        message: string;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
    delete(id: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
}
