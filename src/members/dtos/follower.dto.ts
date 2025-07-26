
import { ApiProperty } from '@nestjs/swagger';

export class FollowerDto {
  @ApiProperty({ description: '팔로우 ID' })
  follow_id: number;

  @ApiProperty({ description: '팔로워 ID' })
  follower_id: number;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '생성일' })
  created_at: Date;

  @ApiProperty({ description: '수정일' })
  updated_at: Date;
} 