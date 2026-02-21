import React from 'react';

interface StepProps {
  title: string;
  description: string;
}

export function Step(_props: StepProps) {
  return null;
}

interface StepsProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Steps({ title, description, children }: StepsProps) {
  const steps: StepProps[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Step) {
      steps.push(child.props as StepProps);
    }
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container-main max-w-3xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>}
            {description && <p className="text-lg text-[var(--ss-text)]/60">{description}</p>}
          </div>
        )}
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--ss-primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-[var(--ss-primary-200)] mt-2" />}
              </div>
              <div className="pb-8">
                <h3 className="text-lg font-semibold text-[var(--ss-text)] mb-2">{step.title}</h3>
                <p className="text-[var(--ss-text)]/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
