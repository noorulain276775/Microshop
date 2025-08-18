import mongoose, {Schema, Document, Model} from "mongoose";

export interface IUser extends Document {
    username:string;
    email:string;
    createdAt:Date;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);