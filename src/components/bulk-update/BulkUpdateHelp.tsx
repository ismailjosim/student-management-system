import { Info } from 'lucide-react';

const steps = [
  {
    step: 1,
    text: 'Copy a list of emails from your Google Sheet or database.',
  },
  {
    step: 2,
    text: 'Select the target assignment or field to update.',
  },
  {
    step: 3,
    text: 'Review the confirmation report after clicking "Process".',
  },
];

export function BulkUpdateHelp() {
  return (
    <div className="space-y-4">
      <div className="bg-background rounded-xl border shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Help Center
          </h2>
        </div>
        <ol className="space-y-4">
          {steps.map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                {step}
              </span>
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">⚠ Note</p>
        <p className="text-xs text-amber-700">
          Bulk updates are permanent. Unrecognized emails will be skipped and reported. Always
          verify the confirmation report before committing.
        </p>
      </div>
    </div>
  );
}
