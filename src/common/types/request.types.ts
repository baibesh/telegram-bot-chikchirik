export type RequestFormData = {
  services: { title: string }[];
  city_id: { title: string };
  start: string;
  end: string;
  address?: string | null;
  title: string;
  budget: number;
  description: string;
};

export type Response = {
  id: number;
  request_id: number;
  performer_id: number;
  message?: string;
  price_offer?: number;
  date_created: string;
};

export type Group = { group_id: string; title: string };
export type User = { id: number; firstName: string; lastName?: string };
