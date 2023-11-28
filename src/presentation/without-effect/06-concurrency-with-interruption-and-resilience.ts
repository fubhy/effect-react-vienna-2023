const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const withRetry = async <A>(fn: () => Promise<A>, delay: number = 100, retries: number = 3): Promise<A> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      console.log("Retries exhausted. Failing.")
      throw error
    }

    console.log(`Retrying after ${delay}ms...`)
    await wait(delay)
    return await withRetry(fn, delay, retries - 1)
  }
}

const fetchDocument = async (id: number, signal?: AbortSignal): Promise<unknown> =>
  withRetry(async () => {
    console.log(`Starting to fetch document ${id}`)
    // For demonstration purposes, we will abort the request if the id is 13.
    if (id === 13) {
      throw new Error("Unlucky number")
    }
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
      signal: signal ?? null
    })
    console.log(`Finished fetching document ${id}`)
    return await response.json()
  })

const fetchDocuments = async (ids: ReadonlyArray<number>, concurrency: number, signal?: AbortSignal): Promise<Array<unknown>> => {
  const controller = new AbortController()
  controller.signal.addEventListener("abort", () => console.log("Aborted"))
  signal?.addEventListener("abort", () => controller.abort())

  const remaining = ids.slice().map((id, index) => [id, index] as const).reverse()
  const documents: Array<unknown> = []
  return new Promise<Array<unknown>>((resolve, reject) => {
    let pending = 0

    const next = async () => {
      const [id, index] = remaining.pop()!
      try {
        pending++
        documents[index] = await fetchDocument(id, controller.signal)
        pending--
      } catch (error) {
        console.log(`Failed to fetch document ${id}. Aborting.`)
        controller.abort()
        return reject(error)
      }

      if (remaining.length > 0) {
        next()
      } else if (pending === 0) {
        resolve(documents)
      }
    }

    for (let i = 0; i < concurrency; i++) {
      next()
    }
  })
}

export const main = async () => {
  const documents = await fetchDocuments([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], 5)
  for (const document of documents) {
    console.log(`Document ${(document as any).id}: ${JSON.stringify(document)}`)
  }
}

main()
