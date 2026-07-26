// prod/dev 가 같은 Upstash DB 를 공유하는 상황에서 키 충돌을 막기 위한 네임스페이스 헬퍼.
// NODE_ENV 기준으로 자동 분리. 새 caller 는 반드시 이 k() 를 거쳐 키를 만들 것.
const REDIS_KEY_NS = process.env.NODE_ENV === 'production' ? 'prod:' : 'dev:';

export const k = (key: string): string => `${REDIS_KEY_NS}${key}`;
