import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(status?: "User" | "Admin"): Promise<{
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
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
    }>;
    follow(followingId: string, request: any): Promise<{
        message: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
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
