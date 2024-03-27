import Form from "./form";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      layout form:
      <Form />
      {children}
    </>
  );
}
