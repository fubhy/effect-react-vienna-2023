import { Data, Effect, pipe, Predicate, Random, Schedule } from "effect"

// Composable schedules.
const RetryPolicy = pipe(
  // Exponential backoff with 100 miliseconds base delay and a growth factor of 2.
  Schedule.exponential("100 millis", 2),
  // With a maximum of 3 seconds delay between retries.
  Schedule.either(Schedule.spaced("3 seconds")),
  // And continue until a total of 30 seconds has elapsed.
  Schedule.upTo("30 seconds")
)

// A tagged error class.
class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{
  value: number
}> {
  toString(): string
  toString(): string {
    return this.value.toString()
  }
}

// A simple effect program using generator syntax. Note how the type signature includes both possible error types.
const random = Effect.gen(function*($) {
  const value = yield* $(Random.nextIntBetween(1, 100))
  if (value === 13) {
    return yield* $(new UnluckyNumberError())
  }

  if (value < 5) {
    return yield* $(new NumberTooLowError({ value }))
  }

  return value
})

// Recovering from an error. Note how the error types have been eliminated from the type signature.
const program = random.pipe(
  Effect.retry(RetryPolicy.pipe(
    // Only retry in case of a "NumberTooLowError".
    Schedule.whileInput(Predicate.isTagged("NumberTooLowError"))
  )),
  Effect.catchTags({
    // If retrying (see above) is unsuccessful, we let the program die.
    NumberTooLowError: (_) => Effect.dieMessage("We tried our best but your number is still too low"),
    // We can recover from the "UnluckyNumberError" error by returning a "lucky" number instead.
    UnluckyNumberError: (_) => Effect.succeed(42)
  }),
  Effect.tap((_) => Effect.log(`Your number is: ${_}`))
)

// Unlike Promises, which are eagerly executed, Effects are descriptions of programs, they are not executed until we run them.
Effect.runSync(program)
