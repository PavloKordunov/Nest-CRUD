import { PartialType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./createPostDto";

export class UpdatePostDto extends PartialType(CreatePostDto) {}