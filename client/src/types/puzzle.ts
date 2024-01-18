type TShuffledSentence = {
  sentence: string[];
  language: string;
  taken_from: string;
};

type TSentence = {
  sentence: string;
  language: string;
  taken_from: string;
};

type TRating = {
  rating: number;
  rd: number;
  tau: number;
  vol: number;
};

type TPuzzle = {
  id: string;
  shuffled_sentence: TShuffledSentence;
  translated_sentence: TSentence;
  rating: TRating;
};
