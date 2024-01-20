import { config } from "dotenv";
config();

import mongoose from "mongoose";
import express, { Request, Response } from "express";
import { PuzzleModel as Puzzle, TPuzzle } from "./models/puzzle";
import { UserModel as User, TUser } from "./models/user";
import shuffle from "./util/shuffle";
import zip from "./util/zip";
import Hint from "./util/hint";
import { getNewRating, computeNewRatings } from "./util/glicko2";

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
    "Origin,X-Requested-With,Content-Type,Set-Cookie"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Pass to next layer of middleware
  next();
});

app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Successfully connected do MongoDB!");
  app.listen(8080);
});

// ----------------------------------------------------------------

// https://firstdoit.com/quick-tip-one-liner-cookie-read-c695ecb4fe59
function getCookie(req: Request, key: string) {
  console.log("[getCookie] ");
  return ("; " + req.get("cookie"))
    .split("; " + key + "=")
    .pop()
    .split(";")
    .shift();
}

function getVisitorId(req: Request) {
  console.log("[getVisitorId] ");
  return req.query["visitor_id"];
}

// ----------------------------------------------------------------

app.get("/add-dummy-puzzles", async (req: Request, res: Response) => {
  const puzzles = [
    [
      "Der Schwierigkeitsgrad der Rätsel hängt von Ihrem Elo-Level ab",
      "The difficulty of the puzzles depends on your Elo level",
      1500,
    ],
  ];

  puzzles.forEach(async (puzzle: string[]) => {
    const newPair = new Puzzle({
      _id: "000000000000000000000003",
      original_sentence: {
        sentence: puzzle[0],
        language: "de",
        taken_from: "Dev.",
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
    version: "0.0.9",
  });
});

function shuffleOriginalSentence(puzzle: any) {
  return {
    id: puzzle.id,
    translated_sentence: puzzle.translated_sentence,
    shuffled_sentence: {
      sentence: shuffle(puzzle.original_sentence.sentence.split(" ")),
      language: puzzle.original_sentence.language,
      taken_from: puzzle.original_sentence.taken_from,
    },
    rating: puzzle.rating,
  };
}

async function getPuzzleIdsWithElo(
  min: number,
  max: number,
  ignoreList: string[]
) {
  const tutorials = [
    "000000000000000000000001",
    "000000000000000000000002",
    "000000000000000000000003",
  ];

  return await Puzzle.find({
    $and: [
      { _id: { $nin: [...ignoreList, ...tutorials] } },
      {
        "rating.rating": { $gte: min, $lte: max },
      },
    ],
  });
}

async function getRandomPuzzleWithElo(
  min: number,
  max: number,
  ignoreList: string[]
) {
  const puzzleIDs = await getPuzzleIdsWithElo(min, max, ignoreList);
  // TODO: handle puzzleIDs = []
  const randomID = Math.floor(Math.random() * puzzleIDs.length);
  return await Puzzle.findById(puzzleIDs[randomID].id);
}

async function findUser(req: Request) {
  console.log("[findUser]: call"); // TODO: logging

  try {
    const visitor_id = getVisitorId(req);
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
  } catch (e: any) {
    // TODO: probably not the most elegant way to do retry, fix?
    console.log("[findUser]: Failed to create a new user, retry"); // TODO: logging
    await new Promise((f) => setTimeout(f, Math.floor(Math.random() * 250)));
    return findUser(req);
  }
}

function findLastGameOfUser(user: TUser): any | null {
  if (!user.games_history.length) {
    return null;
  } else {
    return user.games_history.reduce((prev, curr) =>
      prev.updatedAt > curr.updatedAt ? prev : curr
    );
  }
}

const recordGame = async (user: any, puzzle: any, outcome: string) => {
  user.games_history.push({
    puzzle_id: puzzle._id,
    player_rating: user.rating,
    puzzle_rating: puzzle.rating,
    outcome: outcome,
  });
  await user.save();
};

// Note: there are only three steps in the tutorial, so hardcoding is fine
const isTutorial = (game: any): boolean => {
  const tutorial_1 = "000000000000000000000001";
  const tutorial_2 = "000000000000000000000002";
  const tutorial_3 = "000000000000000000000003";

  if (game == null) return true;
  if (game.puzzle_id == tutorial_1) return true;
  if (game.puzzle_id == tutorial_2) return true;
  if (game.puzzle_id == tutorial_3 && game.outcome == "pend") return true;

  return false;
};
const getNextTutorialProblem = (game: any): string => {
  const tutorial_1 = "000000000000000000000001";
  const tutorial_2 = "000000000000000000000002";
  const tutorial_3 = "000000000000000000000003";

  if (game == null) return tutorial_1;
  if (game.outcome == "pend") return game.puzzle_id;
  if (game.puzzle_id == tutorial_1) return tutorial_2;
  if (game.puzzle_id == tutorial_2) return tutorial_3;

  throw Error("[getNextTutorialProblem] unreachable statement");
};

const isFinished = (game: any): boolean => {
  return game!.outcome == "lose" || game!.outcome == "win";
};

app.get("/get-new-puzzle", async (req: Request, res: Response) => {
  console.log("/get-new-puzzle"); // TODO: logging
  const user: TUser = await findUser(req);

  var puzzle;
  const lastGame = findLastGameOfUser(user);
  if (isTutorial(lastGame)) {
    puzzle = await Puzzle.findById(getNextTutorialProblem(lastGame));
  } else if (!isFinished(lastGame)) {
    puzzle = await Puzzle.findById(lastGame.puzzle_id);
  } else {
    // Find a new game within the Elo range
    const wonGameIDs = user.games_history
      .filter((entry) => entry.outcome == "win")
      .map((entry) => entry.puzzle_id);
    puzzle = await getRandomPuzzleWithElo(
      user.rating.rating - user.rating.rd,
      user.rating.rating + user.rating.rd,
      wonGameIDs
    );
    recordGame(user, puzzle, "pend");
  }

  res.json(shuffleOriginalSentence(puzzle));
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

const updateRatings = (user: any, puzzle: any, isCorrect: boolean) => {
  const [newUserRating, newPuzzleRating] = computeNewRatings(
    user.rating,
    puzzle.rating,
    isCorrect ? 1 : 0
  );

  user.rating = newUserRating;
  user.save();

  puzzle.rating = newPuzzleRating;
  puzzle.save();
};

app.post("/check-puzzle", async (req: Request, res: Response) => {
  const result = await checkPuzzle(req);
  const user: TUser = await findUser(req);

  const puzzle: TPuzzle = await Puzzle.findById(req.body.sentence_index);
  if (!puzzle) {
    res.status(404).send({ error: "Puzzle is not found" });
    throw Error("Puzzle is not found");
  }
  await recordGame(user, puzzle, result.isCorrect ? "win" : "lose");

  // TODO: do not change User's elo after each try
  await updateRatings(user, puzzle, result.isCorrect);

  res.json(result);
});

app.get("/user-elo", async (req: Request, res: Response) => {
  console.log("/user-elo"); // TODO: logging
  const user: TUser = await findUser(req);
  res.json(user.rating.rating);
});
