import { Form, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json(user);
}

export default function DashboardPage() {
  const { id } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col">
      <h1>Hi, i'm Logged In and my ID is {id}</h1>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>
    </main>
  );
}
