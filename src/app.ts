import express from "express";
import cors from "cors";

import { json } from "body-parser";
import { orderRouter } from "./order/order.controller";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(json());
app.use(orderRouter);
app.all("*", async () => {
  // not found
});

export { app };
