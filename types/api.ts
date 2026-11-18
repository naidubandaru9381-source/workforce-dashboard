export type ApiStatus = "success" | "error";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParam {
  field: string;
  direction: "asc" | "desc";
}