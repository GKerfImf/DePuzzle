import { config } from "dotenv";
config();

import mongoose from "mongoose";
import express, { Request, Response } from "express";
import cors from "cors";
import TranslationPair from "./models/translation_pair";
import shuffle from "./util/shuffle";
import zip from "./util/zip";
import Hint from "./util/hint";

const app = express();
app.use(cors({}));
app.use(
  cors({
    origin: ["https://de-puzzle.vercel.app/", "http://localhost:5174/"],
    methods: ["POST", "GET"],
  })
);
app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("success!");
  app.listen(5174);
});

app.get("/", async (req: Request, res: Response) => {
  res.json({
    version: "0.0.5",
  });
});

app.get("/main", async (req: Request, res: Response) => {
  const [index, original, translated] = await TranslationPair.countDocuments()
    .exec()
    .then((count: number) => {
      return Math.floor(Math.random() * count);
    })
    .then(async (index) => {
      const pair = await TranslationPair.findOne().skip(index);
      return [index, pair.original_sentence, pair.translated_sentence];
    });

  res.json({
    problem_id: index,
    to_translate: translated,
    shuffled_words: shuffle((original as string).split(" ")),
  });
});

app.post("/main", async (req: Request, res: Response) => {
  const correctWordOrder = await TranslationPair.findOne()
    .skip(req.body.sentence_index)
    .then((pair) => {
      return pair.original_sentence;
    })
    .then((sentence) => {
      return sentence.split(" ");
    });

  const currentSolution: string[] = req.body.solution;

  // TODO: handle correct solution

  const currentHints: Map<string, number> = new Map(
    Object.entries(JSON.parse(req.body.known_hints))
  );

  const newHints = new Map(currentHints);

  zip(currentSolution, correctWordOrder).forEach(
    (word: [string, string], index: number) => {
      if (word[0] == word[1]) {
        newHints.set(
          JSON.stringify({ word: word[0], index: index }),
          Hint.Correct
        );
      } else {
        newHints.set(
          JSON.stringify({ word: word[0], index: index }),
          Hint.Incorrect
        );
      }
    }
  );

  res.json({
    result: "Not a correct solution",
    hints: JSON.stringify(Object.fromEntries(newHints)),
  });
});
