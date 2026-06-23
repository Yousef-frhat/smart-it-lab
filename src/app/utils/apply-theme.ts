/**
 * Applies the given theme preference to <html>.
 * - 'dark'  → adds class "dark",  removes "light"
 * - 'light' → adds class "light", removes "dark"
 *
 * Only two modes are supported: dark and light. Any unexpected value
 * (e.g. a legacy 'auto' stored on an old account) falls back to 'dark'.
 *
 * The CSS variables in theme.css are scoped to html.dark and html.light,
 * so toggling these classes is all that is needed to switch the palette.
 */
export function applyTheme(theme: 'dark' | 'light'): void {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme === 'light' ? 'light' : 'dark');
}
