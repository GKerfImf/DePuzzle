import mongoose from "mongoose";
import { RatingSchema, GameSchema } from "./schemas/rating";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    _id: String,
    rating: RatingSchema,
    games_history: [GameSchema],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
