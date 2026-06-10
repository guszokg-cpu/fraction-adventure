export function formatFraction(numerator: number, denominator: number) {
  return `${numerator}/${denominator}`;
}

export function compareFractions(leftNumerator: number, leftDenominator: number, rightNumerator: number, rightDenominator: number) {
  const left = leftNumerator * rightDenominator;
  const right = rightNumerator * leftDenominator;

  if (left === right) {
    return "=";
  }

  return left > right ? ">" : "<";
}
