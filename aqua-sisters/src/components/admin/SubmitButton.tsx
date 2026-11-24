'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ children, className = 'btn btn-primary btn-sm', confirm, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      {...rest}
    >
      {pending ? 'Bezig…' : children}
    </button>
  );
}
