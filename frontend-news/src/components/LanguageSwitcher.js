// import { Menu, MenuItem } from '@mui/material';
// import { useState } from 'react';
// import Image from 'next/image';

// const languages = [
//   { code: 'en', label: 'English' },
//   { code: 'hi', label: 'Hindi' },
//   { code: 'mr', label: 'Marathi' },
//   { code: 'sa', label: 'Sanskrit' },
//   { code: 'bn', label: 'Bengali' },
//   { code: 'gu', label: 'Gujarati' },
//   { code: 'or', label: 'Odia' },
//   { code: 'ta', label: 'Tamil' },
//   { code: 'te', label: 'Telugu' },
//   { code: 'kn', label: 'Kannada' },
//   { code: 'ml', label: 'Malayalam' }
// ];

// export default function LanguageSwitcher() {
//   const [lang, setLang] = useState('en');
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleOpen = (e) => setAnchorEl(e.currentTarget);
//   const handleClose = () => setAnchorEl(null);

//   const handleChange = (value) => {
//     setLang(value);
//     handleClose();

//     const interval = setInterval(() => {
//       const googleSelect = document.querySelector('.goog-te-combo');
//       if (googleSelect) {
//         googleSelect.value = value;
//         googleSelect.dispatchEvent(new Event('change'));
//         clearInterval(interval);
//       }
//     }, 500);
//   };

//   return (
//     <div className="notranslate" translate="no">

//       {/* IMAGE BUTTON */}
//       <div
//         onClick={handleOpen}
//         style={{
//           cursor: 'pointer',
//           display: 'flex',
//           alignItems: 'center'
//         }}
//       >
//         <Image
//   src="/images/adhyatmah-language-logo.png"
//   alt="Language"
//   width={36}
//   height={46}
//   style={{ display: 'block' }}
// />
//       </div>

//       {/* DROPDOWN MENU */}
//       <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
//         {languages.map((item) => (
//           <MenuItem key={item.code} onClick={() => handleChange(item.code)}>
//             {item.label}
//           </MenuItem>
//         ))}
//       </Menu>

//     </div>
//   );
// }

'use client';
import { Menu, MenuItem } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'or', label: 'Odia' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
];

function getCurrentLang() {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  const code = match ? match[1].trim() : 'en';
  return languages.find((l) => l.code === code) ? code : 'en';
}

function setGoogleTranslateLang(langCode) {
  if (langCode === 'en') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + location.hostname;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname;
  } else {
    const val = '/en/' + langCode;
    document.cookie = 'googtrans=' + val + '; path=/';
    document.cookie = 'googtrans=' + val + '; path=/; domain=.' + location.hostname;
  }
  window.location.reload();
}

// This component renders label text using a CSS content trick
// so Google Translate cannot modify it
function UntranslatableLabel({ text }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      // Set text as a data attribute and use JS to write it
      // Google Translate skips elements it already processed with notranslate
      ref.current.setAttribute('data-label', text);
    }
  }, [text]);

  useEffect(() => {
    // After Google Translate runs, restore our labels
    const observer = new MutationObserver(() => {
      if (ref.current) {
        const desired = ref.current.getAttribute('data-label');
        if (desired && ref.current.textContent !== desired) {
          ref.current.textContent = desired;
        }
      }
    });
    if (ref.current) {
      observer.observe(ref.current, { childList: true, subtree: true, characterData: true });
    }
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      data-label={text}
      className="notranslate"
      translate="no"
      style={{ fontFamily: 'inherit' }}
    >
      {text}
    </span>
  );
}

export default function LanguageSwitcher() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    setCurrentLang(getCurrentLang());
  }, []);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (code) => {
    handleClose();
    if (code === currentLang) return;
    setGoogleTranslateLang(code);
  };

  return (
    <div className="notranslate" translate="no">
      <div
        onClick={handleOpen}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <Image
          src="/images/adhyatmah-language-logo.png"
          alt="Language"
          width={36}
          height={46}
          style={{ display: 'block' }}
        />
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 180, maxHeight: 360 },
        }}
      >
        {languages.map((item) => (
          <MenuItem
            key={item.code}
            onClick={() => handleChange(item.code)}
            selected={item.code === currentLang}
            sx={{
              fontWeight: item.code === currentLang ? 700 : 400,
              color: item.code === currentLang ? 'primary.main' : 'inherit',
            }}
          >
            <UntranslatableLabel text={item.label} />
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}