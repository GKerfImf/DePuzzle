import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

const TranslationPairSchema = new Schema({
  original_lang: String,
  translation_lang: String,
  original_sentence: String,
  translated_sentence: String,
});

const TranslationPairModel = mongoose.model(
  "TranslationPair",
  TranslationPairSchema
);

export default TranslationPairModel;
