import { NodeSdk } from "@effect/opentelemetry"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"

// Creates the live layer for the OpenTelemetry integration.
export const layer = NodeSdk.layer(() => ({
  resource: {
    serviceName: "scraper",
    serviceVersion: "1.0.0"
  },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: "http://127.0.0.1:4318/v1/traces"
    })
  ),
  metricReader: new PeriodicExportingMetricReader({
    exportIntervalMillis: 1000,
    exporter: new OTLPMetricExporter({
      url: "http://127.0.0.1:4318/v1/metrics"
    })
  })
}))
