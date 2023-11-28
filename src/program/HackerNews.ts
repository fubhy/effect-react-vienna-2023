import { HttpClient } from "@effect/platform-bun"
import { Context, Effect, Layer, Metric } from "effect"
import * as Metrics from "./Metrics.js"
import * as Model from "./Model.js"

export interface HackerNews {
  maxDocumentId: Effect.Effect<never, HttpClient.error.HttpClientError, number>
  documentById(id: number): Effect.Effect<never, HttpClient.error.HttpClientError, Model.Document>
}

// Defines a context tag for the `HackerNews` service.
export const HackerNews = Context.Tag<HackerNews>("HackerNews")

// Defines a layer for the `HackerNews` tag. This is the live representation of a service.
export const layer = Layer.effect(
  HackerNews,
  Effect.gen(function*($) {
    const defaultClient = yield* $(HttpClient.client.Client)
    const clientWithBaseUrl = defaultClient.pipe(
      HttpClient.client.filterStatusOk,
      HttpClient.client.mapRequest(HttpClient.request.prependUrl("https://hacker-news.firebaseio.com"))
    )

    const parseDocumentId = HttpClient.response.schemaBodyJson(Model.MaxItemIdSchema)
    const parseDocument = HttpClient.response.schemaBodyJson(Model.DocumentSchema)

    return HackerNews.of({
      maxDocumentId: HttpClient.request.get("/v0/maxitem.json").pipe(
        clientWithBaseUrl,
        Effect.andThen(parseDocumentId),
        // If the response is not a valid document, we can't really recover from that.
        Effect.catchTag("ParseError", (_) => Effect.die(_)),
        Effect.withSpan("HackerNews.FetchMaxDocumentId")
      ),
      documentById: (id: number) =>
        HttpClient.request.get(`/v0/item/${id}.json`).pipe(
          clientWithBaseUrl,
          Effect.andThen(parseDocument),
          // If the response is not a valid document, we can't really recover from that.
          Effect.catchTag("ParseError", (_) => Effect.die(_)),
          // Track various metrics for our requests.
          Metric.trackDuration(Metrics.FetchTimer),
          Metric.trackSuccessWith(Metrics.SuccessCounter, () => 1),
          Metric.trackErrorWith(Metrics.ErrorCounter, () => 1),
          Metric.trackDefectWith(Metrics.DefectCounter, () => 1),
          Effect.withSpan("HackerNews.FetchDocumentById", { attributes: { id } })
        )
    })
  })
)
