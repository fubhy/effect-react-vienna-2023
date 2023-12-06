import { Data, Effect, Random } from "effect"

// A tagged error class.
class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{}> {}

// A simple effect program using generator syntax. Note how the type signature includes both possible error types.
const random = Effect.gen(function*($) {
  const value = yield* $(Random.nextIntBetween(1, 100))
  if (value === 13) {
    return yield* $(new UnluckyNumberError())
  }

  if (value < 5) {
    return yield* $(new NumberTooLowError())
  }

  return value
})

// Recovering from an error. Note how the error types have been eliminated from the type signature.
const program = random.pipe(
  Effect.catchTags({
    // We can recover from the "NumberTooLowError" by returning the lowest possible number.
    NumberTooLowError: (_) => Effect.succeed(5),
    // We can recover from the "UnluckyNumberError" error by returning a "lucky" number instead.
    UnluckyNumberError: (_) => Effect.succeed(42)
  }),
  Effect.tap((_) => Effect.log(`Your number is: ${_}`))
)

// Unlike Promises, which are eagerly executed, Effects are descriptions of programs, they are not executed until we run them.
const result = Effect.runSync(program)

// The output is a number (as expected).
console.log(result)
