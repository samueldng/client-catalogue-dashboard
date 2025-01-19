export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
}