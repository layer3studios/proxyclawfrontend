/**
 * Brand Config — THE ONLY FILE you edit to white-label the entire app.
 *
 * To rebrand: change values here  OR  set VITE_ env vars.
 * Every UI string, logo, color, and price reads from this file.
 */

// ─── Currency detection by browser locale ───────────────────────────────────

interface CurrencyInfo {
  code: string;       // ISO 4217
  symbol: string;
  amount: number;     // price in smallest unit (cents/paise)
  display: string;    // e.g. "$10", "₹799", "€9"
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  IN:  { code: 'INR', symbol: '₹',  amount: 84900,  display: '₹849' },
  US:  { code: 'USD', symbol: '$',  amount: 1000,   display: '$10' },
  GB:  { code: 'GBP', symbol: '£',  amount: 800,    display: '£8' },
  EU:  { code: 'EUR', symbol: '€',  amount: 900,    display: '€9' },
  DE:  { code: 'EUR', symbol: '€',  amount: 900,    display: '€9' },
  FR:  { code: 'EUR', symbol: '€',  amount: 900,    display: '€9' },
  IT:  { code: 'EUR', symbol: '€',  amount: 900,    display: '€9' },
  ES:  { code: 'EUR', symbol: '€',  amount: 900,    display: '€9' },
  NL:  { code: 'EUR', symbol: '€',  amount: 900,    display: '€9' },
  CA:  { code: 'CAD', symbol: 'C$', amount: 1400,   display: 'C$14' },
  AU:  { code: 'AUD', symbol: 'A$', amount: 1500,   display: 'A$15' },
  SG:  { code: 'SGD', symbol: 'S$', amount: 1300,   display: 'S$13' },
  AE:  { code: 'AED', symbol: 'د.إ', amount: 3700,  display: 'AED 37' },
  JP:  { code: 'JPY', symbol: '¥',  amount: 1500,   display: '¥1500' },
  MY:  { code: 'MYR', symbol: 'RM', amount: 4500,   display: 'RM45' },
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', amount: 1000, display: '$10' };

function detectCountry(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || '';
    // locale is like "en-US", "hi-IN", "en-GB"
    const parts = locale.split('-');
    if (parts.length >= 2) return parts[parts.length - 1].toUpperCase();
    // Fallback: check navigator.languages
    for (const lang of navigator.languages || []) {
      const p = lang.split('-');
      if (p.length >= 2) return p[p.length - 1].toUpperCase();
    }
  } catch {}
  return 'US';
}

export function getUserCurrency(): CurrencyInfo {
  const country = detectCountry();
  return CURRENCY_MAP[country] || DEFAULT_CURRENCY;
}

// ─── Brand config ───────────────────────────────────────────────────────────

export const BRAND = {
  // ── Identity ──
  name:  'ProxyClaw',
  tagline:        import.meta.env.VITE_BRAND_TAGLINE         || 'Deploy AI Agents with One Click',
  description:    import.meta.env.VITE_BRAND_DESCRIPTION     || 'makes it easy to deploy and manage autonomous AI agents. No Docker knowledge required.',

  // ── Links ──
  websiteUrl:     import.meta.env.VITE_WEBSITE_URL           || 'https://proxyclaw.com',
  supportEmail:   import.meta.env.VITE_SUPPORT_EMAIL         || 'support@simpleclaw.com',
  termsUrl:       import.meta.env.VITE_TERMS_URL             || '/terms',
  privacyUrl:     import.meta.env.VITE_PRIVACY_URL           || '/privacy',

  // ── Domain ──
  domain:         import.meta.env.VITE_DOMAIN                || 'proxyclaw.xyz',

  // ── Visual ──
  colors: {
    primary:      import.meta.env.VITE_COLOR_PRIMARY         || '#0F172A',
    accent:       import.meta.env.VITE_COLOR_ACCENT          || '#3B82F6',
  },

  // ── Payment ──
  requirePaymentToStart: true,

  // ── Plan details (display only) ──
  plan: {
    name:         'Starter',
    features: [
      '1 Active Agent',
      '0.75 vCPU · 768 MB RAM',
      'Auto-pause idle, instant resume',
      'Bring your own LLM key',
      'Email reminder before expiry',
    ],
    badge:        'FOUNDERS EDITION',
    seatsLabel:   'Founders',            // used in "X of Y Founders seats left"
    noAutoCharge: 'One-time payment · 30 days · No auto-charge',
  },

  // ── Footer ──
  footerText:     import.meta.env.VITE_FOOTER_TEXT           || '',

  // ── Auth page features list ──
  features: [
    { title: 'One-Click Deploy',   description: 'Deploy AI agents in seconds, not hours' },
    { title: 'Secure by Default',  description: 'AES-256-GCM encryption for all secrets' },
    { title: 'Auto-Scaling',       description: 'Containers scale with your needs' },
    { title: 'Isolated Runtime',   description: 'Each agent runs in its own container' },
  ],
} as const;

export function getFooterText(): string {
  return BRAND.footerText || `${BRAND.name} — ${BRAND.tagline}`;
}

export default BRAND;
