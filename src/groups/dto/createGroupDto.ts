import { IsNotEmpty, IsString } from "class-validator";

export class CreateGroupDto {
        @IsString()
        @IsNotEmpty({ message: 'Title cannot be empty' })
        name: string;
      
        @IsString()
        @IsNotEmpty({ message: 'Description cannot be empty' })
        description: string;
}