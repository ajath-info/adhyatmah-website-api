'use client';
import { GlobalStyles as MuiGlobalStyles, useTheme } from '@mui/material';

const LIGHT = {
    // ---- Adhyatmah Panchang palette ----------------------------------
    // Silver Blue #DDE6F5 | Royal Blue #173B67 | Saffron #F28C28
    // Soft Gold #D6A84F   | Ivory #FAFBFD      | Deep Navy #12233F
    '--pm-navy': '#12233F', // main text (Deep Navy)
    '--pm-navy-soft': '#2B4568', // secondary text
    '--pm-accent': '#C96A0A', // saffron used as TEXT / icon / border (darker for contrast)
    '--pm-muted': '#5A6B85',
    '--pm-border': '#D3DEF0',
    '--pm-icon-bg': '#DDE6F5', // Moon Silver Blue
    '--pm-surface-alt': '#FAFBFD', // Ivory (zebra rows, inputs)
    '--pm-solid-navy': '#173B67', // Royal Blue used as a BACKGROUND (buttons, dots)
    '--pm-on-solid': '#FFFFFF',
    '--pm-accent-solid': '#F28C28', // Saffron used as a BACKGROUND (CTA, selected tab / chip)
    '--pm-solid-hover': '#0F2D52',
    '--pm-accent-hover': '#D97A14', // hover for saffron buttons
    '--pm-royal': '#173B67', // selected date / strong data
    '--pm-gold': '#D6A84F', // Soft Gold highlight
    '--pm-gold-text': '#8A6417', // gold used as TEXT on light bg
    '--pm-gold-bg': 'rgba(214, 168, 79, 0.16)',
    '--pm-gold-border': 'rgba(214, 168, 79, 0.45)',
    '--pm-lav': '#4F5FA8', // Vrat: soft lavender-blue text
    '--pm-lav-bg': '#E8ECF8',
    '--pm-hero-rgb': '234, 240, 250', // fade colour laid over hero banner images
    '--pm-img-tint': 'rgba(255, 255, 255, 0)', // tint over decorative light images
    '--pm-aus': '#173B67',
    '--pm-aus-bg': '#DDE6F5',
    '--pm-inaus': '#5A6B85',
    '--pm-inaus-bg': '#E7ECF4',
    '--pm-neutral': '#6F85A8',
    '--pm-neutral-bg': '#EDF2FA',
    '--pm-best': '#8A6417',
    '--pm-best-bg': 'rgba(214, 168, 79, 0.20)',
    '--pm-page-bg': '#FAFBFD',
    '--pm-soft-bg': '#F3F6FC',
    '--pm-soft-bg-2': '#E9EFF9',
    '--pm-glass': 'rgba(255, 255, 255, 0.75)',
    '--pm-warm-bg': '#FEF4E6',
    '--pm-warm-bg-2': '#FDEBD3',
    '--pm-warm-hover': '#FBDDB5',
    '--pm-warm-border': '#F4CFA0',
    '--pm-warm-grad': 'linear-gradient(135deg, #FDEBD3 0%, #FBF1DC 100%)',
    '--pm-sel-bg': '#FDEBD3',
    '--pm-fest-bg': '#FFF9F0',
    '--pm-saffron': '#E07B12',
    '--pm-plain-bg': '#F7F9FD',
    '--pm-white-bg': '#FFFFFF',
    '--pm-badge-bg': 'rgba(255, 255, 255, 0.95)', // small badges laid over photos
    '--pm-green-bg': '#F4F8EE',
    '--pm-green-border': '#DCE9C9',
    '--pm-green-text': '#15803D',
    '--pm-quote-grad': 'linear-gradient(135deg, #E9F0FB 0%, #DDE6F5 100%)',
    '--pm-icon-bg-hover': '#CDDAEF',
    '--pm-good': '#2E9E5B',
    '--pm-warn': '#D97706',
    '--pm-bad': '#C0392B',
    '--pm-page-grad': 'linear-gradient(180deg, #DDE6F5 0%, #EEF2FA 40%, #FAFBFD 100%)',
    '--pm-hero-grad': 'linear-gradient(135deg, #DDE6F5 0%, #CBD9EF 45%, #EEF3FB 100%)',
    '--pm-shadow': '0 6px 24px rgba(23, 59, 103, 0.08)',
    '--pm-shadow-lg': '0 16px 44px rgba(23, 59, 103, 0.14)'
};

const DARK = {
    '--pm-navy': '#EAF0FA',
    '--pm-navy-soft': '#C5D2E8',
    '--pm-accent': '#F5A04A', // saffron text on dark
    '--pm-muted': '#9FB0CC',
    '--pm-border': 'rgba(221, 230, 245, 0.16)',
    '--pm-icon-bg': 'rgba(221, 230, 245, 0.10)',
    '--pm-surface-alt': 'rgba(255, 255, 255, 0.04)',
    '--pm-solid-navy': '#2D5F9E', // Royal Blue lifted so it reads on dark navy
    '--pm-on-solid': '#FFFFFF',
    '--pm-accent-solid': '#F28C28',
    '--pm-solid-hover': '#3C74BA',
    '--pm-accent-hover': '#F9A04D',
    '--pm-royal': '#2D5F9E',
    '--pm-gold': '#E0B960',
    '--pm-gold-text': '#E6C26E',
    '--pm-gold-bg': 'rgba(214, 168, 79, 0.16)',
    '--pm-gold-border': 'rgba(214, 168, 79, 0.40)',
    '--pm-lav': '#A9B8F0',
    '--pm-lav-bg': 'rgba(169, 184, 240, 0.14)',
    '--pm-hero-rgb': '11, 22, 42',
    '--pm-img-tint': 'rgba(11, 22, 42, 0.82)',
    '--pm-aus': '#9CC0F0',
    '--pm-aus-bg': 'rgba(156, 192, 240, 0.16)',
    '--pm-inaus': '#B6C3DA',
    '--pm-inaus-bg': 'rgba(182, 195, 218, 0.12)',
    '--pm-neutral': '#A8BCDD',
    '--pm-neutral-bg': 'rgba(168, 188, 221, 0.12)',
    '--pm-best': '#E6C26E',
    '--pm-best-bg': 'rgba(214, 168, 79, 0.20)',
    '--pm-page-bg': 'rgba(255, 255, 255, 0.03)',
    '--pm-soft-bg': 'rgba(255, 255, 255, 0.06)',
    '--pm-soft-bg-2': 'rgba(221, 230, 245, 0.14)',
    '--pm-glass': 'rgba(255, 255, 255, 0.06)',
    '--pm-warm-bg': 'rgba(242, 140, 40, 0.10)',
    '--pm-warm-bg-2': 'rgba(242, 140, 40, 0.14)',
    '--pm-warm-hover': 'rgba(242, 140, 40, 0.22)',
    '--pm-warm-border': 'rgba(242, 140, 40, 0.32)',
    '--pm-warm-grad': 'linear-gradient(135deg, rgba(242, 140, 40, 0.16) 0%, rgba(214, 168, 79, 0.06) 100%)',
    '--pm-sel-bg': 'rgba(242, 140, 40, 0.18)',
    '--pm-fest-bg': 'rgba(242, 140, 40, 0.07)',
    '--pm-saffron': '#F5A04A',
    '--pm-plain-bg': '#0B1628',
    '--pm-white-bg': '#0B1628',
    '--pm-badge-bg': 'rgba(11, 22, 42, 0.92)',
    '--pm-green-bg': 'rgba(120, 180, 70, 0.10)',
    '--pm-green-border': 'rgba(120, 180, 70, 0.28)',
    '--pm-green-text': '#4ADE80',
    '--pm-quote-grad': 'linear-gradient(135deg, rgba(221, 230, 245, 0.14) 0%, rgba(221, 230, 245, 0.05) 100%)',
    '--pm-icon-bg-hover': 'rgba(221, 230, 245, 0.20)',
    '--pm-good': '#4ADE80',
    '--pm-warn': '#FBBF24',
    '--pm-bad': '#FF8A7A',
    '--pm-page-grad': 'linear-gradient(180deg, #0B1628 0%, #0F1E38 50%, #0B1628 100%)',
    '--pm-hero-grad': 'linear-gradient(135deg, #12284A 0%, #183560 45%, #0D1B34 100%)',
    '--pm-shadow': '0 6px 24px rgba(0, 0, 0, 0.35)',
    '--pm-shadow-lg': '0 16px 44px rgba(0, 0, 0, 0.5)'
};

// Mount once, high in the spiritual layout.
export default function PanchangThemeVars() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const vars = {
        ...(isDark ? DARK : LIGHT),
        // panels follow whatever the site theme already uses for cards, so
        // our panels never look different from the rest of the page
        '--pm-surface': theme.palette.background.paper
    };
    return <MuiGlobalStyles styles={{ ':root': vars }} />;
}

// Handy aliases for use inside `sx`.
export const PM = {
    navy: 'var(--pm-navy)',
    navySoft: 'var(--pm-navy-soft)',
    accent: 'var(--pm-accent)',
    muted: 'var(--pm-muted)',
    border: 'var(--pm-border)',
    iconBg: 'var(--pm-icon-bg)',
    surface: 'var(--pm-surface)',
    surfaceAlt: 'var(--pm-surface-alt)',
    solidNavy: 'var(--pm-solid-navy)',
    onSolid: 'var(--pm-on-solid)',
    accentSolid: 'var(--pm-accent-solid)',
    solidHover: 'var(--pm-solid-hover)',
    accentHover: 'var(--pm-accent-hover)',
    royal: 'var(--pm-royal)',
    gold: 'var(--pm-gold)',
    goldText: 'var(--pm-gold-text)'
};