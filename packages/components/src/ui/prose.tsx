import * as React from "react";

import { cn } from "../lib/utils";

const container = "prose-container mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)]";

function ProseH2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="prose-h2"
      className={cn(
        container,
        "mt-10 mb-4 text-[clamp(1.375rem,1.1rem+1.2vw,2.25rem)] font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function ProseH3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="prose-h3"
      className={cn(
        container,
        "mt-6 mb-3 text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function ProseH4({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="prose-h4"
      className={cn(
        container,
        "mt-4 mb-2 text-lg font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function ProseP({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="prose-p"
      className={cn(
        container,
        "my-2 text-base leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function ProseA({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="prose-a"
      className={cn(
        "text-primary font-medium underline hover:no-underline",
        className,
      )}
      {...props}
    />
  );
}

function ProseUl({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="prose-ul"
      className={cn(
        container,
        "my-3 list-disc pl-7 [&_ul]:my-1 [&_ul]:max-w-none [&_ul]:px-0 [&_ol]:my-1 [&_ol]:max-w-none [&_ol]:px-0",
        className,
      )}
      {...props}
    />
  );
}

function ProseOl({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="prose-ol"
      className={cn(
        container,
        "my-3 list-decimal pl-7 [&_ul]:my-1 [&_ul]:max-w-none [&_ul]:px-0 [&_ol]:my-1 [&_ol]:max-w-none [&_ol]:px-0",
        className,
      )}
      {...props}
    />
  );
}

function ProseLi({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="prose-li"
      className={cn("mt-1 leading-relaxed", className)}
      {...props}
    />
  );
}

function ProseBlockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <div className={container}>
      <blockquote
        data-slot="prose-blockquote"
        className={cn(
          "my-6 rounded-xl border-l-4 border-primary bg-muted/50 px-6 py-4 [&>p]:max-w-none [&>p]:px-0 [&>p]:my-1",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function ProsePre({ className, ...props }: React.ComponentProps<"pre">) {
  return (
    <div className={container}>
      <pre
        data-slot="prose-pre"
        className={cn(
          "my-6 overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function ProseCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="prose-code"
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.875em] [[data-slot=prose-pre]_&]:bg-transparent [[data-slot=prose-pre]_&]:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ProseHr({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="prose-hr"
      className={cn(
        container,
        "my-8 border-border",
        className,
      )}
      {...props}
    />
  );
}

function ProseImg({ className, alt, ...props }: React.ComponentProps<"img">) {
  return (
    <div className={container}>
      <img
        data-slot="prose-img"
        className={cn(
          "my-6 rounded-xl border border-border shadow-sm",
          className,
        )}
        alt={alt}
        {...props}
      />
    </div>
  );
}

export {
  ProseH2,
  ProseH3,
  ProseH4,
  ProseP,
  ProseA,
  ProseUl,
  ProseOl,
  ProseLi,
  ProseBlockquote,
  ProsePre,
  ProseCode,
  ProseHr,
  ProseImg,
};
