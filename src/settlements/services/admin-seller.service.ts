import { AdminSellerRepository } from '../repositories/admin-seller.repository';
import { AppError } from '../../errors/AppError';
import {
  BusinessSellerListItem,
  IndividualSellerListItem,
  PendingSellerDetail,
  PendingSellerListItem,
  PendingSellerListResponse,
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
