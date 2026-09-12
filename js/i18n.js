// Language state + path localization. Spanish is the unsuffixed default
// (content/modules/x.html); other languages add a suffix before the
// extension (content/modules/x.pt-BR.html). Switching language persists the
// choice and reloads — every piece of UI depends on the current language
// (sidebar, search index, whatever's on screen), so a full reload is far
// simpler and more reliable than trying to hot-swap it all in place.
const STORAGE_KEY = 'elg-lang';
export const DEFAULT_LANG = 'es';
export const LANGUAGES = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'pt-BR', label: 'PT', name: 'Português (Brasil)' },
];

export function getLang() {
  const saved = safeGet();
  if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('pt')) return 'pt-BR';
  return DEFAULT_LANG;
}

export function setLang(lang) {
  safeSet(lang);
  location.reload();
}

/** Inserts the language suffix before a path's extension. No-op for the default language. */
export function localizedPath(path, lang) {
  if (lang === DEFAULT_LANG) return path;
  return path.replace(/(\.[^./]+)$/, `.${lang}$1`);
}

/**
 * Fetches a JSON/text resource in `lang`, falling back to the default
 * language if the localized file doesn't exist yet (not translated).
 * Returns { data, usedFallback }.
 */
async function fetchLocalized(path, lang, parse) {
  if (lang !== DEFAULT_LANG) {
    const res = await fetch(localizedPath(path, lang));
    if (res.ok) return { data: await parse(res), usedFallback: false };
  }
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return { data: await parse(res), usedFallback: lang !== DEFAULT_LANG };
}

export function fetchLocalizedJson(path, lang) {
  return fetchLocalized(path, lang, res => res.json());
}
export function fetchLocalizedText(path, lang) {
  return fetchLocalized(path, lang, res => res.text());
}

/** Looks up `key` in `strings`, interpolating {placeholders} from `vars`. */
export function t(strings, key, vars) {
  let s = strings[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

/** Fills every data-i18n(-title|-placeholder|-aria-label) element from `strings`. */
export function applyStringsToDom(strings, root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(strings, el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(strings, el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(strings, el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-aria-label]').forEach(el => { el.setAttribute('aria-label', t(strings, el.dataset.i18nAriaLabel)); });
}

function safeGet() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function safeSet(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* private mode / storage disabled */ }
}
