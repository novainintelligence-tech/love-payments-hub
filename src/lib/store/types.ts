export type PublicProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number | null;
  is_featured: boolean;
  product_type: "key" | "file";
  stock: number;
  unlimited: boolean;
};

export type PublicCategory = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  products: number;
  stock: number;
  fileProducts: number;
};
