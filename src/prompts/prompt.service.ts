import { SearchPromptDto } from './dtos/search-prompt.dto';
import * as promptRepository from './prompt.repository';

export const searchPrompts = async (dto: SearchPromptDto) => {
  return await promptRepository.searchPromptRepo(dto);
};