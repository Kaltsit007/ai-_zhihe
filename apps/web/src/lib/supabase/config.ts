/** Supabase 是否已配置。未配置时全站保持内存演示模式，不影响本地开发。 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const supabaseAnonKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
