import { Request } from "express";

export enum EEventNames {
  ORDER_CREATED = "order_created",
  ORDER_CANCELLED = "order_cancelled",
  PAYMENT_APPROVED = "payment_approved",
  SHIPPING_APPROVED = "shipping_approved",
  PRODUCT_DELIVERED = "product_delivered",
  ORDER_EXPIRED = "order_expired",
}

export enum EOrderStatus {
  CREATED,
  PENDING,
  CANCELLED,
  SHIPPING,
  DELIVERED,
  EXPIRED,
}

export enum ESizes {
  SMALL,
  MEDIUM,
  LARGE,
}

type TProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  isAvailable: boolean;
  tags: string[];
  images: string[];
  videos: string[];
  info?: object;
};

type TProductAmount = {
  product: TProduct;
  amount: number;
};

export type TCreateOrderRequest = {
  items: TProductAmount[];
  createdAt: Date;
  status: EOrderStatus;
  user: TUser;
};

export type TCreateOrderResponse = TCreateOrderRequest & {
  id: string;
};

type TUser = {
  id: string;
  name: string;
  //more attrs
};

export type TPublishEvent = {
  name: EEventNames;
  payload: TPayloadTypes;
  TTL?: number;
};

export type TPayloadTypes = TCreateOrderResponse | TCreateOrderRequest;

export const SAVE_PRODUCTS_MIN = 15;
