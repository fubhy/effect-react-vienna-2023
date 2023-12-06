import { Data, Effect, pipe, Predicate, Random, ReadonlyArray, Schedule, ScheduleDecision } from "effect"

const RetryPolicy = pipe(
  Schedule.exponential("100 millis", 2),
  Schedule.either(Schedule.spaced("3 seconds")),
  Schedule.upTo("30 seconds")
)

class UnluckyNumberError extends Data.TaggedError("UnluckyNumberError")<{}> {}
class NumberTooLowError extends Data.TaggedError("NumberTooLowError")<{
  value: number
}> {}

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

// This is a single effect ...
const single = random.pipe(
  Effect.retry(RetryPolicy.pipe(
    Schedule.whileInput(Predicate.isTagged("NumberTooLowError")),
    Schedule.passthrough,
    Schedule.onDecision((error, decision) => {
      if (ScheduleDecision.isDone(decision)) {
        return Effect.log(`Not retrying after encountering a ${error} error`)
      }

      return Effect.log(`Retrying after encountering a ${error} error`)
    })
  )),
  Effect.catchTags({
    NumberTooLowError: (_) => Effect.dieMessage("We tried our best but your number is still too low"),
    UnluckyNumberError: (_) => Effect.succeed(42)
  }),
  Effect.tap((_) => Effect.log(`Your number is: ${_}`))
)

// ... But we can easily run multiple instances of it with a specific concurrency.
await Effect.runPromise(Effect.forEach(ReadonlyArray.range(1, 100), () => single, {
  concurrency: 10
}))
