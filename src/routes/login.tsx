import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { loginAccount } from "@/lib/store/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChannelStrip, SiteHeader } from "@/components/store-chrome";
import { useStoreSession } from "@/components/store-session";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { signIn } = useStoreSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await loginAccount({ data: { username, password } });
      await signIn(result.token);
      toast.success(`Welcome back, ${result.user.username}.`);
      void navigate({ to: "/account" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <ChannelStrip />
      <SiteHeader storeName="Enroll Log" />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="panel p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Account</p>
          <h1 className="mt-2 text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the username and password created when you pressed Start in the Mini App.
          </p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={4}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/app" className="text-foreground underline-offset-4 hover:underline">
              Open the Mini App and press Start
            </Link>{" "}
            to create a username, user ID and password automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
