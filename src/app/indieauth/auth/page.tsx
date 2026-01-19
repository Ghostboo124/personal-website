import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// export const GET = async (request: Request) => {
//   // Get URL params
//   const { searchParams } = new URL(request.url);
//   if (searchParams.get("response_type") !== "code") {
//     return Response.json({ "ok": false, "error": "Response type must be code", "search_params": searchParams.toString() }, { status: 500 });
//   }

//   const response_type = searchParams.get("response_type");
//   const client_id = searchParams.get("client_id");
//   const redirect_uri = searchParams.get("redirect_uri");
//   const state = searchParams.get("state");
//   const code_challenge = searchParams.get("code_challenge");
//   const code_challenge_method = searchParams.get("code_challenge_method");
//   const scope = searchParams.get("scope");
//   const me = searchParams.get("me");;

//   return Response.json({
//     "ok": true,
//   });
// };

export default function AuthEndpoint() {
  return (
    <div className="dark frappe flex flex-col min-h-screen items-center justify-center font-sans bg-ctp-base">
      <main className="flex flex-1 overflow-auto w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-ctp-base sm:items-start text-ctp-text">
        <p>Hi</p>
      </main>
    </div>
  );
}
