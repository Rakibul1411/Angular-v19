export interface Brand {
  _id: string;
  name: string;
}

export interface BrandListResponse {
  message: string;
  data: Brand[];
  count: number;
}

export interface BrandResponse {
  message: string;
  data: Brand;
}
