import { Metric } from "effect"

export const SuccessCounter = Metric.counter("hackernews_fetch_success_count", {
  description: "The number of documents fetched successfully"
})

export const ErrorCounter = Metric.counter("hackernews_fetch_error_count", {
  description: "The number of recoverable errors encountered while fetching documents"
})

export const DefectCounter = Metric.counter("hackernews_fetch_defect_count", {
  description: "The number of defects encountered while fetching documents"
})

export const FetchTimer = Metric.timer("hackernews_fetch_timer")

export const BytesRead = Metric.counter("hackernews_bytes_read", {
  description: "The number of bytes read from HackerNews"
})
