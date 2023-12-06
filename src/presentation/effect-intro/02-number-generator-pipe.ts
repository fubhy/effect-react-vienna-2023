import { Data, Effect, Match, pipe, Random } from "effect"

// A tagged error class.
class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{}> {}

// A simple effect program using pipe syntax. Note how the type signature includes both possible error types.
const random = Random.nextIntBetween(1, 100).pipe(
  Effect.andThen(pipe(
    Match.type<number>(),
    Match.when((_) => _ < 50, (_) => new NumberTooLowError()),
    Match.when((_) => _ === 13, (_) => new UnluckyNumberError()),
    Match.orElse((_) => Effect.succeed(_))
  ))
)

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
Effect.runSync(program)
