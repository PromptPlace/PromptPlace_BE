import { IsInt } from "class-validator";

export class DeletePromptImageDto {
  @IsInt()
  order_index!: number;
}
