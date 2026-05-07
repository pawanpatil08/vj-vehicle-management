export function compareFlatNumbers(a: string, b: string): number {
  const tokenize = (value: string) => value.match(/(\d+|\D+)/g) || [value];
  const aTokens = tokenize(a.toUpperCase());
  const bTokens = tokenize(b.toUpperCase());

  const minLen = Math.min(aTokens.length, bTokens.length);
  for (let i = 0; i < minLen; i += 1) {
    const aToken = aTokens[i];
    const bToken = bTokens[i];
    if (aToken === bToken) continue;

    const aIsNumber = /^\d+$/.test(aToken);
    const bIsNumber = /^\d+$/.test(bToken);

    if (aIsNumber && bIsNumber) {
      const diff = parseInt(aToken, 10) - parseInt(bToken, 10);
      if (diff !== 0) return diff;
      return aToken.length - bToken.length;
    }

    if (aIsNumber) return -1;
    if (bIsNumber) return 1;

    return aToken.localeCompare(bToken, undefined, { numeric: true, sensitivity: 'base' });
  }

  return aTokens.length - bTokens.length;
}
