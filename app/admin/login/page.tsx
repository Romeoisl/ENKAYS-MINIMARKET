import { AdminLoginForm } from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const params = await searchParams;
  const callbackUrl = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-100 px-4">
      <AdminLoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
