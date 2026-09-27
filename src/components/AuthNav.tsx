import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthUser, useSignOut } from "@/hooks/useAuth";

export function AuthNav() {
  const { data: user, isLoading } = useAuthUser();
  const signOut = useSignOut();

  if (isLoading) {
    return <span className="px-2 text-[15px] text-muted-foreground">Checking...</span>;
  }

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline" className="h-8 text-base">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="hidden max-w-40 truncate text-[15px] text-muted-foreground hover:text-foreground sm:inline"
      >
        {user.email}
      </Link>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 text-base"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        {signOut.isPending ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
