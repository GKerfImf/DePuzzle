"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const translation_pair_1 = __importDefault(require("./models/translation_pair"));
const shuffle_1 = __importDefault(require("./util/shuffle"));
const zip_1 = __importDefault(require("./util/zip"));
const hint_1 = __importDefault(require("./util/hint"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({}));
app.use((0, cors_1.default)({
    origin: ["https://de-puzzle.vercel.app/", "http://localhost:5174/"],
    methods: ["POST", "GET"],
}));
app.use(express_1.default.json());
mongoose_1.default.connect(process.env.MONGO_URL).then(() => {
    console.log("success!");
    app.listen(5174);
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        version: "0.0.5",
    });
}));
app.get("/main", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [index, original, translated] = yield translation_pair_1.default.countDocuments()
        .exec()
        .then((count) => {
        return Math.floor(Math.random() * count);
    })
        .then((index) => __awaiter(void 0, void 0, void 0, function* () {
        const pair = yield translation_pair_1.default.findOne().skip(index);
        return [index, pair.original_sentence, pair.translated_sentence];
    }));
    res.json({
        problem_id: index,
        to_translate: translated,
        shuffled_words: (0, shuffle_1.default)(original.split(" ")),
    });
}));
app.post("/main", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const correctWordOrder = yield translation_pair_1.default.findOne()
        .skip(req.body.sentence_index)
        .then((pair) => {
        return pair.original_sentence;
    })
        .then((sentence) => {
        return sentence.split(" ");
    });
    const currentSolution = req.body.solution;
    // TODO: handle correct solution
    const currentHints = new Map(Object.entries(JSON.parse(req.body.known_hints)));
    const newHints = new Map(currentHints);
    (0, zip_1.default)(currentSolution, correctWordOrder).forEach((word, index) => {
        if (word[0] == word[1]) {
            newHints.set(JSON.stringify({ word: word[0], index: index }), hint_1.default.Correct);
        }
        else {
            newHints.set(JSON.stringify({ word: word[0], index: index }), hint_1.default.Incorrect);
        }
    });
    res.json({
        result: "Not a correct solution",
        hints: JSON.stringify(Object.fromEntries(newHints)),
    });
}));
//# sourceMappingURL=index.js.map