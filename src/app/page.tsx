import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wordmark } from "@/components/wordmark";
import { ApiError, getHealth } from "@/lib/api/client";
import { cn } from "cn";

export const dynamic = "force-dynamic";

export default async function Home() {
  let health: Awaited<ReturnType<typeof getHealth>> | undefined;
  let error: string | undefined;

  try {
    health = await getHealth();
  } catch (err) {
    error = err instanceof ApiError ? `${err.message}: ${JSON.stringify(err.body)}` : String(err);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1>
          <Wordmark className="text-4xl" />
        </h1>
        <p className="text-muted-foreground">
          AI-tailored resumes and job applications, built from one reusable content library.
        </p>
        <div className="mt-2 flex gap-3">
          <Link href="/register" className={cn(buttonVariants({ variant: "default" }))}>
            Get started
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
            Log in
          </Link>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Backend health check</CardTitle>
          <CardDescription>
            Live result of <code>GET /api/v1/health</code> via <code>apiFetch()</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <pre
              data-testid="health-error"
              className="bg-destructive/10 text-destructive overflow-x-auto rounded-md p-3 text-sm"
            >
              {error}
            </pre>
          ) : (
            <pre
              data-testid="health-result"
              className="bg-muted overflow-x-auto rounded-md p-3 text-sm"
            >
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
