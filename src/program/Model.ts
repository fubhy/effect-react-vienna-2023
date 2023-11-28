import { Schema } from "@effect/schema"
import { ReadonlyArray, String } from "effect"

// https://github.com/HackerNews/API
const Poll = Schema.number.pipe(Schema.title("poll"), Schema.description("The pollopt's associated poll."))
const Id = Schema.number.pipe(Schema.title("id"), Schema.description("The item's unique id."))
const By = Schema.string.pipe(Schema.title("by"), Schema.description("The username of the item's author."))
const Time = Schema.number.pipe(
  Schema.transform(Schema.DateFromSelf, (_) => new Date(_), (_) => _.getTime()),
  Schema.title("time"),
  Schema.description("Creation date of the item, in Unix Time.")
)
const Text = Schema.string.pipe(Schema.title("text"), Schema.description("The comment, story or poll text. HTML."))
const Parent = Schema.number.pipe(
  Schema.title("parent"),
  Schema.description("The comment's parent: either another comment or the relevant story.")
)
const Kids = Schema.number.pipe(
  Schema.array,
  Schema.title("kids"),
  Schema.description("The ids of the item's comments, in ranked display order.")
)
const Url = Schema.string.pipe(Schema.title("url"), Schema.description("The URL of the story."))
const Score = Schema.number.pipe(
  Schema.title("score"),
  Schema.description("The story's score, or the votes for a pollopt.")
)
const Title = Schema.string.pipe(
  Schema.title("title"),
  Schema.description("The title of the story, poll or job. HTML.")
)
const Parts = Schema.number.pipe(
  Schema.array,
  Schema.title("parts"),
  Schema.description("A list of related pollopts, in display order.")
)
const Descendants = Schema.number.pipe(
  Schema.title("descendants"),
  Schema.description("In the case of stories or polls, the total comment count.")
)

export const MaxItemIdSchema = Schema.number.pipe(
  Schema.title("maxItemId"),
  Schema.description("The current largest item id.")
)

// Story: https://hacker-news.firebaseio.com/v0/item/8863.json?print=pretty
// Ask: https://hacker-news.firebaseio.com/v0/item/121003.json?print=pretty
export const StorySchema = Schema.struct({
  type: Schema.literal("story"),
  dead: Schema.optional(Schema.boolean).withDefault(() => false),
  deleted: Schema.optional(Schema.boolean).withDefault(() => false),
  by: Schema.optional(By).withDefault(() => String.empty),
  descendants: Schema.optional(Descendants).withDefault(() => 0),
  id: Id,
  kids: Schema.optional(Kids).withDefault(ReadonlyArray.empty),
  score: Schema.optional(Score).withDefault(() => 0),
  time: Schema.optional(Time),
  title: Schema.optional(Title).withDefault(() => String.empty),
  text: Schema.optional(Text).withDefault(() => String.empty),
  url: Schema.optional(Url)
}).pipe(Schema.title("Story"), Schema.description("A story"))

// Comment: https://hacker-news.firebaseio.com/v0/item/2921983.json?print=pretty
export const CommentSchema = Schema.struct({
  type: Schema.literal("comment"),
  by: Schema.optional(By).withDefault(() => String.empty),
  id: Id,
  kids: Schema.optional(Kids).withDefault(ReadonlyArray.empty),
  parent: Parent,
  text: Schema.optional(Text).withDefault(() => String.empty),
  time: Schema.optional(Time)
}).pipe(Schema.title("Comment"), Schema.description("A comment"))

// Job: https://hacker-news.firebaseio.com/v0/item/192327.json?print=pretty
export const JobSchema = Schema.struct({
  type: Schema.literal("job"),
  by: Schema.optional(By).withDefault(() => String.empty),
  id: Id,
  score: Schema.optional(Score).withDefault(() => 0),
  text: Schema.optional(Text).withDefault(() => String.empty),
  time: Schema.optional(Time),
  title: Schema.optional(Title).withDefault(() => String.empty),
  url: Schema.optional(Url)
}).pipe(Schema.title("Job"), Schema.description("A job"))

// Poll: https://hacker-news.firebaseio.com/v0/item/126809.json?print=pretty
export const PollSchema = Schema.struct({
  type: Schema.literal("poll"),
  by: Schema.optional(By).withDefault(() => String.empty),
  descendants: Schema.optional(Descendants).withDefault(() => 0),
  id: Id,
  kids: Schema.optional(Kids).withDefault(ReadonlyArray.empty),
  parts: Schema.optional(Parts).withDefault(ReadonlyArray.empty),
  score: Schema.optional(Score).withDefault(() => 0),
  text: Schema.optional(Text).withDefault(() => String.empty),
  time: Schema.optional(Time),
  title: Schema.optional(Title).withDefault(() => String.empty)
}).pipe(Schema.title("Poll"), Schema.description("A poll"))

// PollOption: https://hacker-news.firebaseio.com/v0/item/160705.json?print=pretty
export const PollOptionSchema = Schema.struct({
  type: Schema.literal("pollopt"),
  poll: Poll,
  by: Schema.optional(By).withDefault(() => String.empty),
  id: Id,
  score: Schema.optional(Score).withDefault(() => 0),
  text: Schema.optional(Text).withDefault(() => String.empty),
  time: Schema.optional(Time)
}).pipe(Schema.title("PollOpt"), Schema.description("A poll option"))

export type Document = Schema.Schema.To<typeof DocumentSchema>
export const DocumentSchema = Schema.union(
  StorySchema,
  CommentSchema,
  JobSchema,
  PollSchema,
  PollOptionSchema
)
