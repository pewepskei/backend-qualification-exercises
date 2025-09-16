export class ExecutionCache<TInputs extends unknown[], TOutput> {
  private pending = new Map<string, Promise<TOutput>>();
  private results = new Map<string, TOutput>();

  constructor(private readonly handler: (...args: TInputs) => Promise<TOutput>) {}

  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    // console.log("Unique key is", key);

    // return cached result immediately
    if (this.results.has(key)) {
      return this.results.get(key)!;
    }

    // return in-progress promise if already running
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // start new execution
    const promise = this.handler(...args)
      .then(result => {
        this.results.set(key, result); // cache final result
        this.pending.delete(key);      // clean up pending
        return result;
      })
      .catch(err => {
        this.pending.delete(key);      // clean up on error
        throw err;
      });

    this.pending.set(key, promise);

    return promise;
  }
}
