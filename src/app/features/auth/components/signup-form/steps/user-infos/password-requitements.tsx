import { Check, X } from 'lucide-react';

export function PasswordRequirement({
  isValid,
  text
}: {
  isValid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-muted-foreground'}`}
    >
      {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  );
}
