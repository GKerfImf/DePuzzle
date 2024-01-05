"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
exports.default = shuffle;
//# sourceMappingURL=shuffle.js.map