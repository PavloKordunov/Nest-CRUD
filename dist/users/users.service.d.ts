import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CacheService } from '../cache/cache.service';
export declare class UsersService {
    private readonly dataBaseService;
    private jwtService;
    private readonly cacheService;
    constructor(dataBaseService: DatabaseService, jwtService: JwtService, cacheService: CacheService);
    findAll(status?: "User" | "Admin", page?: number, limit?: number): Promise<{}>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
    }>;
    generateToken(user: any): Promise<{
        access_token: string;
    }>;
    findOne(id: number): Promise<{}>;
    follow(followerId: number, followingId: number): Promise<{
        message: string;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        password: string;
        status: import(".prisma/client").$Enums.Status;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: number): Promise<{
        email: string;
        name: string | null;
        password: string;
        status: import(".prisma/client").$Enums.Status;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
