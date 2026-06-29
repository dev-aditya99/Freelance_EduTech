export interface Category {
  _id: string;

  name: string;
  slug: string;

  description?: string;
  image?: string;

  parentCategory?: {
    _id: string;
    name: string;
    slug: string;
  } | null;

  isActive: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt: string;
}

export interface CategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
  pagination: CategoryPagination;
}

export interface CategoryResponse {
  success: boolean;
  category: Category;
}
