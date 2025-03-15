import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(status?: "User" | "Admin"): Promise<{
        groups: {
            id: number;
            description: string;
            name: string;
            ownerId: number;
            createdAt: Date;
        }[];
        membership: undefined;
        id: number;
        name: string | null;
        createdAt: Date;
        email: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }[]>;
    findOne(id: string): Promise<any>;
    register(registerDto: Prisma.UserCreateInput): Promise<{
        access_token: string;
    }>;
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    follow(followingId: string, request: any): Promise<{
        message: string;
    }>;
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<{
        id: number;
        name: string | null;
        createdAt: Date;
        email: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
    delete(id: string): Promise<{
        id: number;
        name: string | null;
        createdAt: Date;
        email: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
}
