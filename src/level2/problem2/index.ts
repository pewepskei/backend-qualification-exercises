export type DowntimeLogs = [Date, Date][];

export function merge(...args: DowntimeLogs[]): DowntimeLogs {
  const all = args.flat().sort((a, b) => a[0].getTime() - b[0].getTime());
  const merged: DowntimeLogs = [];

  for (const [start, end] of all) {
    if (merged.length === 0) {
      // first interval → just add
      merged.push([start, end]);
    } else {
      const last = merged[merged.length - 1];
      if (start > last[1]) {
        // no overlap → add new interval
        merged.push([start, end]);
      } else if (end > last[1]) {
        // overlap → extend last interval
        last[1] = end;
      }
    }
  }

  return merged;
}

