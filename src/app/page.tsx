import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/notes");
  }

  redirect("/login");
}
