import { Form } from "@remix-run/react";

export default function Login() {
  return (
    <Form action="/auth/twitch" method="post">
      <button>Login with Twitch</button>
    </Form>
  );
}
