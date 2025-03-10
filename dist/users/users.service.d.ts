import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
export declare class UsersService {
    private readonly dataBaseService;
    private jwtService;
    constructor(dataBaseService: DatabaseService, jwtService: JwtService);
    findAll(status?: "ACTIVE" | "INACTIVE"): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }[]>;
    register(registerDto: Prisma.UserCreateInput): Promise<{
        access_token: string;
    }>;
    login(email: string, password: string): Promise<{
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
    } | null>;
    update(id: number, updateUserDto: Prisma.UserUpdateInput): Promise<{
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
