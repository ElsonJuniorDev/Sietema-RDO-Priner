import express from "express";
import { autenticar } from "./auth.js";
import { errorHandler } from "./httpErrors.js";
import { createRdoRouter } from "./rdoRoutes.js";
import { createRdoStore } from "./rdoStore.js";

export function createApp(store = createRdoStore()) {
  const app = express();
  app.use(express.json());
  app.use("/api/rdos", autenticar, createRdoRouter(store));
  app.use(errorHandler);
  return app;
}
