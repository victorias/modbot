import { LoaderFunction } from "react-router";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = ({ request }) =>
  authenticator.authenticate("twitch", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  });
