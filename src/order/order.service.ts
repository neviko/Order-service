import { eventBridge } from "../services/aws";
import {
  EEventNames,
  EOrderStatus,
  SAVE_PRODUCTS_MIN,
  TCreateOrderRequest,
  TCreateOrderResponse,
  TPayloadTypes,
  TPublishEvent,
} from "./order.types";

export const createOrderHandler = async (
  order: TCreateOrderRequest
): TCreateOrderResponse => {
  const { items, status, user } = order;
  try {
    const newOrder = await (<TCreateOrderResponse>Order.create(order)); // Order is a mongoose model
    await newOrder.save();
    await publishEvent({ name: EEventNames.ORDER_CREATED, payload: newOrder });
    await publishEvent({
      name: EEventNames.ORDER_EXPIRED,
      payload: newOrder,
      TTL: SAVE_PRODUCTS_MIN,
    });

    return newOrder;
  } catch (e) {
    // ERROR should be handled here
  }
};

// this function could be a general function and be stored inside an external package like npm package
// but for simplicity I'm writing it here
const publishEvent = async (event: TPublishEvent): Promise<boolean> => {
  try {
    await eventBridge.putEvents(event).promise();
    return true; // acknowledge received
  } catch (error) {
    return false;
  }
};

const onMessageReceived = async (event: TPublishEvent) => {
  switch (event.name) {
    case EEventNames.ORDER_CANCELLED:
      event.payload.status = EOrderStatus.CANCELLED;
      await updateOrderDb(event);

      break;

    case EEventNames.ORDER_CREATED:
      break;

    case EEventNames.PAYMENT_APPROVED:
      event.payload.status = EOrderStatus.SHIPPING;
      await updateOrderDb(event);

      break;

    case EEventNames.SHIPPING_APPROVED:
      event.payload.status = EOrderStatus.SHIPPING;
      await updateOrderDb(event);
      break;

    case EEventNames.PRODUCT_DELIVERED:
      event.payload.status = EOrderStatus.DELIVERED;
      await updateOrderDb(event);
      break;

    case EEventNames.ORDER_EXPIRED:
      await validateExpired(event.payload.id);
      await updateOrderDb(event);
      break;
  }
};

const updateOrderDb = async (
  id: string,
  order: TOrder
): TCreateOrderResponse => {
  try {
    return <TCreateOrderResponse>Order.findByIdAndUpdate({ _id: id }, order);
  } catch (error) {
    console.log(error);
  }
};

const validateExpired = async (id: string) => {
  try {
    const order = await (<TCreateOrderResponse>Order.findById(id));
    if (order.status === EOrderStatus.CREATED) {
      order.status = EOrderStatus.EXPIRED;
      await updateOrderDb(id, { order });
    }
  } catch (error) {
    // handle error
  }
};
