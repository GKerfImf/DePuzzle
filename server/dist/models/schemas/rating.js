"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSchema = exports.RatingSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
// We use or Glicko-2 rating system. For more detail, see
// [https://github.com/mmai/glicko2js]
const RatingSchema = new Schema({
    rating: Number,
    tau: Number,
    rd: Number,
    vol: Number,
});
exports.RatingSchema = RatingSchema;
// TODO: maybe it should include IDs of opponents
// To challenge users with questions appropriate to their language level, we
// use the Glicko-2 scale for both puzzles and users.
const GameSchema = new Schema({
    rating: RatingSchema,
    opponent_rating: RatingSchema,
    // [win] -- user solved the puzzle with the first try (from user's PoV)
    // [draw] -- user solved the puzzle with the second try (from user's PoV)
    // [lose] -- otherwise
    outcome: {
        type: String,
        enum: ["win", "draw", "lose"],
    },
}, { timestamps: true });
exports.GameSchema = GameSchema;
//# sourceMappingURL=rating.js.map