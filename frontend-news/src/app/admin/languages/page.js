import React from 'react';

// Components
import LanguageList from '@/components/_admin/languages/language-list';

// Meta information
export const metadata = {
    title: 'Languages - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};
export default function Languages() {
    return <LanguageList />;
}