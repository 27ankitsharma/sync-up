import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthUser, useSignInWithEmail, useSignInWithGoogle } from "@/hooks/useAuth";

export default function Login() {
  const location = useLocation();
  const { data: user, isLoading } = useAuthUser();
  const signInWithGoogle = useSignInWithGoogle();
  const signInWithEmail = useSignInWithEmail();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const redirectPath = new URLSearchParams(location.search).get("redirect") || "/radar";
  const redirectTo = `${window.location.origin}${redirectPath}`;

  if (!isLoading && user) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      await signInWithEmail.mutateAsync({ email, redirectTo });
      setMessage("Check your email for a sign-in link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send sign-in link.");
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage(null);

    try {
      await signInWithGoogle.mutateAsync(redirectTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start Google sign in.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to SyncRadar</CardTitle>
          <CardDescription>
            Browse freely. Sign in to save quiz progress, Sync Score, bookmarks, and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={signInWithGoogle.isPending}
          >
            {signInWithGoogle.isPending ? "Opening Google..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={signInWithEmail.isPending}
            >
              {signInWithEmail.isPending ? "Sending..." : "Send magic link"}
            </Button>
          </form>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
