import type { HttpClient } from "@effect/platform-bun"
import { Channel, Chunk, Effect, Stream } from "effect"
import * as HackerNews from "./HackerNews.js"
import type * as Model from "./Model.js"

// This is an advanced example for a continuous scraper that fetches documents from HackerNews using Streams.
export const make = (
  concurrency: number
): Effect.Effect<HackerNews.HackerNews, never, Stream.Stream<never, HttpClient.error.HttpClientError, Model.Document>> =>
  Effect.gen(function*($) {
    const hn = yield* $(HackerNews.HackerNews)
    const waitForLatestId = (currentId: number): Effect.Effect<never, never, number> =>
      Effect.gen(function*($) {
        const remoteId = yield* $(hn.maxDocumentId, Effect.orDie)
        if (remoteId > currentId) {
          return remoteId
        }

        yield* $(Effect.sleep("3 seconds"))
        return yield* $(waitForLatestId(currentId))
      })

    const fetchDocumentRange = (startId: number, latestId: number) =>
      Stream.range(startId, latestId).pipe(
        Stream.toChannel,
        Channel.concatMap(Channel.writeChunk),
        Channel.mapOutEffectPar((id) => hn.documentById(id).pipe(Effect.map((_) => Chunk.of(_))), concurrency),
        Stream.fromChannel
      )

    return Stream.unfoldEffect(
      1,
      (currentId) =>
        waitForLatestId(currentId).pipe(
          Effect.map((latestId) => [[currentId, latestId], latestId + 1] as const),
          Effect.asSome
        )
    ).pipe(
      Stream.flatMap(([currentId, latestId]) => fetchDocumentRange(currentId, latestId))
    )
  })
