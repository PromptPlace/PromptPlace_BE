import { RegisterAccountDto, UpdateAccountDto } from "../dtos/account.dto";
import { AccountRepository } from "../repositories/account.repository";
import { AppError } from "../../errors/AppError";

export const AccountService = {
  registerAccount: async (userId: number, dto: RegisterAccountDto) => {
    const { bank_code, account_number, account_holder } = dto;

    // 1. 이미 계좌 등록 여부 확인
    const existingAccount = await AccountRepository.findUserBankAccount(userId);
    if (existingAccount) {
      throw new AppError("이미 등록된 계좌 정보가 있습니다.", 409, "AlreadyRegistered");
    }

    // 2. 유효한 은행 코드인지 확인
    const bank = await AccountRepository.findBankByCode(bank_code);
    if (!bank) {
      throw new AppError("유효하지 않은 은행 코드입니다.", 400, "InvalidBankCode");
    }

    // 3. 본인의 사전 등록 계좌 존재 여부 확인
    let prereg = await AccountRepository.findPreRegisteredAccount({
      bank_code,
      account_number,
      account_holder,
      owner_user_id: userId,
    });

    // 없다면 사전 등록 생성
    if (!prereg) {
      prereg = await AccountRepository.createPreRegisteredAccount({
        bank_code,
        account_number,
        account_holder,
        owner_user_id: userId,
      });
    }

    // 4. 계좌 등록
    const userAccount = await AccountRepository.createUserBankAccount({
      user_id: userId,
      preregistered_id: prereg.id,
    });

    return {
      message: "계좌 정보가 등록되었습니다.",
      account_id: userAccount.account_id,
      statusCode: 200,
    };
  },

  getAccountInfo: async (userId: number) => {
    const userAccount = await AccountRepository.getUserBankAccount(userId);

    if (!userAccount) {
      throw new AppError("등록된 계좌 정보가 없습니다.", 404, "NotFound");
    }

    const prereg = userAccount.preregistered;
    const bank = prereg.bank;

    return {
      message: "계좌 정보를 불러왔습니다.",
      data: {
        account_id: userAccount.account_id,
        bank_code: prereg.bank_code,
        bank_name: bank.name,
        account_number: prereg.account_number,
        account_holder: prereg.account_holder,
      },
      statusCode: 200,
    };
  },

  updateAccount: async (userId: number, dto: UpdateAccountDto) => {
  const userAccount = await AccountRepository.getUserBankAccount(userId);
  if (!userAccount) {
    throw new AppError("등록된 계좌 정보가 없습니다.", 404, "NotFound");
  }

  const bank = await AccountRepository.findBankByCode(dto.bank_code);
  if (!bank) {
    throw new AppError("유효하지 않은 은행 코드입니다.", 400, "InvalidBankCode");
  }

  // 1. 본인의 기존 사전 등록 계좌 중 동일 계좌 존재 여부 확인
  let prereg = await AccountRepository.findPreRegisteredAccount({
    bank_code: dto.bank_code,
    account_number: dto.account_number,
    account_holder: dto.account_holder,
    owner_user_id: userId,
  });

  // 2. 없다면 새로 생성
  if (!prereg) {
    prereg = await AccountRepository.createPreRegisteredAccount({
      bank_code: dto.bank_code,
      account_number: dto.account_number,
      account_holder: dto.account_holder,
      owner_user_id: userId,
    });
  }

  // 3. UserBankAccount에 연결된 preregistered_id 변경
  await AccountRepository.updateUserBankAccountPreregId(userId, prereg.id);

  return {
    message: "계좌 정보가 수정되었습니다.",
    statusCode: 200,
  };
},
};
