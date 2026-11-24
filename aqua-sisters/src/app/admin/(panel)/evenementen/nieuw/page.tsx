import { PageHeader, Flash } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth/session';
import { EventForm } from '../EventForm';

export default async function NewEvent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  return (
    <>
      <PageHeader title="Nieuw evenement" eyebrow="Evenementen" />
      <Flash error={error} />
      <EventForm />
      <p className="mt-6 text-sm text-muted">Na het aanmaken voeg je de tickettypes en prijzen toe.</p>
    </>
  );
}
