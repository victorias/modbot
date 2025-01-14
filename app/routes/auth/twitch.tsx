import { ActionFunction, LoaderFunction, redirect } from "react-router";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = () => redirect("/");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("twitch", request);
};
