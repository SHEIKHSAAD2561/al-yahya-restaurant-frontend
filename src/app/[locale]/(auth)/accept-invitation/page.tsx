import { AcceptInvitationForm } from '@/features/auth/components/accept-invitation-form';

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AcceptInvitationForm token={token ?? ''} />;
}
