'use client';
import React from 'react';
import Link from 'next/link';
import { Card, Box, Stack, Typography, Button } from '@mui/material';
import { MdAccessTime } from 'react-icons/md';
import { GiPrayer, GiTempleGate, GiOpenTreasureChest } from 'react-icons/gi';
import { FiUser } from 'react-icons/fi';
import Image from '@/components/blur-image';

/*
  Expected combo shape (all optional, rendered only if present):
  {
    slug, name, image: { url }, duration, languages: ['Hindi', 'Sanskrit'],
    comboPrice, originalPrice,
    puja: { name }, kit: { name }
  }
*/
const ORANGE = '#fb8b05';
const isNum = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0;
const inr = (n) => '₹' + n.toLocaleString('en-IN');

// "Satyanarayan Puja" -> "Satyanarayan Puja Service" (no double "Puja")
const pujaServiceText = (name) => {
    const base = String(name || '').trim().replace(/\s+(puja\s+)?service$/i, '').trim();
    return /\bpuja$/i.test(base) ? `${base} Service` : `${base} Puja Service`;
};

function Line({ icon: Icon, text }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Icon size={19} color={ORANGE} style={{ flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: '#4a3a2a', lineHeight: 1.3 }}>{text}</Typography>
        </Stack>
    );
}

function Chip({ children, icon }) {
    return (
        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ background: '#fff3e0', border: '1.5px solid #fbc97a', borderRadius: '20px', px: 1.1, py: 0.4 }}>
            {icon}
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#b86000', lineHeight: 1 }}>{children}</Typography>
        </Stack>
    );
}

export default function ComboCard({ combo, compact = false }) {
    if (!combo) return null;
    const imageUrl = combo.image?.url || combo.imageUrl || '';
    const hasPrice = isNum(combo.comboPrice);
    const saving = hasPrice && isNum(combo.originalPrice) && combo.originalPrice > combo.comboPrice ? combo.originalPrice - combo.comboPrice : 0;
    const percent = saving > 0 ? (combo.discountPercent > 0 ? combo.discountPercent : Math.round((saving / combo.originalPrice) * 100)) : 0;
    const languages = Array.isArray(combo.languages) ? combo.languages.filter(Boolean).map((l) => { const x = String(l).trim(); return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join(' • ') : '';
    const href = `/puja-combos/${combo.slug}`;
    const bookHref = `${href}/book`;
    const outOfStock = combo.kit && combo.kit.inStock === false;

    return (
        <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '22px', overflow: 'hidden', background: 'rgb(255, 247, 237)', boxShadow: '0 12px 40px rgba(0,0,0,0.13)', border: 'none', transition: 'all .25s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 16px 40px rgba(0,0,0,0.18)' } }}>
            <Box sx={{ position: 'relative', width: '100%', height: 168, overflow: 'hidden', background: '#f0e0d0', flexShrink: 0 }}>
                {imageUrl ? <Image alt={combo.name || 'Puja combo'} src={imageUrl} fill style={{ objectFit: 'cover' }} /> : <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', fontSize: 56 }}>🪔</Stack>}
                {saving > 0 && (
                    <Box sx={{ position: 'absolute', top: 10, ...(compact ? { left: 10 } : { right: 10 }), background: 'linear-gradient(135deg, #3aa655 0%, #2e7d32 100%)', color: '#fff', fontSize: 11, fontWeight: 700, px: 1.2, py: 0.5, borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 3px 8px rgba(46,125,50,0.35)' }}>
                        {percent > 0 ? `${percent}% OFF` : `SAVE ${inr(saving)}`}
                    </Box>
                )}
            </Box>

            <Stack spacing={1.2} sx={{ px: '12px', pt: '12px', flexGrow: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2d1a06', lineHeight: 1.3 }}>{combo.name}</Typography>
                {!compact && <Stack spacing={0.8}>
                    <Line icon={GiPrayer} text="Verified Pandit Ji" />
                    {combo.puja?.name && <Line icon={GiTempleGate} text={pujaServiceText(combo.puja.name)} />}
                    {(combo.kits?.length > 1 || combo.kit?.name) && <Line icon={GiOpenTreasureChest} text={combo.kits?.length > 1 ? 'Complete Puja Samagri Kit' : combo.kit.name} />}
                </Stack>}
                <Stack direction="row" flexWrap="wrap" gap={0.8}>
                    {combo.duration && <Chip icon={<MdAccessTime size={13} color={ORANGE} />}>{combo.duration}</Chip>}
                    {languages && <Chip>{languages}</Chip>}
                </Stack>
                {hasPrice && !compact && (
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mt: 'auto !important', pt: 0.5 }}>
                        <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{inr(combo.comboPrice)}</Typography>
                        {saving > 0 && (
                            <>
                                <Typography sx={{ fontSize: 12.5, color: '#aaa', textDecoration: 'line-through' }}>{inr(combo.originalPrice)}</Typography>
                                <Box sx={{ background: '#e3f4e1', color: '#2e7d32', fontSize: 11.5, fontWeight: 700, px: 1, py: 0.3, borderRadius: '8px' }}>Save {inr(saving)}</Box>
                            </>
                        )}
                    </Stack>
                )}
            </Stack>

            <Stack direction="row" spacing={0.8} sx={{ px: '12px', pb: '14px', pt: '12px' }}>
                <Button fullWidth component={Link} href={href} variant="outlined" sx={{ borderRadius: '50px', textTransform: 'none', border: `2px solid ${ORANGE}`, color: ORANGE, fontWeight: 700, fontSize: 12.5, py: 0.9, px: 0.5, '&:hover': { border: `2px solid ${ORANGE}`, background: 'rgba(212,118,58,0.07)' } }}>
                    View Details
                </Button>
                <Button fullWidth component={Link} href={bookHref} disabled={outOfStock} variant="contained" startIcon={<FiUser size={14} />} sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, fontSize: 12.5, py: 0.9, px: 0.5, boxShadow: 'none', background: ORANGE, color: '#fff', '&:hover': { background: '#e07b00', boxShadow: 'none' }, '&.Mui-disabled': { background: ORANGE, color: '#fff', opacity: 0.55 } }}>
                    Book Combo
                </Button>
            </Stack>
        </Card>
    );
}