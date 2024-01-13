import { config } from "dotenv";
config();

import mongoose from "mongoose";
import express, { Request, Response } from "express";
import cors from "cors";
import Puzzle from "./models/puzzle";
import User from "./models/user";
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

app.get("/add-dummy-users", async (req: Request, res: Response) => {
  const users = [1550, 1400];

  users.forEach(async (user: number, index: number) => {
    const newPair = new User({
      _id: index,
      rating: user,
      games_history: [],
    });
    await newPair.save();
  });
  res.json("done");
});

app.get("/", async (req: Request, res: Response) => {
  res.json({
    version: "0.0.7",
  });
});

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
  const randomPuzzle = await Puzzle.findById(puzzleIDs[randomID].id);
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

app.get(
  "/get-new-puzzle-auth",
  ClerkExpressWithAuth({}),
  async (req: WithAuthProp<Request>, res) => {
    const user = await User.findById(req.auth.userId);
    if (!user) {
      res.status(404).send({ error: "User is not found" });
      throw Error("User is not found");
    }
    res.json(
      await getRandomPuzzleWithElo(user.rating - 300, user.rating + 300)
    );
  }
);

const checkPuzzle = async (req: Request) => {
  const puzzle = await Puzzle.findById(req.body.sentence_index);
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
  return {
    isCorrect: isCorrect,
    hints: JSON.stringify(Object.fromEntries(newHints)),
  };
};

app.post("/check-puzzle", async (req: Request, res: Response) => {
  const result = await checkPuzzle(req);
  res.json(result);
});

app.post(
  "/check-puzzle-auth",
  ClerkExpressWithAuth({}),
  async (req: WithAuthProp<Request>, res) => {
    const result = await checkPuzzle(req);

    const user = await User.findById(req.auth.userId);
    if (!user) {
      res.status(404).send({ error: "User is not found" });
      throw Error("User is not found");
    }

    const puzzle = await Puzzle.findById(req.body.sentence_index);
    if (!puzzle) {
      res.status(404).send({ error: "Puzzle is not found" });
      throw Error("Puzzle is not found");
    }

    if (result.isCorrect) {
      user.rating += 10;
      puzzle.elo -= 10;
    } else {
      user.rating -= 10;
      puzzle.elo += 10;
    }
    user.save();
    puzzle.save();

    res.json(result);
  }
);

// Just to make sure that all users are in [User] collection
app.post(
  "/say-hi",
  ClerkExpressWithAuth({}),
  async (req: WithAuthProp<Request>, res) => {
    const user = await User.exists({ _id: req.auth.userId });
    if (user == null) {
      const newUser = new User({
        _id: req.auth.userId,
        rating: 1500,
      });
      await newUser.save();
    }
    res.json("hi");
  }
);

app.get(
  "/user-elo",
  ClerkExpressWithAuth({}),
  async (req: WithAuthProp<Request>, res) => {
    const user = await User.findById(req.auth.userId);
    if (!user) res.status(404).send({ error: "User is not found" });
    res.json(user.rating);
  }
);
