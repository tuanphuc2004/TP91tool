export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";

  const isPlaceholder =
    url.includes("your-project-ref") ||
    publishableKey.includes("your-publishable") ||
    publishableKey.includes("your-anon");

  const validUrl = url.startsWith("https://") || url.startsWith("http://");

  return {
    url,
    publishableKey,
    configured: Boolean(validUrl && publishableKey.length > 10 && !isPlaceholder),
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv().configured;
}
