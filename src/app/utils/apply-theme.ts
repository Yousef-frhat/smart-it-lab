/**
 * Applies the given theme preference to <html>.
 * - 'dark'  → adds class "dark",  removes "light"
 * - 'light' → adds class "light", removes "dark"
 * - 'auto'  → reads prefers-color-scheme and applies 'dark' or 'light'
 *
 * The CSS variables in theme.css are scoped to html.dark and html.light,
 * so toggling these classes is all that is needed to switch the palette.
 */
export function applyTheme(theme: 'dark' | 'light' | 'auto'): void {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}
