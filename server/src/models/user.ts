import mongoose, { InferSchemaType } from "mongoose";
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

type TUser = InferSchemaType<typeof UserSchema>;

const UserModel = mongoose.model("User", UserSchema);
export { TUser, UserModel };
