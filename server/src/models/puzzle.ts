import mongoose from "mongoose";
import { GameSchema } from "./schemas/rating";

const Schema = mongoose.Schema;

// After successfully solving a puzzle, the user is asked to answer some
// questions about the puzzle.
//
// The [ReplySchema] schema defines the set of possible answers.
const ReplySchema = new Schema(
  {
    reply: {
      type: String,
      enum: ["yes", "idk", "no"],
      default: "idk",
    },
  },
  { timestamps: true }
);
// And the [PollSchema] schema defines a question with the history of answers.
const PollSchema = new Schema({
  question: String,
  replies: [ReplySchema],
});

// A sentence is simply a string, its source language, and the source from
// which it was taken.
const SentenceSchema = new Schema({
  sentence: String,
  language: {
    type: String,
    enum: ["en", "de"],
  },
  taken_from: String,
});

const PuzzleSchema = new Schema(
  {
    // Original sentence taken somewhere from the internet. The original sentence
    // will be shuffled and presented as a puzzle. For now, it is always DE
    original_sentence: SentenceSchema,

    // Usually, it is just a DeepL-translation of the original sentence to EN
    translated_sentence: SentenceSchema,

    // The difficulty of solving the puzzle estimated via Glicko-2
    elo: Number, // TODO: rename to "rating"
    games_history: [GameSchema],

    // The set of polls for the puzzle
    polls: [PollSchema],
  },
  { timestamps: true }
);

const PuzzleModel = mongoose.model("Puzzle", PuzzleSchema);
export default PuzzleModel;
