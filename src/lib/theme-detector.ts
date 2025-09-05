import { cookies } from 'next/headers';

export async function getThemeFromCookies(): Promise<'light' | 'dark'> {
  try {
    const cookieStore = await cookies();
    const theme = cookieStore.get('theme')?.value;
    return theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  // This will be handled by the client-side script
  return 'light';
}
