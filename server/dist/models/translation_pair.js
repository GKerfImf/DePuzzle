"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const TranslationPairSchema = new Schema({
    original_lang: String,
    translation_lang: String,
    original_sentence: String,
    translated_sentence: String,
});
const TranslationPairModel = mongoose_1.default.model("TranslationPair", TranslationPairSchema);
exports.default = TranslationPairModel;
//# sourceMappingURL=translation_pair.js.map