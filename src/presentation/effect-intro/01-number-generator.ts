import { Data, Effect, Random } from "effect"

// A tagged error class.
class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{}> {}

// A simple effect program using generator syntax. Note how the type signature includes both possible error types.
const fallible: Effect.Effect<never, UnluckyNumberError | NumberTooLowError, number> = Effect.gen(function*($) {
  const random: number = yield* $(Random.next)
  if (random === 13) {
    return yield* $(new UnluckyNumberError())
  }

  if (random < 5) {
    return yield* $(new NumberTooLowError())
  }

  return random
})

// Recovering from an error. Note how the error types have been eliminated from the type signature.
const program: Effect.Effect<never, never, number> = fallible.pipe(Effect.catchTags({
  // We can recover from the "NumberTooLowError" by returning the lowest possible number.
  NumberTooLowError: (_) => Effect.succeed(5),
  // We can recover from the "UnluckyNumberError" error by returning a "lucky" number instead.
  UnluckyNumberError: (_) => Effect.succeed(42)
}))

// Unlike Promises, which are eagerly executed, Effects are descriptions of programs, they are not executed until we run them.
const result: number = Effect.runSync(program)

// The result is a number, which is the result of the program.
console.log(result)