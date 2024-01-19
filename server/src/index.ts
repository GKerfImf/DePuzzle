import { config } from "dotenv";
config();

import mongoose from "mongoose";
import express, { Request, Response } from "express";
import Puzzle from "./models/puzzle";
import User from "./models/user";
import shuffle from "./util/shuffle";
import zip from "./util/zip";
import Hint from "./util/hint";
import { getNewRating, updateRatings } from "./util/glicko2";

// ---- ---- ---- ----  ---- ---- ---- ----  ---- ---- ---- ----  ---- ---- ---- ----

const app = express();

// https://stackoverflow.com/a/18311469/8125485
// Add headers before the routes are defined
app.use((req, res, next) => {
  // Website you wish to allow to connect
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Origin", "https://de-puzzle.vercel.app");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Pass to next layer of middleware
  next();
});

app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("success!");
  app.listen(8080);
});

// ----------------------------------------------------------------

// https://firstdoit.com/quick-tip-one-liner-cookie-read-c695ecb4fe59
function getCookie(req: Request, key: string) {
  return ("; " + req.get("cookie"))
    .split("; " + key + "=")
    .pop()
    .split(";")
    .shift();
}

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
      rating: getNewRating(Number(puzzle[2])),
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
      rating: getNewRating(user),
      games_history: [],
    });
    await newPair.save();
  });
  res.json("done");
});

app.get("/", async (req: Request, res: Response) => {
  res.json({
    version: "0.0.8",
  });
});

async function getPuzzleIdsWithElo(min: number, max: number) {
  return await Puzzle.find(
    {
      "rating.rating": { $gte: min, $lte: max },
    },
    "_id"
  );
}

async function getRandomPuzzleWithElo(min: number, max: number) {
  const puzzleIDs = await getPuzzleIdsWithElo(min, max);
  const randomID = Math.floor(Math.random() * puzzleIDs.length);

  // TODO: handle puzzleIDs = []

  const randomPuzzle = await Puzzle.findById(puzzleIDs[randomID].id);
  const puzzle = {
    id: randomPuzzle.id,
    translated_sentence: randomPuzzle.translated_sentence,
    shuffled_sentence: {
      sentence: shuffle(randomPuzzle.original_sentence.sentence.split(" ")),
      language: randomPuzzle.original_sentence.language,
      taken_from: randomPuzzle.original_sentence.taken_from,
    },
    rating: randomPuzzle.rating,
  };
  return puzzle;
}

async function findUser(req: Request) {
  const visitor_id = getCookie(req, "visitor_id");
  const user = await User.findById(visitor_id);
  if (user) {
    return user;
  }
  const newUser = new User({
    _id: visitor_id,
    rating: getNewRating(),
  });
  await newUser.save();
  return newUser;
}

app.get("/get-new-puzzle", async (req: Request, res: Response) => {
  const user = await findUser(req);
  res.json(
    await getRandomPuzzleWithElo(
      user.rating.rating - user.rating.rd,
      user.rating.rating + user.rating.rd
    )
  );
});

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
  const user = await findUser(req);

  const puzzle = await Puzzle.findById(req.body.sentence_index);
  if (!puzzle) {
    res.status(404).send({ error: "Puzzle is not found" });
    throw Error("Puzzle is not found");
  }

  const [newUserRating, newPuzzleRating] = updateRatings(
    user.rating,
    puzzle.rating,
    result.isCorrect ? 1 : 0
  );

  user.rating = newUserRating;
  user.save();

  puzzle.rating = newPuzzleRating;
  puzzle.save();

  res.json(result);
});

app.get("/user-elo", async (req: Request, res: Response) => {
  const user = await findUser(req);
  res.json(user.rating.rating);
});
