import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(status?: "ACTIVE" | "INACTIVE"): Promise<{
        groups: {
            id: number;
            name: string;
            createdAt: Date;
            description: string;
            ownerId: number;
        }[];
        membership: undefined;
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
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
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
    delete(id: string): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.Status;
        password: string;
    }>;
}
