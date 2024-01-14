import mongoose, { InferSchemaType } from "mongoose";

const Schema = mongoose.Schema;

// We use or Glicko-2 rating system. For more detail, see
// [https://github.com/mmai/glicko2js]
const RatingSchema = new Schema({
  rating: Number,
  tau: Number,
  rd: Number,
  vol: Number,
});

type Rating = InferSchemaType<typeof RatingSchema>;

// TODO: maybe it should include IDs of opponents
// To challenge users with questions appropriate to their language level, we
// use the Glicko-2 scale for both puzzles and users.
const GameSchema = new Schema(
  {
    rating: RatingSchema,
    opponent_rating: RatingSchema,
    // [win] -- user solved the puzzle with the first try (from user's PoV)
    // [draw] -- user solved the puzzle with the second try (from user's PoV)
    // [lose] -- otherwise
    outcome: {
      type: String,
      enum: ["win", "draw", "lose"],
    },
  },
  { timestamps: true }
);

export { Rating, RatingSchema, GameSchema };
