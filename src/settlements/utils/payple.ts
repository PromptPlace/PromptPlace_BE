import { AppError } from "../../errors/AppError";

interface PaypleErrorResponse {
  result: string;
  message: string;
}

export class AccountVerificationError extends AppError {
  public subCode: string;

  constructor(message: string, subCode: string) {
    super(message, 400, 'AccountVerificationError');
    this.subCode = subCode;
    this.name = this.constructor.name; 
  }
}

export const parseAccountVerificationError = (paypleResponse: PaypleErrorResponse) => {
  const code = paypleResponse.result;
  const msg = paypleResponse.message || '';

  // 1. 점검 시간 (7번 모달)
  if (code === 'T0996' || code === 'T0997') {
    return {
      subCode: 'BANK_MAINTENANCE',
      message: '현재 은행 정기 점검 시간(가능시간 : 01시 ~ 23시)입니다. 점검 종료 후 다시 시도해 주세요.',
    };
  }

  // 2. 은행 오류/불일치 (2번 모달)
  if (code === 'N0101' || msg.includes('기관코드')) {
    return {
      subCode: 'BANK_MISMATCH',
      message: '선택하신 은행과 계좌번호가 일치하지 않습니다. 은행명을 다시 확인해 주세요.',
    };
  }

  // 3. 통신/지연 오류 (6번 모달)
  if (code === 'A0007' || code === 'A0999' || code === 'A0001' || msg.includes('타임아웃')) {
    return {
      subCode: 'BANK_TIMEOUT',
      message: '해당 은행과의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  // 4. 없는 계좌 (3번 모달)
  if (code === 'N0198' || msg.includes('해당계좌 없음(412)')) {
    return {
      subCode: 'ACCOUNT_NOT_FOUND',
      message: '해당 계좌는 존재하지 않는 계좌입니다. 다시 확인해주세요.',
    };
  }

  // A0009 내부 세부 분기 (4번, 5번 모달)
  if (code === 'A0009') {
    if (msg.includes('예금주명 불일치(815)')) {
      return {
        subCode: 'NAME_MISMATCH',
        message: '실명과 예금주명이 일치하지 않는 계좌입니다. 다시 확인해주세요.',
      };
    }
    if (msg.includes('해약 계좌(415)') || msg.includes('사고 신고계좌(419)') || msg.includes('거래중지 계좌(420)')) {
      return {
        subCode: 'ACCOUNT_RESTRICTED',
        message: '입력하신 계좌는 현재 정상적인 거래가 불가능한 상태입니다. 은행 확인 후 다시 시도해 주세요.',
      };
    }
    if (msg.includes('잡좌(416)') || msg.includes('기타 처리불가(499)')) {
      return {
        subCode: 'UNSUPPORTED_TYPE',
        message: '해당 계좌는 정산용으로 등록할 수 없는 유형입니다. 원화 입출금이 가능한 보통예금 계좌로 다시 시도해 주세요.',
      };
    }
  }

  // 5. 거래 한도/횟수 초과 (8번 모달)
  if (msg.includes('초과') || msg.includes('횟수')) {
    return {
      subCode: 'LIMIT_EXCEEDED',
      message: '일일 계좌 인증 횟수를 초과했습니다. 보안을 위해 내일 다시 시도해 주세요.',
    };
  }

  // 기본 에러 처리 (입력값 오류 등)
  return {
    subCode: 'UNKNOWN_VERIFICATION_ERROR',
    message: msg || '계좌 인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
  };
};
