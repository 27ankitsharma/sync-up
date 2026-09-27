import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthUser, useSignOut } from "@/hooks/useAuth";

export function AuthNav() {
  const { data: user, isLoading } = useAuthUser();
  const signOut = useSignOut();

  if (isLoading) {
    return <span className="text-xs text-muted-foreground px-2">Checking...</span>;
  }

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline" className="h-8">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="hidden sm:inline max-w-40 truncate text-xs text-muted-foreground hover:text-foreground"
      >
        {user.email}
      </Link>
      <Button
        size="sm"
        variant="ghost"
        className="h-8"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        {signOut.isPending ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
