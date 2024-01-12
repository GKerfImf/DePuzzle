import { config } from "dotenv";
config();

import mongoose from "mongoose";
import express, { Request, Response } from "express";
import cors from "cors";
import Puzzle from "./models/puzzle";
import shuffle from "./util/shuffle";
import zip from "./util/zip";
import Hint from "./util/hint";
import { WithAuthProp, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

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

// ----------------------------------------------------------------

app.get("/add-dummy-puzzles", async (req: Request, res: Response) => {
  const puzzles = [
    [
      "Guten Morgen, mein Name ist Klaus",
      "Good morning, my name is Klaus",
      1550,
    ],
    ["Ich bin Lehrer von Beruf", "I am a teacher by profession", 1600],
  ];

  puzzles.forEach(async (puzzle: string[]) => {
    const newPair = new Puzzle({
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
      elo: puzzle[2],
      games_history: [],
      polls: [],
    });
    await newPair.save();
  });
  res.json("done");
});

app.get(
  "/protected-endpoint",
  ClerkExpressWithAuth({}),
  (req: WithAuthProp<Request>, res) => {
    console.log("/GET @ protected-endpoint");
    res.json(req.auth);
  }
);

app.get("/", async (req: Request, res: Response) => {
  res.json({
    version: "0.0.7",
  });
});

async function getPuzzleById(objectId: string) {
  return await Puzzle.findById(objectId);
}

async function getPuzzleIdsWithElo(min: number, max: number) {
  return await Puzzle.find(
    {
      elo: { $gte: min, $lte: max },
    },
    "_id"
  );
}

async function getRandomPuzzleWithElo(min: number, max: number) {
  const puzzleIDs = await getPuzzleIdsWithElo(min, max);
  const randomID = Math.floor(Math.random() * puzzleIDs.length);
  const randomPuzzle = await getPuzzleById(puzzleIDs[randomID].id);
  const puzzle = {
    id: randomPuzzle.id,
    translated_sentence: randomPuzzle.translated_sentence,
    shuffled_sentence: {
      sentence: shuffle(randomPuzzle.original_sentence.sentence.split(" ")),
      language: randomPuzzle.original_sentence.language,
      taken_from: randomPuzzle.original_sentence.taken_from,
    },
    elo: randomPuzzle.elo,
  };
  return puzzle;
}

app.get("/get-new-puzzle", async (req: Request, res: Response) => {
  res.json(await getRandomPuzzleWithElo(1400, 1600));
});

app.post("/main", async (req: Request, res: Response) => {
  const puzzle = await getPuzzleById(req.body.sentence_index);
  const correctWordOrder: string[] =
    puzzle.original_sentence.sentence.split(" ");
  const currentSolution: string[] = req.body.solution;

  const currentHints: Map<string, number> = new Map(
    Object.entries(JSON.parse(req.body.known_hints))
  );

  var isCorrect = true;
  const newHints = new Map(currentHints);
  zip(currentSolution, correctWordOrder).forEach(
    (word: [string, string], index: number) => {
      if (word[0] == word[1]) {
        newHints.set(
          JSON.stringify({ word: word[0], index: index }),
          Hint.Correct
        );
      } else {
        isCorrect = false;
        newHints.set(
          JSON.stringify({ word: word[0], index: index }),
          Hint.Incorrect
        );
      }
    }
  );

  res.json({
    isCorrect: isCorrect,
    hints: JSON.stringify(Object.fromEntries(newHints)),
  });
});
