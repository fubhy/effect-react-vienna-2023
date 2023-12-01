# Vienna <3 Effect

Thanks for coming to my therapy session.

You can find the slides [here](./slides.pdf).

A video recording of the presentation will be available shortly.

# Example Application

This repository is intended to be used with [Bun](https://bun.sh) and [Docker](h). Optionally, if you are a happy [Nix](https://nixos.org/) user, you can use the included setup in this repository.

## Installation

After ensuring that `bun` is installed, it's time to pull in the package dependencies of these examples:

```sh
bun install
```

## Obseravilibt Infrastructure

This repository includes a minimal complementary [observability infrastructure stack](./docker-compose.yaml) featuring:

- Grafana (for metrics & traces visualisation): http://localhost:3030
- Tempo (for tracing)
- Prometheus (for metrics)
- OpenTelemetry Collector (for receiving & forwarding traces & metrics)

This is not required to run any of the examples. However, it's highly encouraged if you want to explore some of the observability features highlighted in the Effect example application.

In order to spin up these infrastructure components, make sure that `docker` and `docker compose` are available and functional, then run:

```sh
docker compose up
```

Grafana should now be available at http://localhost:3030.

## Non-Effect Examples

The non-Effect code examples can be found [here](./src/presentation/without-effect/).

Each example is executable. Simply run them like this:

```sh
bun src/presentation/without-effect/01-no-concurrency.ts
```

## Effect Intro

The (very) simple Effect introduction code can be found [here](./src/presentation/effect-intro/).

Each example is executable. Simply run them like this:

```sh
bun src/presentation/effect-intro/01-number-generator.ts
```

Feel free to play around & experiment with the example code and see what happens! The best way to learn is to get your hands dirty :-).

The Effect APIs are highly discoverable by design. Code auto-completion is your friend. The types will guide you.

## Effect HackerNews Scraper

You can find the Effect version of the HackerNews document scraper application [here](./src/program).

If you just want to run it, go ahead:

```sh
bun src/program/Main.ts
```

This will download up to 10.000 documents from the HackerNews API, print them on the console and gather some metrics & shallow traces whilst doing so.

If your observability stack is up & running, you should now start to see metrics & traces appearing in Grafana.

Play around with it and experiment a little bit!

# Effect

Welcome to Effect, a powerful TypeScript framework that provides a fully-fledged functional effect system with a rich standard library.

## Documentation

For detailed information and usage examples, please visit the [Effect website](https://www.effect.website/).

## Introduction to Effect

To get started with Effect, watch our introductory video on YouTube. This video provides an overview of Effect and its key features, making it a great starting point for newcomers:

[![Introduction to Effect](https://img.youtube.com/vi/SloZE4i4Zfk/maxresdefault.jpg)](https://youtu.be/SloZE4i4Zfk)

## Connect with Our Community

Join our vibrant community on Discord to interact with fellow developers, ask questions, and share your experiences. Here's the invite link to ourDiscord server: [Join Effect's Discord Community](https://discord.gg/hdt7t7jpvn).
