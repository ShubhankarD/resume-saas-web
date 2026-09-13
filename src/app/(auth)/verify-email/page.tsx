"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/client";
import { verifyEmail } from "@/lib/auth/api";

type Status = "verifying" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token — check the link from your email.");
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err, "Verification failed"));
      });
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === "verifying" && "Verifying your email…"}
          {status === "success" && "Email verified"}
          {status === "error" && "Verification failed"}
        </CardTitle>
        <CardDescription>
          {status === "success" && (
            <>
              You can now{" "}
              <Link href="/login" className="underline">
                log in
              </Link>
              .
            </>
          )}
          {status === "error" && (
            <span data-testid="verify-error" className="text-destructive">
              {message}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      {status === "error" && (
        <CardContent>
          <Link href="/register" className="text-sm underline">
            Register again
          </Link>
        </CardContent>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
