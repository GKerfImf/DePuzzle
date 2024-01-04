import express, { Request, Response } from "express";
import cors from "cors";

enum Hint {
  Correct,
  Incorrect,
  Unknown,
}

const app = express();
app.use(
  cors({
    origin: ["https://de-puzzle.vercel.app/"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(express.json());
app.listen(5174);

// TODO: fetch from db
const sentenceOriginal =
  "Die deutsche Küche ist für ihre Wurstwaren und Brotvarianten bekannt.";

// TODO: will be obtained via [deepl]
const sentenceToTranslate =
  "German cuisine is known for its sausages and bread varieties.";

//
const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//
// https://gist.github.com/dev-thalizao/affaac253be5b5305e0faec3b650ba27
function zip<S1, S2>(
  firstCollection: Array<S1>,
  lastCollection: Array<S2>
): Array<[S1, S2]> {
  const length = Math.min(firstCollection.length, lastCollection.length);
  const zipped: Array<[S1, S2]> = [];

  for (let index = 0; index < length; index++) {
    zipped.push([firstCollection[index], lastCollection[index]]);
  }

  return zipped;
}

app.get("/main", (req: Request, res: Response) => {
  res.json({
    to_translate: sentenceToTranslate,
    shuffled_words: shuffle(sentenceOriginal.split(" ")),
  });
});

app.post("/main", (req: Request, res: Response) => {
  const correctWordOrder = sentenceOriginal.split(" ");

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
