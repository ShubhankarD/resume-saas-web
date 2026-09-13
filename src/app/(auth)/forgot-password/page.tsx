"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/client";
import { forgotPassword } from "@/lib/auth/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => forgotPassword(values),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          {/* The backend deliberately returns the same response whether or
              not the email is registered, to avoid account enumeration —
              mirror that here rather than showing anything more specific. */}
          <CardDescription>
            If that email is registered, we sent a password reset link to it.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>We&apos;ll email you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          {mutation.isError && (
            <p data-testid="form-error" className="text-destructive text-sm">
              {getErrorMessage(mutation.error, "Something went wrong")}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          <Link href="/login" className="text-foreground underline">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
