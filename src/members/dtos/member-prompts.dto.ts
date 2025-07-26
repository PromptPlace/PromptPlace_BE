export interface MemberPromptDto {
  prompt_id: number;
  title: string;
  models: {
    model: {
      name: string;
    };
  }[];
  tags: {
    tag: {
      name: string;
    };
  }[];
}

export interface MemberPromptQueryDto {
  cursor?: string; // 마지막으로 받은 prompt_id
  limit?: string; // 한 번에 가져올 개수 (기본: 10)
}

export interface MemberPromptResponseDto {
  prompts: MemberPromptDto[];
  pagination: {
    nextCursor: number | null; // 다음 페이지의 커서
    has_more: boolean; // 다음 페이지 존재 여부
    limit: number; // 현재 페이지 크기
  };
} 