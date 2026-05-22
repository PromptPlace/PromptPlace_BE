import { AdminSellerRepository } from '../repositories/admin-seller.repository';
import { AppError } from '../../errors/AppError';
import {
  BusinessSellerDetail,
  BusinessSellerListItem,
  IndividualSellerDetail,
  IndividualSellerListItem,
  PendingSellerDetail,
  PendingSellerListItem,
  PendingSellerListResponse,
  SellerCancellationResult,
  SellerListResponse,
} from '../dtos/admin-seller.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const parsePagination = (page?: string, limit?: string) => {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const safePage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
  const safeLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return { page: safePage, limit: safeLimit };
};

type SellerWithUser = Awaited<
  ReturnType<typeof AdminSellerRepository.findPendingBusinessSellerByUserId>
>;

const toListItem = (
  account: NonNullable<SellerWithUser>,
): PendingSellerListItem => ({
  user: {
    user_id: account.user.user_id,
    name: account.user.name,
    nickname: account.user.nickname,
    email: account.user.email,
    profile_image_url: account.user.profileImage?.url ?? null,
  },
  business_number: account.business_number,
  company_name: account.company_name,
  representative_name: account.representative_name,
  business_license_url: account.business_license_url,
  created_at: account.created_at,
});

const toDetail = (
  account: NonNullable<SellerWithUser>,
): PendingSellerDetail => ({
  ...toListItem(account),
  bank_code: account.bank_code,
  account_number: account.account_number,
  account_holder: account.account_holder,
});

export const listPendingBusinessSellers = async (
  pageParam?: string,
  limitParam?: string,
): Promise<PendingSellerListResponse> => {
  const { page, limit } = parsePagination(pageParam, limitParam);

  const [accounts, total] = await Promise.all([
    AdminSellerRepository.findPendingBusinessSellers((page - 1) * limit, limit),
    AdminSellerRepository.countPendingBusinessSellers(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    items: accounts.map(toListItem),
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
    },
  };
};

export const getPendingBusinessSellerDetail = async (
  userId: number,
): Promise<PendingSellerDetail> => {
  const account =
    await AdminSellerRepository.findPendingBusinessSellerByUserId(userId);

  if (!account) {
    throw new AppError(
      '해당 사용자의 승인 대기 중인 사업자 등록 신청이 존재하지 않습니다.',
      404,
      'PendingSellerNotFound',
    );
  }

  return toDetail(account);
};

export const approvePendingBusinessSeller = async (userId: number) => {
  const account =
    await AdminSellerRepository.findPendingBusinessSellerByUserId(userId);

  if (!account) {
    throw new AppError(
      '해당 사용자의 승인 대기 중인 사업자 등록 신청이 존재하지 않습니다.',
      404,
      'PendingSellerNotFound',
    );
  }

  await AdminSellerRepository.updateBusinessSellerStatus(userId, 'APPROVED');
};

export const rejectPendingBusinessSeller = async (userId: number) => {
  const account =
    await AdminSellerRepository.findPendingBusinessSellerByUserId(userId);

  if (!account) {
    throw new AppError(
      '해당 사용자의 승인 대기 중인 사업자 등록 신청이 존재하지 않습니다.',
      404,
      'PendingSellerNotFound',
    );
  }

  await AdminSellerRepository.updateBusinessSellerStatus(userId, 'REJECTED');
};

const normalizeSearch = (search?: string): string | undefined => {
  const trimmed = search?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const toSettlementAccountSummary = (account: NonNullable<SellerWithUser>) => ({
  bank_code: account.bank_code,
  account_number: account.account_number,
  account_holder: account.account_holder,
});

const toIndividualListItem = (
  account: NonNullable<SellerWithUser>,
): IndividualSellerListItem => ({
  user_id: account.user.user_id,
  name: account.user.name,
  email: account.user.email,
  settlement_account: toSettlementAccountSummary(account),
  created_at: account.created_at,
});

const toBusinessListItem = (
  account: NonNullable<SellerWithUser>,
): BusinessSellerListItem => ({
  user_id: account.user.user_id,
  profile_image_url: account.user.profileImage?.url ?? null,
  nickname: account.user.nickname,
  name: account.user.name,
  email: account.user.email,
  settlement_account: toSettlementAccountSummary(account),
  created_at: account.created_at,
});

const buildPagination = (page: number, limit: number, total: number) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    total_pages: totalPages,
    has_next: page < totalPages,
  };
};

export const listIndividualSellers = async (
  pageParam?: string,
  limitParam?: string,
  searchParam?: string,
): Promise<SellerListResponse<IndividualSellerListItem>> => {
  const { page, limit } = parsePagination(pageParam, limitParam);
  const search = normalizeSearch(searchParam);

  const [accounts, total] = await Promise.all([
    AdminSellerRepository.findApprovedSellers(
      'INDIVIDUAL',
      (page - 1) * limit,
      limit,
      search,
    ),
    AdminSellerRepository.countApprovedSellers('INDIVIDUAL', search),
  ]);

  return {
    items: accounts.map(toIndividualListItem),
    pagination: buildPagination(page, limit, total),
  };
};

export const listBusinessSellers = async (
  pageParam?: string,
  limitParam?: string,
  searchParam?: string,
): Promise<SellerListResponse<BusinessSellerListItem>> => {
  const { page, limit } = parsePagination(pageParam, limitParam);
  const search = normalizeSearch(searchParam);

  const [accounts, total] = await Promise.all([
    AdminSellerRepository.findApprovedSellers(
      'BUSINESS',
      (page - 1) * limit,
      limit,
      search,
    ),
    AdminSellerRepository.countApprovedSellers('BUSINESS', search),
  ]);

  return {
    items: accounts.map(toBusinessListItem),
    pagination: buildPagination(page, limit, total),
  };
};

const sellerNotFound = (sellerType: 'INDIVIDUAL' | 'BUSINESS') => {
  const label = sellerType === 'INDIVIDUAL' ? '개인' : '사업자';
  return new AppError(
    `해당 사용자의 승인 완료된 ${label} 판매자 등록 정보가 존재하지 않습니다.`,
    404,
    'SellerNotFound',
  );
};

export const getIndividualSellerDetail = async (
  userId: number,
): Promise<IndividualSellerDetail> => {
  const account = await AdminSellerRepository.findApprovedSellerByUserId(
    'INDIVIDUAL',
    userId,
  );

  if (!account) {
    throw sellerNotFound('INDIVIDUAL');
  }

  return {
    user_id: account.user.user_id,
    profile_image_url: account.user.profileImage?.url ?? null,
    nickname: account.user.nickname,
    name: account.user.name,
    email: account.user.email,
    registration_type: 'INDIVIDUAL',
    status: account.status,
    settlement_account: {
      bank_code: account.bank_code,
      account_number: account.account_number,
      account_holder: account.account_holder,
    },
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
};

export const getBusinessSellerDetail = async (
  userId: number,
): Promise<BusinessSellerDetail> => {
  const account = await AdminSellerRepository.findApprovedSellerByUserId(
    'BUSINESS',
    userId,
  );

  if (!account) {
    throw sellerNotFound('BUSINESS');
  }

  return {
    user_id: account.user.user_id,
    profile_image_url: account.user.profileImage?.url ?? null,
    nickname: account.user.nickname,
    name: account.user.name,
    email: account.user.email,
    registration_type: 'BUSINESS',
    status: account.status,
    business_number: account.business_number,
    representative_name: account.representative_name,
    company_name: account.company_name,
    business_license_url: account.business_license_url,
    settlement_account: {
      bank_code: account.bank_code,
      account_number: account.account_number,
      account_holder: account.account_holder,
    },
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
};

export const cancelSeller = async (
  userId: number,
): Promise<SellerCancellationResult> => {
  const account = await AdminSellerRepository.findApprovedSellerAnyType(userId);

  if (!account) {
    throw new AppError(
      '해당 사용자는 승인 완료된 판매자로 등록되어 있지 않습니다.',
      404,
      'SellerNotFound',
    );
  }

  const { deactivated_prompt_count } =
    await AdminSellerRepository.cancelSellerTransaction(userId);

  return { user_id: userId, deactivated_prompt_count };
};
