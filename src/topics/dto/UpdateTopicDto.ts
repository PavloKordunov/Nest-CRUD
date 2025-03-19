import { PartialType } from "@nestjs/mapped-types";
import { CreateTopicDto } from "./CreateTopicDto";

export class UpdateTopicDto extends PartialType(CreateTopicDto) {}