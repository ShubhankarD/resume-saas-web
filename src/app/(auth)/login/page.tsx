"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api/client";
import { getMe, googleAuth, login } from "@/lib/auth/api";
import { useAuthStore } from "@/lib/auth/store";
import { storeTokens } from "@/lib/auth/token-storage";
import { GoogleSignInButton, isGoogleSignInConfigured } from "@/components/auth/GoogleSignInButton";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function finishLogin(accessToken: string, refreshToken: string) {
    storeTokens(refreshToken);
    useAuthStore.getState().setAccessToken(accessToken);
    // Fetch /me for the display name/plan tier the app shell shows next.
    const user = await getMe();
    setSession(accessToken, user);
    router.push("/dashboard");
  }

  const mutation = useMutation({
    mutationFn: (values: FormValues) => login({ ...values, captcha_token: "" }),
    onSuccess: (data) => finishLogin(data.access_token, data.refresh_token),
  });

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => googleAuth({ id_token: idToken }),
    onSuccess: (data) => finishLogin(data.access_token, data.refresh_token),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Welcome back.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="mb-0">
                Password
              </Label>
              <Link href="/forgot-password" className="text-muted-foreground text-xs underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p data-testid="form-error" className="text-destructive text-sm">
              {getErrorMessage(mutation.error, "Login failed")}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Logging in…" : "Log in"}
          </Button>
        </form>

        {isGoogleSignInConfigured() && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-xs">or</span>
              <div className="bg-border h-px flex-1" />
            </div>

            <GoogleSignInButton
              onIdToken={(idToken) => googleMutation.mutate(idToken)}
              disabled={googleMutation.isPending}
            />
            {googleMutation.isError && (
              <p className="text-destructive mt-2 text-sm">
                {getErrorMessage(googleMutation.error, "Google sign-in failed")}
              </p>
            )}
          </>
        )}

        <p className="text-muted-foreground mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
