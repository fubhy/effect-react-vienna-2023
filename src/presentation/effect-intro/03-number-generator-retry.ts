import { Data, Duration, Effect, pipe, Random, Schedule } from "effect"

// Composable schedules.
const RetryPolicy = pipe(
  // Exponential backoff with 100 miliseconds base delay and a growth factor of 2.
  Schedule.exponential("100 millis", 2),
  // With a maximum of 3 seconds delay between retries.
  Schedule.either(Schedule.spaced("3 seconds")),
  // And continue until a total of 30 seconds has elapsed.
  Schedule.upTo("30 seconds"),
  // Logging the retry attempts for debugging purposes.
  Schedule.tapOutput(([duration, count]) => Effect.log(`Retrying in ${Duration.format(duration)} (attempt ${count})`))
)

// A tagged error class.
class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{
  value: number
}> {
  toString() {
    return `NumberTooLowError(${this.value})`
  }
}

// A simple effect program using generator syntax. Note how the type signature includes both possible error types.
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

// Recovering from an error. Note how the caught `UnluckyNumberError` error type has been eliminated from the type signature.
// Although the `NumberTooLowError` error type is being retried it might not actually recover, hence it remains in the type signature.
const program = random.pipe(
  Effect.tapError((_) => Effect.log(`Error: ${_}`)),
  // We can recover from the "UnluckyNumberError" error by returning a "lucky" number instead.
  Effect.catchTag("UnluckyNumberError", () => Effect.succeed(42)),
  // At this point, only the `NumberTooLowError` remains. Retry it according to our schedule.
  Effect.retry(RetryPolicy),
  // If retrying is unsuccessful, we convert the error to a defect.
  Effect.orDieWith((_) => `We tried our best but your number is still too low: ${_}`),
  Effect.tap((_) => Effect.log(`Your number is: ${_}`))
)

// Unlike Promises, which are eagerly executed, Effects are descriptions of programs, they are not executed until we run them.
await Effect.runPromise(program)
