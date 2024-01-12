import express, { Request, Response } from "express";
import { TCreateOrderRequest } from "./order.types";
import { createOrderHandler } from "./order.service";

const router = express.Router();

router.post("/api/orders", async (req: Request, res: Response) => {
  const order = <TCreateOrderRequest>req.body;
  const createdOrder = await createOrderHandler(order);
  if (createdOrder) {
    res.status(201).send({ order: createdOrder });
  } else {
    res.status(500).send({ message: "internal server error" });
  }
});

export { router as orderRouter };
