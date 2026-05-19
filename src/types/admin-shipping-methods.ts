export interface ShippingMethodItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  estimatedDays: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethodFormData {
  name: string;
  description: string;
  type: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingMethodRouteResponse {
  success: boolean;
  data?: { method: ShippingMethodItem };
  error?: { code: string; message: string };
  timestamp: string;
}

export interface ShippingMethodListRouteResponse {
  success: boolean;
  data?: { methods: ShippingMethodItem[] };
  error?: { code: string; message: string };
  timestamp: string;
}

export interface PublicShippingMethod {
  id: string;
  name: string;
  type: string;
  price: number;
  estimatedDays: string | null;
}

export interface PublicShippingMethodListRouteResponse {
  success: boolean;
  data?: { methods: PublicShippingMethod[] };
  error?: { code: string; message: string };
  timestamp: string;
}
