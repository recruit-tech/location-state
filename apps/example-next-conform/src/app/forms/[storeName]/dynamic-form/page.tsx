import Form from "./form";

export default async function Page({
  params,
}: {
  params: Promise<{ storeName: string }>;
}) {
  const { storeName } = await params;

  if (storeName !== "session" && storeName !== "url") {
    throw new Error("Invalid storeName");
  }
  return (
    <main>
      <h1>Dynamic Form</h1>
      <Form storeName={storeName} />
    </main>
  );
}
