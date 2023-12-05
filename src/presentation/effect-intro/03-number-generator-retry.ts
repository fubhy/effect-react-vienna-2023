import { Data, Effect, pipe, Random, Schedule } from "effect"

// Composable schedules.
const RetryPolicy = pipe(
  // Exponential backoff with 100 miliseconds base delay and a growth factor of 2.
  Schedule.exponential("100 millis", 2),
  // With a maximum of 2 seconds delay between retries.
  Schedule.either(Schedule.spaced("3 seconds")),
  // And continue until a total of 30 seconds has elapsed.
  Schedule.upTo("30 seconds")
)

// A tagged error class.
class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{}> {}

// A simple effect program using generator syntax. Note how the type signature includes both possible error types.
const fallible = Effect.gen(function*($) {
  const random = yield* $(Random.next)
  if (random === 13) {
    return yield* $(new UnluckyNumberError())
  }

  if (random < 5) {
    return yield* $(new NumberTooLowError())
  }

  return random
})

// Recovering from an error. Note how the error types have been eliminated from the type signature.
const program = fallible.pipe(Effect.catchTags({
  // We can recover from the "NumberTooLowError" by returning the lowest possible number.
  NumberTooLowError: (_) => Effect.retry(_, RetryPolicy).pipe(Effect.orDie),
  // We can recover from the "UnluckyNumberError" error by returning a "lucky" number instead.
  UnluckyNumberError: (_) => Effect.succeed(42)
}))

// Unlike Promises, which are eagerly executed, Effects are descriptions of programs, they are not executed until we run them.
const result = Effect.runSync(program)

// The result is a number, which is the result of the program.
console.log(result)
