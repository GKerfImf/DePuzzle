"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const rating_1 = require("./schemas/rating");
const Schema = mongoose_1.default.Schema;
const UserSchema = new Schema({
    _id: String,
    rating: rating_1.RatingSchema,
    games_history: [rating_1.GameSchema],
}, { timestamps: true });
const UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = UserModel;
//# sourceMappingURL=user.js.map