// providers/ReduxProvider.js

'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux';
// import Loading from '@/components/loading';
export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      {/* SEO fix: loading={children} renders the real page during SSR (and until rehydration)
          instead of null — with loading={null} the entire app tree was missing from the
          server HTML, so crawlers saw an empty page. Children render with initial store
          state first, then re-render once redux-persist rehydrates (standard pattern). */}
      <PersistGate loading={children} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
