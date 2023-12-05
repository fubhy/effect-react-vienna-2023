import { Chunk, Metric } from "effect"

export const SuccessCounter = Metric.counter("hackernews_fetch_success_count", {
  description: "The number of documents fetched successfully"
})

export const ErrorCounter = Metric.counter("hackernews_fetch_error_count", {
  description: "The number of recoverable errors encountered while fetching documents"
})

export const DefectCounter = Metric.counter("hackernews_fetch_defect_count", {
  description: "The number of defects encountered while fetching documents"
})

export const FetchTimer = Metric.timerWithBoundaries(
  "hackernews_fetch_timer",
  Chunk.fromIterable([
    20,
    40,
    60,
    80,
    100,
    110,
    120,
    130,
    140,
    150,
    160,
    170,
    180,
    190,
    200,
    250,
    300,
    350,
    400,
    450,
    500,
    600,
    700,
    800,
    900,
    1000
  ])
)

export const BytesRead = Metric.counter("hackernews_bytes_read", {
  description: "The number of bytes read from HackerNews"
})
