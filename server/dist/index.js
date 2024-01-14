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
const puzzle_1 = __importDefault(require("./models/puzzle"));
const user_1 = __importDefault(require("./models/user"));
const shuffle_1 = __importDefault(require("./util/shuffle"));
const zip_1 = __importDefault(require("./util/zip"));
const hint_1 = __importDefault(require("./util/hint"));
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const glicko2_1 = require("./util/glicko2");
// ---- ---- ---- ----  ---- ---- ---- ----  ---- ---- ---- ----  ---- ---- ---- ----
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
// ----------------------------------------------------------------
app.get("/add-dummy-puzzles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const puzzles = [
        [
            "Guten Morgen, mein Name ist Klaus",
            "Good morning, my name is Klaus",
            1550,
        ],
        ["Ich bin Lehrer von Beruf", "I am a teacher by profession", 1600],
    ];
    puzzles.forEach((puzzle) => __awaiter(void 0, void 0, void 0, function* () {
        const newPair = new puzzle_1.default({
            original_sentence: {
                sentence: puzzle[0],
                language: "de",
                taken_from: "GPT-4",
            },
            translated_sentence: {
                sentence: puzzle[1],
                language: "en",
                taken_from: "DeepL",
            },
            rating: (0, glicko2_1.getNewRating)(Number(puzzle[2])),
            games_history: [],
            polls: [],
        });
        yield newPair.save();
    }));
    res.json("done");
}));
app.get("/add-dummy-users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = [1550, 1400];
    users.forEach((user, index) => __awaiter(void 0, void 0, void 0, function* () {
        const newPair = new user_1.default({
            _id: index,
            rating: (0, glicko2_1.getNewRating)(user),
            games_history: [],
        });
        yield newPair.save();
    }));
    res.json("done");
}));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        version: "0.0.7",
    });
}));
function getPuzzleIdsWithElo(min, max) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield puzzle_1.default.find({
            "rating.rating": { $gte: min, $lte: max },
        }, "_id");
    });
}
function getRandomPuzzleWithElo(min, max) {
    return __awaiter(this, void 0, void 0, function* () {
        const puzzleIDs = yield getPuzzleIdsWithElo(min, max);
        const randomID = Math.floor(Math.random() * puzzleIDs.length);
        // TODO: handle puzzleIDs = []
        const randomPuzzle = yield puzzle_1.default.findById(puzzleIDs[randomID].id);
        const puzzle = {
            id: randomPuzzle.id,
            translated_sentence: randomPuzzle.translated_sentence,
            shuffled_sentence: {
                sentence: (0, shuffle_1.default)(randomPuzzle.original_sentence.sentence.split(" ")),
                language: randomPuzzle.original_sentence.language,
                taken_from: randomPuzzle.original_sentence.taken_from,
            },
            rating: randomPuzzle.rating,
        };
        return puzzle;
    });
}
app.get("/get-new-puzzle", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getRandomPuzzleWithElo(1400, 1600));
}));
app.get("/get-new-puzzle-auth", (0, clerk_sdk_node_1.ClerkExpressWithAuth)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.auth.userId);
    if (!user) {
        res.status(404).send({ error: "User is not found" });
        throw Error("User is not found");
    }
    res.json(yield getRandomPuzzleWithElo(user.rating.rating - user.rating.rd, user.rating.rating + user.rating.rd));
}));
const checkPuzzle = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const puzzle = yield puzzle_1.default.findById(req.body.sentence_index);
    const correctWordOrder = puzzle.original_sentence.sentence.split(" ");
    const currentSolution = req.body.solution;
    const currentHints = new Map(Object.entries(JSON.parse(req.body.known_hints)));
    var isCorrect = true;
    const newHints = new Map(currentHints);
    (0, zip_1.default)(currentSolution, correctWordOrder).forEach((word, index) => {
        if (word[0] == word[1]) {
            newHints.set(JSON.stringify({ word: word[0], index: index }), hint_1.default.Correct);
        }
        else {
            isCorrect = false;
            newHints.set(JSON.stringify({ word: word[0], index: index }), hint_1.default.Incorrect);
        }
    });
    return {
        isCorrect: isCorrect,
        hints: JSON.stringify(Object.fromEntries(newHints)),
    };
});
app.post("/check-puzzle", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield checkPuzzle(req);
    res.json(result);
}));
app.post("/check-puzzle-auth", (0, clerk_sdk_node_1.ClerkExpressWithAuth)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield checkPuzzle(req);
    const user = yield user_1.default.findById(req.auth.userId);
    if (!user) {
        res.status(404).send({ error: "User is not found" });
        throw Error("User is not found");
    }
    const puzzle = yield puzzle_1.default.findById(req.body.sentence_index);
    if (!puzzle) {
        res.status(404).send({ error: "Puzzle is not found" });
        throw Error("Puzzle is not found");
    }
    const [newUserRating, newPuzzleRating] = (0, glicko2_1.updateRatings)(user.rating, puzzle.rating, result.isCorrect ? 1 : 0);
    user.rating = newUserRating;
    user.save();
    puzzle.rating = newPuzzleRating;
    puzzle.save();
    res.json(result);
}));
// Just to make sure that all users are in [User] collection
app.post("/say-hi", (0, clerk_sdk_node_1.ClerkExpressWithAuth)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.exists({ _id: req.auth.userId });
    if (user == null) {
        const newUser = new user_1.default({
            _id: req.auth.userId,
            rating: (0, glicko2_1.getNewRating)(),
        });
        yield newUser.save();
    }
    res.json("hi");
}));
// TODO: ensure that [/say-hi] always runs first, and then replace [1500] with
// [user.rating.rating]
app.get("/user-elo", (0, clerk_sdk_node_1.ClerkExpressWithAuth)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.auth.userId);
    if (!user) {
        res.status(404).send({ error: "User is not found" });
        res.json(1500);
        return;
    }
    res.json(user.rating.rating);
}));
//# sourceMappingURL=index.js.map