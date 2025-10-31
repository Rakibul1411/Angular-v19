export interface AVCommunication {
  _id: string;
  fileName: string;
  filePath: string;
  description?: string;
  type: string;
  mimeType: string;
  fileSize: number;
  campaign: string;
  brand: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAVCommunicationDto {
  type: string;
  campaign: string;
  brand: string;
  description?: string;
  file: File;
}

export interface UpdateAVCommunicationDto {
  type?: string;
  campaign?: string;
  brand?: string;
  description?: string;
  file?: File;
}

export interface AVCommunicationListResponse {
  message: string;
  data: AVCommunication[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AVCommunicationResponse {
  message: string;
  data: AVCommunication;
}

export interface DeleteAVCommunicationResponse {
  message: string;
  deletedId: string;
}

export interface AVCommunicationFilter {
  page?: number;
  limit?: number;
}
