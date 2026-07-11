import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    // If the session isn't valid, kick them back to the login page
    redirect("/auth/test");
  }

  return <h1>Welcome to your dashboard, {user.username}!</h1>;
}
