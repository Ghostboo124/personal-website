/*
introspection_endpoint_auth_methods_supported: [
  "none",
  "client_secret_basic",
  "client_secret_jwt",
],
*/

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const POST = async (request: Request) => {
  // Your introspection logic here
  return Response.json({});
};
