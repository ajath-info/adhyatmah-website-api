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

// Every domain a `googtrans` cookie could have been written on.
// e.g. on www.adhyatmah.com -> host-only, www.adhyatmah.com, .www.adhyatmah.com,
// adhyatmah.com and .adhyatmah.com. Google's own script sets the cookie on the ROOT domain
// as well, so clearing only the current hostname leaves the cookie behind on the live site
// (that is why English would not come back there, while localhost has no parent domain).
function getCookieDomains() {
  const host = location.hostname;
  const domains = [undefined, host, '.' + host]; // undefined = host-only cookie
  const parts = host.split('.');
  if (parts.length > 1 && !/^\d+(\.\d+){3}$/.test(host)) {
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join('.');
      domains.push(parent, '.' + parent);
    }
  }
  return domains;
}

function writeGoogTrans(value, expire) {
  const expires = expire ? '; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0' : '';
  getCookieDomains().forEach((domain) => {
    document.cookie =
      'googtrans=' + value + expires + '; path=/' + (domain ? '; domain=' + domain : '');
  });
}

function setGoogleTranslateLang(langCode) {
  if (langCode === 'en') {
    // remove the cookie everywhere (all domain variants, path=/)
    writeGoogTrans('', true);
  } else {
    // clear stale copies first so an old root-domain cookie can't override the new language
    writeGoogTrans('', true);
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