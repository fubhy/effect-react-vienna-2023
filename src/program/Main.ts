import { BunContext, HttpClient, Runtime } from "@effect/platform-bun"
import { Effect, Layer, Match, pipe, Random, ReadonlyArray, Schedule, Stream } from "effect"
import * as HackerNews from "./HackerNews.js"
import type * as Model from "./Model.js"
import * as Scraper from "./Scraper.js"
import * as Telemetry from "./Telemetry.js"

// Our reusable retry policy.
const RetryPolicy = pipe(
  Schedule.exponential("100 millis", 2),
  Schedule.either(Schedule.spaced("3 seconds")),
  Schedule.upTo("30 seconds")
)

// A pre-compiled pattern matcher for the `Document` type that logs fetched documents.
const logDocument = Match.type<Model.Document>().pipe(
  Match.discriminatorsExhaustive("type")({
    story: (_) => Effect.log(`Story: ${_.title}`),
    comment: (_) => Effect.log(`Comment: ${_.text}`),
    job: (_) => Effect.log(`Job: ${_.title}`),
    poll: (_) => Effect.log(`Poll: ${_.title}`),
    pollopt: (_) => Effect.log(`PollOpt: ${_.text}`)
  })
)

// This scraper is a more complex example utilizing streams with concurrency.
const scraper = Effect.gen(function*($) {
  const stream = yield* $(Scraper.make(5))
  yield* $(Stream.runForEach(stream, logDocument))
})

// This is a simple example that randomly fetches up to 1000 documents with a given concurrency.
const simple = Effect.gen(function*($) {
  // Load the `HackerNews` service.
  const hn = yield* $(HackerNews.HackerNews)

  // Fetch the maximum document id and generate a random number between 1 and the maximum for our range.
  const max = yield* $(hn.maxDocumentId, Effect.orDie)
  const from = yield* $(Random.nextIntBetween(1, max))

  // Create a range of up to 10.000 document ids starting from a random id.
  const range = ReadonlyArray.range(from, Math.min(max, from + 10000))

  yield* $(
    // Fetch all documents in range with a concurrency of 3.
    Effect.forEach(range, (id) => {
      return hn.documentById(id).pipe(
        // Note how we can use the retry policy to retry the effect.
        Effect.retry(RetryPolicy),
        // If retrying is unsuccessful, we convert the error to a defect.
        Effect.orDie,
        // Log successfully fetched documents.
        Effect.tap(logDocument),
        Effect.withSpan("Main.DownloadDocument")
      )
    }, { concurrency: 3 })
  )
})

// This are the ready-to-use dependencies of our program.
const MainLive = Layer.mergeAll(
  Layer.provide(HackerNews.layer, HttpClient.client.layer),
  Telemetry.layer,
  BunContext.layer
)

// Run the program.
const runnable = Effect.provide(simple, MainLive)
Runtime.runMain(runnable.pipe(Effect.catchAllCause(Effect.logError)))
