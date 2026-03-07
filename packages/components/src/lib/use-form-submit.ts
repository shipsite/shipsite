"use client";

import { useState, useCallback } from "react";

export type FormStatus = "idle" | "loading" | "success" | "error";

export function useFormSubmit(action: string) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = useCallback(
    async (data: Record<string, string>) => {
      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch(action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          let msg = "Something went wrong. Please try again.";
          try {
            const body = await res.json();
            // Formspree returns { errors: [{ message }] }
            // Getform/Basin return { message }
            if (body.errors?.[0]?.message) msg = body.errors[0].message;
            else if (body.error) msg = body.error;
            else if (body.message) msg = body.message;
          } catch {
            // ignore JSON parse errors
          }
          setErrorMsg(msg);
          setStatus("error");
          return;
        }

        setStatus("success");

        // Push conversion event to GTM dataLayer (if GTM is loaded)
        if (typeof window !== "undefined" && Array.isArray((window as unknown as Record<string, unknown>).dataLayer)) {
          (window as unknown as Record<string, unknown[]>).dataLayer.push({
            event: "form_submission",
            form_action: action,
          });
        }
      } catch {
        setErrorMsg("Network error. Please check your connection and try again.");
        setStatus("error");
      }
    },
    [action],
  );

  return { status, errorMsg, submit };
}
