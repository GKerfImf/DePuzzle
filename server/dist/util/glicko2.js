"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRatings = exports.getNewRating = void 0;
// @ts-ignore
const glicko2_1 = __importDefault(require("glicko2"));
const settings = {
    // tau : "Reasonable choices are between 0.3 and 1.2, though the system should
    //      be tested to decide which value results in greatest predictive accuracy."
    tau: 0.5,
    // rating : default rating
    rating: 1500,
    //rd : Default rating deviation
    //     small number = good confidence on the rating accuracy
    rd: 50,
    //vol : Default volatility (expected fluctation on the player rating)
    vol: 0.06,
};
const ranking = new glicko2_1.default.Glicko2(settings);
function getNewRating(elo) {
    const rating = {
        rating: elo ? elo : settings.rating,
        tau: settings.tau,
        rd: settings.rd,
        vol: settings.vol,
    };
    return rating;
}
exports.getNewRating = getNewRating;
function updateRatings(player1, player2, outcome) {
    const Alice = ranking.makePlayer(player1.rating, player1.rd, player1.vol);
    const Bob = ranking.makePlayer(player2.rating, player2.rd, player2.vol);
    // TODO: having one match is suboptimal, but it is not clear how to improve
    const matches = [];
    matches.push([Alice, Bob, outcome]);
    ranking.updateRatings(matches);
    const aliceNewRating = {
        rating: Alice.getRating(),
        tau: Alice._tau,
        rd: Alice.getRd(),
        vol: Alice.getVol(),
    };
    const bobNewRating = {
        rating: Bob.getRating(),
        tau: Bob._tau,
        rd: Bob.getRd(),
        vol: Bob.getVol(),
    };
    return [aliceNewRating, bobNewRating];
}
exports.updateRatings = updateRatings;
//# sourceMappingURL=glicko2.js.map