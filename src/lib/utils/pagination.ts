// src/lib/utils/pagination.ts
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const getPagination = ({ page = 1, limit = 10 }: PaginationParams) => {
  const take = Math.max(1, limit);
  const skip = Math.max(0, (page - 1) * limit);
  return { take, skip };
};

export const getPagingData = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    totalPages,
    currentPage: page,
    pageSize: limit,
    data,
  };
};
