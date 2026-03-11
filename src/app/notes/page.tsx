import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import NotesApp from "@/components/notes-app";

export default async function NotesPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <NotesApp />;
}
