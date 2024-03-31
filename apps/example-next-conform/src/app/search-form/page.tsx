import Form from "./form";
import { type SearchParams, searchSchema } from "./schema";

export default async function Page({
  searchParams,
}: {
  searchParams: unknown;
}) {
  const validatedParams = searchSchema.safeParse(searchParams);
  if (!validatedParams.success) {
    throw new Error("invalid search params");
  }
  const searchResults = await searchPosts(validatedParams.data);

  return (
    <main>
      <h1>Post search form</h1>
      <p>note: not using `location state`</p>
      <Form
        defaultParams={validatedParams.data}
        // todo: fix key
        key={JSON.stringify(validatedParams.data)}
      />
      {searchResults && (
        <div>
          <h2>Search results</h2>
          <ul>
            {searchResults.map((post) => (
              <li key={post.title}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

async function searchPosts(params: SearchParams) {
  if (!params.title && !params.news && !params.tech) {
    return null;
  }
  // dummy data
  return [
    { title: "Debug Post", content: JSON.stringify(params) },
    { title: "Post 1", content: "This is post 1" },
    { title: "Post 2", content: "This is post 2" },
  ];
}
