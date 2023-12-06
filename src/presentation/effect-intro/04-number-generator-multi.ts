import { Data, Duration, Effect, pipe, Random, ReadonlyArray, Schedule } from "effect"

const RetryPolicy = pipe(
  Schedule.exponential("100 millis", 2),
  Schedule.either(Schedule.spaced("3 seconds")),
  Schedule.upTo("30 seconds"),
  Schedule.tapOutput(([duration, count]) => Effect.log(`Retrying in ${Duration.format(duration)} (attempt ${count})`))
)

class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{
  value: number
}> {
  toString() {
    return `NumberTooLowError(${this.value.toString()})`
  }
}

const random = Effect.gen(function*($) {
  const value = yield* $(Random.nextIntBetween(1, 100))
  if (value === 13) {
    return yield* $(new UnluckyNumberError())
  }

  if (value < 50) {
    return yield* $(new NumberTooLowError({ value }))
  }

  return value
})

// This is a single effect ...
const single = random.pipe(
  Effect.catchTag("UnluckyNumberError", () => Effect.succeed(42)),
  Effect.retry(RetryPolicy),
  Effect.orDieWith((_) => `We tried our best but your number is still too low: ${_}`),
  Effect.tap((_) => Effect.log(`Your number is: ${_}`))
)

// ... But we can easily run multiple instances of it with a specific concurrency.
await Effect.runPromise(Effect.forEach(ReadonlyArray.range(1, 100), () => single, {
  concurrency: 10
}))
