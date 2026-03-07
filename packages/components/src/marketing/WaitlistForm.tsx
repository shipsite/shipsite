"use client";

import React, { FormEvent, useId, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Section } from "../ui/section";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useFormSubmit } from "../lib/use-form-submit";

interface WaitlistFormProps {
  id?: string;
  action: string;
  title?: string;
  description?: string;
  badge?: string;
  showName?: boolean;
  nameLabel?: string;
  emailLabel?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
}

export function WaitlistForm({
  id,
  action,
  title = "Join the Waitlist",
  description,
  badge,
  showName = false,
  nameLabel = "Name",
  emailLabel = "Email",
  submitLabel = "Join Waitlist",
  successTitle = "You're on the list!",
  successMessage = "We'll notify you when it's your turn.",
}: WaitlistFormProps) {
  const uid = useId();
  const { status, errorMsg, submit } = useFormSubmit(action);
  const [fields, setFields] = useState({ name: "", email: "" });

  function update(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data: Record<string, string> = { email: fields.email };
    if (showName) data.name = fields.name;
    submit(data);
  }

  return (
    <Section id={id}>
      <div className="container-main max-w-2xl text-center">
        {badge && (
          <div className="mb-4">
            <Badge variant="outline">{badge}</Badge>
          </div>
        )}
        {(title || description) && (
          <div className="mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}

        {status === "success" ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {successTitle}
            </h3>
            <p className="text-muted-foreground">{successMessage}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass-1 rounded-2xl p-8 max-w-md mx-auto space-y-6"
          >
            {showName && (
              <div className="space-y-2 text-left">
                <Label htmlFor={`${uid}-name`}>{nameLabel}</Label>
                <Input
                  id={`${uid}-name`}
                  name="name"
                  placeholder="Your name"
                  value={fields.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>
            )}
            <div className="space-y-2 text-left">
              <Label htmlFor={`${uid}-email`}>{emailLabel}</Label>
              <Input
                id={`${uid}-email`}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={fields.email}
                onChange={(e) => update("email", e.target.value)}
                required
                disabled={status === "loading"}
              />
            </div>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                submitLabel
              )}
            </Button>
            {status === "error" && (
              <p className="text-sm text-destructive" aria-live="polite">
                {errorMsg}
              </p>
            )}
          </form>
        )}
      </div>
    </Section>
  );
}
