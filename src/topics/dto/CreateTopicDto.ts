import { IsNotEmpty, IsString } from "class-validator";

export class CreateTopicDto {
        @IsString()
        @IsNotEmpty({ message: 'Title cannot be empty' })
        title: string;
      
        @IsString()
        @IsNotEmpty({ message: 'Description cannot be empty' })
        description: string;
}