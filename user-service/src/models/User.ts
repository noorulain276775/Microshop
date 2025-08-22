// src/models/User.ts
import { Schema, model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
