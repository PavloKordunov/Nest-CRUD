import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(status?: "User" | "Admin", page?: number, limit?: number): Promise<{}>;
    findOne(id: string): Promise<{}>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
    }>;
    follow(followerId: string, request: any): Promise<{
        message: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        password: string;
        status: import(".prisma/client").$Enums.Status;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        email: string;
        name: string | null;
        password: string;
        status: import(".prisma/client").$Enums.Status;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
