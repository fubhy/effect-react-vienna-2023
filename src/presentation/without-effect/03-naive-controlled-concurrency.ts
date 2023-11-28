const fetchDocument = async (id: number): Promise<unknown> => {
  console.log(`Starting to fetch document ${id}`)
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
  console.log(`Finished fetching document ${id}`)
  return await response.json()
}

const fetchDocuments = async (ids: ReadonlyArray<number>, concurrency: number): Promise<Array<unknown>> => {
  const documents: Array<unknown> = []
  for (let i = 0; i < ids.length; i += concurrency) {
    const chunk = ids.slice(i, i + concurrency).map((_) => fetchDocument(_))
    documents.push(...(await Promise.all(chunk)))
  }
  return documents.flat()
}

export const main = async () => {
  const documents = await fetchDocuments([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 5)
  for (const document of documents) {
    console.log(`Document ${(document as any).id}: ${JSON.stringify(document)}`)
  }
}

main()
