export interface ListPendingQueryDto {
  page?: string;
  limit?: string;
}

export interface PendingSellerUserSummary {
  user_id: number;
  name: string;
  nickname: string;
  email: string;
  profile_image_url: string | null;
}

export interface PendingSellerListItem {
  user: PendingSellerUserSummary;
  business_number: string | null;
  company_name: string | null;
  representative_name: string | null;
  business_license_url: string | null;
  created_at: Date;
}

export interface PendingSellerListResponse {
  items: PendingSellerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
  };
}

export interface PendingSellerDetail extends PendingSellerListItem {
  bank_code: string;
  account_number: string;
  account_holder: string;
}

export interface ListSellersQueryDto {
  page?: string;
  limit?: string;
  search?: string;
}

export interface SettlementAccountSummary {
  bank_code: string;
  account_number: string;
  account_holder: string;
}

export interface IndividualSellerListItem {
  user_id: number;
  name: string;
  email: string;
  settlement_account: SettlementAccountSummary;
  created_at: Date;
}

export interface BusinessSellerListItem {
  user_id: number;
  profile_image_url: string | null;
  nickname: string;
  name: string;
  email: string;
  settlement_account: SettlementAccountSummary;
  created_at: Date;
}

export interface SellerListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
  };
}

export interface IndividualSellerDetail {
  user_id: number;
  profile_image_url: string | null;
  nickname: string;
  name: string;
  email: string;
  registration_type: 'INDIVIDUAL';
  settlement_account: SettlementAccountSummary;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessSellerDetail {
  user_id: number;
  profile_image_url: string | null;
  nickname: string;
  name: string;
  email: string;
  registration_type: 'BUSINESS';
  business_number: string | null;
  representative_name: string | null;
  company_name: string | null;
  business_license_url: string | null;
  settlement_account: SettlementAccountSummary;
  created_at: Date;
  updated_at: Date;
}
