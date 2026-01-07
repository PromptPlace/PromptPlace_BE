import { IsInt, IsString, IsUrl } from "class-validator";

export class PatchPromptImageDto {
  @IsString()
  @IsUrl()
  image_url!: string;

  @IsInt()
  order_index!: number;
}
