"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = zip;
//# sourceMappingURL=zip.js.map