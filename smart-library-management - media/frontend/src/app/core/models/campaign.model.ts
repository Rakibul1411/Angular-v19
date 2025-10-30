export interface Campaign {
  _id: string;
  name: string;
}

export interface CampaignListResponse {
  message: string;
  data: Campaign[];
  count: number;
}

export interface CampaignResponse {
  message: string;
  data: Campaign;
}
