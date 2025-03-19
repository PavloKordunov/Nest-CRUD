import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty({ message: 'Title cannot be empty' })
    title: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Description cannot be empty' })
    description: string;
  
    @IsInt({ message: 'Group ID must be an integer' })
    groupId: number;
}