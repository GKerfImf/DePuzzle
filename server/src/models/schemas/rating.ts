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

// To challenge users with questions appropriate to their language level, we
// use the Glicko-2 scale for both puzzles and users.
const GameSchema = new Schema(
  {
    puzzle_id: String,
    player_rating: RatingSchema,
    puzzle_rating: RatingSchema,
    // [win] -- user solved the puzzle
    // [lose] -- user failed to solved the puzzle
    // [pend] -- user has not yet tried to solve the puzzle
    outcome: {
      type: String,
      enum: ["win", "lose", "pend"],
    },
  },
  { timestamps: true }
);

export { Rating, RatingSchema, GameSchema };
