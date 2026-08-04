'use client';
import dynamic from 'next/dynamic';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from '@/redux';
import { getTheme } from '@/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import rtlPlugin from 'stylis-plugin-rtl';
import GlobalStyles from '@/theme/global-styles';
import { initializeSettings } from '@/redux/slices/settings';
import { setShippingFee } from '@/redux/slices/product';

const Settings = dynamic(() => import('@/components/settings'), { ssr: false });

export default function MuiThemeProvider({
  children,
  fontFamilies,
  palette,
  fontFamily,
  baseCurrency,
  preset,
  cloudName,
  shippingFee
}) {
  const { themeMode, direction, rate, currency, isInitialized } = useSelector((state) => state.settings);
  const [resolvedMode, setResolvedMode] = useState(themeMode !== 'system' ? themeMode : 'light');
  const dispatch = useDispatch();
  useEffect(() => {
    if (themeMode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedMode(media.matches ? 'dark' : 'light');

      const listener = (e) => setResolvedMode(e.matches ? 'dark' : 'light');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      setResolvedMode(themeMode);
      return undefined;
    }
  }, [themeMode]);

  useEffect(() => {
    dispatch(setShippingFee(shippingFee));
    dispatch(
      initializeSettings({
        cloudName,
        uploadPreset: preset,
        baseCurrency,
        rate: isInitialized ? rate : 1,
        currency: isInitialized ? currency : baseCurrency
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCurrency]);

  // Memoize theme based on dependencies
  const theme = useMemo(() => {
    const selectedFont = fontFamilies[fontFamily] || fontFamilies.figtree;
    return getTheme(resolvedMode, direction, selectedFont, palette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedMode, direction, fontFamily, palette]);

  // NOTE: previously we wrapped AppRouterCacheProvider with our own
  // separate EmotionCacheProvider (createCache) to support RTL. That
  // created two competing emotion caches, each injecting <style> tags
  // in a different order on the server vs the client — which is what
  // caused the "server rendered HTML didn't match the client" error.
  // AppRouterCacheProvider accepts the same cache config directly via
  // `options`, so we no longer need the extra provider.
  return (
    <AppRouterCacheProvider
      options={{
        key: direction === 'rtl' ? 'muirtl' : 'css',
        stylisPlugins: direction === 'rtl' ? [rtlPlugin] : []
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main dir={direction}>
          {children}
          <Settings direction={direction} />
        </main>
        <GlobalStyles />
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}