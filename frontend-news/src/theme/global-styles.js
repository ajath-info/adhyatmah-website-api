'use client';

// mui
import { GlobalStyles as GlobalThemeStyles } from '@mui/material';

export default function GlobalStyles() {
  return (
    <GlobalThemeStyles
      styles={{
        '*': {
          textDecoration: 'none',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        },

        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        },

        body: {
          width: '100%',
          height: '100%'
        },

        '#__next': {
          width: '100%',
          height: '100%'
        },

        a: {
          textDecoration: 'none',
          transition: 'color 0.3s ease'
        },

        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            }
          }
        },
	  
		'ol': {
		paddingLeft: '22px',
		marginTop: '18px'
		},

		'ol li': {
		marginBottom: '1px',
		lineHeight: 1.5,
		fontSize: '14px',
		color: '#5f6b77'
		},

		'ol li strong': {
		color: '#2c2f33',
		fontWeight: 700
		},

		'ol li::marker': {
		fontWeight: 700,
		color: '#2c2f33'
		},

        /* 🔥 WhatsApp Floating Button */
        '.whatsapp-button': {
          position: 'fixed',
          bottom: '2%',
          left: '18px', // change to right: '18px' if needed
          backgroundColor: '#2ab540',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s ease',

          '&:hover': {
            transform: 'scale(1.05)'
          }
        },

        '.whatsapp-button img': {
          width: '55px',
          height: 'auto'
        },

        /* Mobile safety */
        '@media (max-width:480px)': {
          '.whatsapp-button': {
            bottom: '80px'
          }
        },
	  
	  /* 🔥 Hide Google Translate Banner Completely */
'.goog-te-banner-frame': {
  display: 'none !important'
},

'.goog-te-banner-frame.skiptranslate': {
  display: 'none !important'
},

'iframe.goog-te-banner-frame': {
  display: 'none !important'
},

'.goog-tooltip': {
  display: 'none !important'
},

'.goog-text-highlight': {
  background: 'none !important',
  boxShadow: 'none !important'
},

'body': {
  width: '100%',
  height: '100%',
  top: '0px !important'
},

/* Visual-only density fix: makes the ENTIRE site — public user-facing
   pages, the vendor dashboard, and the admin dashboard — render at the
   same visual scale on desktop as 90% browser zoom (matching real
   Ctrl/Cmd+"-" zoom), with zero layout-math tricks.
   - `zoom` is applied to the ROOT `html` element, not to an inner wrapper.
     This is the key difference from the earlier attempt: zooming an inner
     div creates a new containing block for its `position: fixed` / `sticky`
     descendants (nav bars, dashboard sidebars, sticky table headers), so
     they render relative to the zoomed+widened box instead of the real
     viewport — that's what caused the horizontal scrollbar, right-side
     clipping and misaligned hero/nav in the earlier attempt.
     Zooming `html` itself avoids that problem entirely: it behaves exactly
     like native browser zoom, so 100vw / fixed / sticky elements all stay
     correctly aligned with the real viewport, and NO width compensation
     (e.g. 111.1112%) is needed — the page simply renders denser,
     edge-to-edge, with no blank space and no overflow.
     It also means MUI's portal-based Dialogs, Drawers, Menus/Popovers,
     Tooltips and date pickers (which mount into <body>, not inline) stay
     correctly positioned: since they're still descendants of the zoomed
     <html>, the whole document — including every portal — shares one
     consistent coordinate system. There is no separate "zoomed" vs
     "unzoomed" region anywhere in the DOM.
   - Applied once, here, on `GlobalStyles` (mounted app-wide by
     `Providers` in the root `app/layout.js`), so user, vendor and admin
     all pick it up automatically — no per-layout wiring needed, and
     nothing to duplicate if a new dashboard/section is added later.
   - Only active at md+ widths (900px+), so mobile/tablet — including the
     vendor/admin mobile views — are untouched.
   - `@media screen` keeps this out of any future print/PDF export path.
   - Wrapped in @supports so browsers without `zoom` fall back to the
     normal, unscaled layout instead of breaking. */
'@media screen and (min-width: 900px)': {
  '@supports (zoom: 1)': {
    html: {
      zoom: 0.9
    }
  }
},

      }}
    />
  );
}