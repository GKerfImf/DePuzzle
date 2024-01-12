import mongoose from "mongoose";
import { GameSchema } from "./schemas/rating";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    _id: String,
    rating: Number,
    games_history: [GameSchema],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
