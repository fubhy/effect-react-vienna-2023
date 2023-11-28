const fetchDocument = async (id: number): Promise<unknown> => {
  console.log(`Starting to fetch document ${id}`)
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
  console.log(`Finished fetching document ${id}`)
  return await response.json()
}

const fetchDocuments = async (ids: ReadonlyArray<number>): Promise<Array<unknown>> => {
  const documents: Array<Promise<unknown>> = []
  for (const id of ids) {
    documents.push(fetchDocument(id))
  }
  return await Promise.all(documents)
}

export const main = async () => {
  const documents = await fetchDocuments([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  for (const document of documents) {
    console.log(`Document ${(document as any).id}: ${JSON.stringify(document)}`)
  }
}

main()
