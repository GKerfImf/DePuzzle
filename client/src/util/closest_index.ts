import Coordinate from "./coordinate";

function findClosestIndex(coord: Coordinate[], p: Coordinate): number | null {
  function skewedDistance(p1: Coordinate, p2: Coordinate): number {
    // Controls the effect of each component on the total distance. When
    // one drags a word, this function calculates the distance to the
    // closest non-dragged word. If there are multiple rows, we would
    // like the dragged word to favor words on the same row over words
    // on other rows. The Y-axis has a higher multiplier to force such
    // behavior.
    const MULT_X = 1;
    const MULT_Y = 10;

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(MULT_X * dx * dx + MULT_Y * dy * dy);
  }

  if (coord.length === 0) {
    return null;
  }

  let closestIndex = 0;
  let closestDistance = skewedDistance(coord[0], p);

  for (let i = 1; i < coord.length; i++) {
    const currentDistance = skewedDistance(coord[i], p);
    if (currentDistance < closestDistance) {
      closestIndex = i;
      closestDistance = currentDistance;
    }
  }

  return closestIndex;
}

export default findClosestIndex;
