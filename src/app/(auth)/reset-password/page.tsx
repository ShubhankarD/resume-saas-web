"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/client";
import { resetPassword } from "@/lib/auth/api";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      resetPassword({ token: token ?? "", new_password: values.password }),
    onSuccess: () => setSubmitted(true),
  });

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid link</CardTitle>
          <CardDescription>
            Missing reset token — request a new link from{" "}
            <Link href="/forgot-password" className="underline">
              forgot password
            </Link>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password reset</CardTitle>
          <CardDescription>
            You can now{" "}
            <Link href="/login" className="underline">
              log in
            </Link>{" "}
            with your new password.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Choose a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p data-testid="form-error" className="text-destructive text-sm">
              {getErrorMessage(mutation.error, "Reset failed")}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
