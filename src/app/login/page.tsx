import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import AuthForm from "@/components/auth-form";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/notes");
  }

  return (
    <main className="authPage">
      <AuthForm />
    </main>
  );
}
