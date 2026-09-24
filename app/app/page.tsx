import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already guards this route. This second check keeps the page
  // safe on its own, in case the matcher is ever narrowed.
  if (!user) redirect("/login");

  return (
    <main className="p-8">
      <h1>Signed in</h1>
      <p>{user.email}</p>

      <form action="/auth/signout" method="post">
        <button type="submit" className="border px-4 py-2">
          Sign out
        </button>
      </form>
    </main>
  );
}
