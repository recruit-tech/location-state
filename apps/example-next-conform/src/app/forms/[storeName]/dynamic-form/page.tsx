import Form from "./form";

export default function Page({
  params: { storeName },
}: { params: { storeName: string } }) {
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
