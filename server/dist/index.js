"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
var Hint;
(function (Hint) {
    Hint[Hint["Correct"] = 0] = "Correct";
    Hint[Hint["Incorrect"] = 1] = "Incorrect";
    Hint[Hint["Unknown"] = 2] = "Unknown";
})(Hint || (Hint = {}));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.listen(5174);
// TODO: fetch from db
const sentenceOriginal = "Die deutsche Küche ist für ihre Wurstwaren und Brotvarianten bekannt.";
// TODO: will be obtained via [deepl]
const sentenceToTranslate = "German cuisine is known for its sausages and bread varieties.";
//
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
//
// https://gist.github.com/dev-thalizao/affaac253be5b5305e0faec3b650ba27
function zip(firstCollection, lastCollection) {
    const length = Math.min(firstCollection.length, lastCollection.length);
    const zipped = [];
    for (let index = 0; index < length; index++) {
        zipped.push([firstCollection[index], lastCollection[index]]);
    }
    return zipped;
}
app.get("/main", (req, res) => {
    res.json({
        to_translate: sentenceToTranslate,
        shuffled_words: shuffle(sentenceOriginal.split(" ")),
    });
});
app.post("/main", (req, res) => {
    const correctWordOrder = sentenceOriginal.split(" ");
    const currentSolution = req.body.solution;
    // TODO: handle correct solution
    const currentHints = new Map(Object.entries(JSON.parse(req.body.known_hints)));
    const newHints = new Map(currentHints);
    zip(currentSolution, correctWordOrder).forEach((word, index) => {
        if (word[0] == word[1]) {
            newHints.set(JSON.stringify({ word: word[0], index: index }), Hint.Correct);
        }
        else {
            newHints.set(JSON.stringify({ word: word[0], index: index }), Hint.Incorrect);
        }
    });
    res.json({
        result: "Not a correct solution",
        hints: JSON.stringify(Object.fromEntries(newHints)),
    });
});
//# sourceMappingURL=index.js.map