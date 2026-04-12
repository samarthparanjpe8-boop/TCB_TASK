import mongoose from "mongoose";
import { HttpError } from "./httpErrors.js";

export function parseObjectId(id: string, label = "id"): mongoose.Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(id);
}
