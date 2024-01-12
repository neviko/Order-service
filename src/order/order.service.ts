import { eventBridge } from "../services/aws";
import {
  EEventNames,
  EOrderStatus,
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
  }
};

const updateOrderDb = async (event: TPublishEvent) => {
  try {
    const updatedResult = await Order.findByIdAndUpdate(
      { _id: event.payload.id },
      event.payload
    );
  } catch (error) {
    console.log(error);
  }
};
