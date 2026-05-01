import axios from 'axios';
import { PAYPLE_BANKS } from '../constants/bank';
import { VerifyAccountRequestDto, AccountDataDto } from '../dtos/settlement.dto';
import { SettlementRepository } from '../repositories/settlement.repository';
import { AccountVerificationError, parseAccountVerificationError } from '../utils/payple';

export const verifyAndSaveAccount = async (userId: number, dto: VerifyAccountRequestDto) => {
  const { name, birthDate, bank, accountNumber, holderName } = dto;

  if (!name || !birthDate || !bank || !accountNumber || !holderName) {
    throw {
      status: 400,
      type: 'ValidationError',
      message: '필수 입력값(이름, 생년월일, 은행, 계좌번호, 예금주명)이 모두 입력되지 않았습니다.',
    };
  }

  if (!PAYPLE_BANKS[bank]) {
    throw {
      status: 400,
      type: 'InvalidAccountInfo',
      message: '유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다.',
    };
  }

  if (name !== holderName) {
    throw {
      status: 400,
      type: 'NameMismatch',
      message: '입력하신 실명/대표자명과 예금주명이 일치하지 않습니다.',
    };
  }

  const PAYPLE_HUB_URL = process.env.PAYPLE_HUB_URL;
  const cst_id = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;

  try {
    const authResponse = await axios.post(
      `${PAYPLE_HUB_URL}/oauth/token`,
      { cst_id, custKey, code: Math.random().toString(36).slice(2, 12) },
      { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
    );

    if (authResponse.data.result !== 'T0000') {
      throw new AccountVerificationError(
        `페이플 인증 실패: ${authResponse.data.message}`,
        'AUTH_FAILED'
      );
    }

    const accessToken = authResponse.data.access_token;

    const verifyResponse = await axios.post(
      `${PAYPLE_HUB_URL}/inquiry/real_name`,
      {
        cst_id,
        custKey,
        sub_id: `user_${userId}`,
        bank_code_std: bank,
        account_num: accountNumber,
        account_holder_info_type: '0',
        account_holder_info: birthDate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (verifyResponse.data.result !== 'A0000') {
      throw parseAccountVerificationError(verifyResponse.data);
    }

    if (verifyResponse.data.account_holder_name !== holderName) {
      throw new AccountVerificationError(
        '인증 실패: 실제 계좌의 예금주명과 다릅니다.',
        'NAME_MISMATCH'
      );
    }
  } catch (error: any) {
    if (error.name === 'AccountVerificationError') {
      throw {
        status: 400,
        type: error.subCode || 'AccountVerificationError',
        message: error.message,
      };
    }
    if (error.status) throw error;

    if (error.response?.status === 400 || error.response?.status === 404) {
      throw {
        status: 400,
        type: 'InvalidAccountInfo',
        message: '유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다.',
      };
    }

    throw {
      status: 500,
      type: 'InternalServerError',
      message: '알 수 없는 오류가 발생했습니다.',
    };
  }

  await SettlementRepository.upsertSettlementAccount(userId, dto);

  return { message: '계좌 인증이 완료되었습니다.' };
};

export const getAccountInfo = async (userId: number): Promise<AccountDataDto> => {
  const account = await SettlementRepository.findAccountByUserId(userId);

  if (!account) {
    const error: any = new Error('등록된 계좌 정보가 존재하지 않습니다.');
    error.statusCode = 404;
    error.code = 'AccountNotFound';
    throw error;
  }

  return {
    bank: account.bank_code,
    accountNumber: account.account_number,
    holderName: account.account_holder,
  };
};
