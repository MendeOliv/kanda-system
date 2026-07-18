export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  status: string;
  createdAt: string;
}
