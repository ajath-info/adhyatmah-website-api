'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { keyframes } from '@mui/system';
import { Box, Button, Container, Grid, Stack, Typography, IconButton, Breadcrumbs } from '@mui/material';
import {
  MdAccessTime,
  MdVerified,
  MdCheckCircle,
  MdShare,
  MdChevronLeft,
  MdChevronRight,
  MdOutlineVerifiedUser,
  MdOutlineEventAvailable,
  MdOutlineHome,
  MdOutlineNotificationsActive,
  MdOutlineLock,
  MdOutlineSupportAgent,
  MdArrowForward,
  MdNavigateNext,
  MdOutlineInfo,
  MdOutlineLocationOn,
  MdOutlinePayment
} from 'react-icons/md';
import { FaUserTie, FaBoxOpen, FaLanguage, FaPlus, FaCrown, FaBolt } from 'react-icons/fa';
import { GiFireBowl, GiLotus } from 'react-icons/gi';
import Image from '@/components/blur-image';
import ComboCard from '@/components/cards/combo';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import * as api from 'src/services';

const ORANGE = '#fb8b05';
const NAVY = '#14213d';
const SERIF = "'Playfair Display', 'Georgia', 'Times New Roman', serif";
const isNum = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0;
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

async function loadCombo(slug) {
  try {
    const res = await api.getPujaComboBySlug(slug);
    return res?.data || null;
  } catch (e) {
    if (e?.response?.status === 404 || e?.response?.status === 400) return null;
    throw e;
  }
}

// "Satyanarayan Puja" -> "Satyanarayan Puja Service" (no double "Puja")
const pujaServiceText = (name) => {
  const base = String(name || '').trim().replace(/\s+(puja\s+)?service$/i, '').trim();
  return /\bpuja$/i.test(base) ? `${base} Service` : `${base} Puja Service`;
};

// "hindi" -> "Hindi"
const cap = (s) => String(s || '').replace(/\b\w/g, (c) => c.toUpperCase());

/* ---------- Section heading with diamond lines (serif) ---------- */
function SectionHeading({ title, subtitle, align = 'center', size = 'lg' }) {
  const fs = size === 'lg' ? { xs: 24, md: 32 } : { xs: 21, md: 26 };
  return (
    <Stack alignItems={align === 'center' ? 'center' : 'flex-start'} sx={{ textAlign: align, mb: { xs: 2.5, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, md: 2 }} sx={{ width: '100%' }}>
        {align === 'center' && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flex: 1, maxWidth: 150 }}>
            <Box sx={{ flex: 1, height: '1.5px', background: `linear-gradient(90deg, transparent, ${ORANGE})` }} />
            <Box sx={{ width: 9, height: 9, border: `1.5px solid ${ORANGE}`, transform: 'rotate(45deg)', flexShrink: 0 }} />
          </Box>
        )}
        <Typography component="h2" sx={{ fontSize: fs, fontWeight: 800, color: NAVY, lineHeight: 1.2, fontFamily: SERIF, ...(align !== 'center' && { width: '100%' }) }}>
          {title}
        </Typography>
        {align === 'center' && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flex: 1, maxWidth: 150 }}>
            <Box sx={{ width: 9, height: 9, border: `1.5px solid ${ORANGE}`, transform: 'rotate(45deg)', flexShrink: 0 }} />
            <Box sx={{ flex: 1, height: '1.5px', background: `linear-gradient(90deg, ${ORANGE}, transparent)` }} />
          </Box>
        )}
      </Stack>
      {subtitle && <Typography sx={{ color: '#5b4a39', mt: 0.8, fontSize: { xs: 13.5, md: 14.5 } }}>{subtitle}</Typography>}
    </Stack>
  );
}

/* ---------- Included card (Benefits / Not included / Instructions) ---------- */
function IncludedBlock({ icon: Icon, label, title, points, delay = 0 }) {
  const list = Array.isArray(points) ? points.filter(Boolean) : [];
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #f5dcc0',
        overflow: 'hidden',
        animation: `${fadeUp} .6s ease both`,
        animationDelay: `${delay}ms`
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.8, background: 'linear-gradient(90deg, #fff1e0, #fffaf3)' }}>
        <Stack alignItems="center" justifyContent="center" sx={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', flexShrink: 0 }}>
          <Icon size={19} color={ORANGE} />
        </Stack>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: '#b86000', textTransform: 'uppercase' }}>{label}</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#2d1a06', lineHeight: 1.25 }}>{title}</Typography>
        </Box>
      </Stack>
      <Stack spacing={1.1} sx={{ p: 2, flexGrow: 1 }}>
        {list.map((p, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
            <MdCheckCircle size={16} color={ORANGE} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13.5, color: '#4a3a2a' }}>{p}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/* ---------- Card used only in the "Everything Included" section ---------- */
function ComboIncludeCard({ icon: Icon, label, title, image, imagePosition = 'center', fallbackIcon: FallbackIcon, points, delay = 0, children }) {
  const list = Array.isArray(points) ? points.filter(Boolean) : [];
  const hasImage = image !== undefined || FallbackIcon;
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: '18px',
        border: '1px solid #f5dcc0',
        boxShadow: '0 4px 18px rgba(251,139,5,0.07)',
        p: 1,
        animation: `${fadeUp} .6s ease both`,
        animationDelay: `${delay}ms`,
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 14px 34px rgba(251,139,5,0.18)' },
        '&:hover .inc-img': { transform: 'scale(1.07)' }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.2, background: 'linear-gradient(90deg, #ffeedd, #fff8ef)', borderRadius: '12px 12px 0 0' }}>
        <Stack alignItems="center" justifyContent="center" sx={{ width: 46, height: 46, borderRadius: '50%', background: '#fff', flexShrink: 0 }}>
          <Icon size={22} color={ORANGE} />
        </Stack>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8, color: '#e07b00', textTransform: 'uppercase' }}>{label}</Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: NAVY, lineHeight: 1.25, fontFamily: SERIF }}>{title}</Typography>
        </Box>
      </Stack>

      {hasImage && (
        <Box sx={{ position: 'relative', width: '100%', height: { xs: 170, md: 175 }, overflow: 'hidden', background: 'linear-gradient(135deg, #ffe7c7, #fdd29a)', borderRadius: '0 0 12px 12px' }}>
          {image ? (
            <Box className="inc-img" sx={{ position: 'absolute', inset: 0, transition: 'transform .5s ease' }}>
              <Image alt={title} src={image} fill style={{ objectFit: 'cover', objectPosition: imagePosition }} />
            </Box>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
              {FallbackIcon ? <FallbackIcon size={64} color="#fff" style={{ opacity: 0.9 }} /> : <Box sx={{ fontSize: 40 }}>🪔</Box>}
            </Stack>
          )}
        </Box>
      )}

      <Stack spacing={1.25} sx={{ p: 2, flexGrow: 1 }}>
        {list.map((p, i) => (
          <Stack key={i} direction="row" spacing={1.2} alignItems="flex-start">
            <MdCheckCircle size={20} color={ORANGE} style={{ marginTop: 1, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 14, color: '#3d2f20' }}>{p}</Typography>
          </Stack>
        ))}
        {children}
      </Stack>
    </Box>
  );
}

function Plus() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ display: { xs: 'none', md: 'flex' }, height: '100%' }}>
      <Stack alignItems="center" justifyContent="center" sx={{ width: 28, height: 28, borderRadius: '50%', background: ORANGE, color: '#fff', boxShadow: '0 4px 12px rgba(251,139,5,0.4)' }}>
        <FaPlus size={11} />
      </Stack>
    </Stack>
  );
}

export default function ComboDetailsPage() {
  const { slug } = useParams();
  const [combo, setCombo] = React.useState(undefined); // undefined = loading
  const [related, setRelated] = React.useState([]);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    setActive(0);
    loadCombo(slug)
      .then((c) => alive && setCombo(c))
      .catch(() => alive && setCombo(null));
    api
      .getPujaCombos('limit=12')
      .then((res) => {
        if (!alive) return;
        const all = Array.isArray(res?.data) ? res.data : [];
        setRelated(all.filter((c) => c.slug !== slug).slice(0, 4));
      })
      .catch(() => alive && setRelated([]));
    window.scrollTo?.({ top: 0 });
    return () => {
      alive = false;
    };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: combo?.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch (e) {
      /* user cancelled share */
    }
  };

  if (combo === undefined)
    return (
      <Container sx={{ py: 8 }}>
        <Typography textAlign="center" color="text.secondary">Loading...</Typography>
      </Container>
    );

  if (!combo) {
    return (
      <Container sx={{ py: 8 }}>
        <Stack alignItems="center" spacing={2}>
          <Typography variant="h5" fontWeight={700}>This combo is not available</Typography>
          <Typography color="text.secondary">It may have been removed or is not published yet.</Typography>
          <Button component={Link} href="/puja-combos" variant="outlined" sx={{ borderRadius: '50px', textTransform: 'none', borderColor: ORANGE, color: ORANGE }}>
            View All Combos
          </Button>
        </Stack>
      </Container>
    );
  }

  const comboImages = Array.isArray(combo.images) ? combo.images.filter((i) => i?.url) : [];
  const images = comboImages.length ? comboImages : combo.image?.url ? [combo.image] : [];
  const kits = Array.isArray(combo.kits) ? combo.kits : [];
  const saving = isNum(combo.comboPrice) && isNum(combo.originalPrice) && combo.originalPrice > combo.comboPrice ? combo.originalPrice - combo.comboPrice : 0;
  const languagesArr = Array.isArray(combo.languages) ? combo.languages.filter(Boolean).map(cap) : [];
  const languages = languagesArr.join(' • ');
  const outOfStock = combo.kit?.inStock === false;
  const bookHref = `/puja-combos/${combo.slug}/book`;
  const kitTitle = kits.length > 1 ? 'Complete Puja Samagri Kit' : combo.kit?.name || 'Puja Samagri Kit';
  const chip = { background: '#fff3e0', border: '1.5px solid #fbc97a', borderRadius: '20px', px: 1.6, py: 0.6 };
  const go = (d) => setActive((a) => (a + d + images.length) % images.length);

  const bookBtn = {
    borderRadius: '50px',
    textTransform: 'none',
    fontWeight: 700,
    boxShadow: 'none',
    background: `linear-gradient(90deg, ${ORANGE}, #ff6a00)`,
    color: '#fff',
    '&:hover': { background: 'linear-gradient(90deg, #e07b00, #f05a00)', boxShadow: '0 8px 22px rgba(251,139,5,0.4)', transform: 'translateY(-2px)' },
    transition: 'all .2s ease',
    '&.Mui-disabled': { background: ORANGE, color: '#fff', opacity: 0.55 }
  };

  const arrowBtn = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 38,
    height: 38,
    background: 'rgba(255,255,255,0.92)',
    color: ORANGE,
    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
    zIndex: 2,
    '&:hover': { background: '#fff' }
  };

  return (
    <Container maxWidth="xl" sx={{ pb: { xs: 11, md: 5 } }}>
      {/* ---------- Breadcrumb ---------- */}
      <HeaderBreadcrumbs
        heading={combo.name}
        links={[{ name: 'Home', href: '/' }, { name: 'Puja Combos', href: '/puja-combos' }, { name: combo.name }]}
        sx={{ mb: 3 }}
      />

      {/* ---------- Top: gallery + info ---------- */}
      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid size={{ md: 6, xs: 12 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#f0e0d0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              '&:hover .zoom': { transform: 'scale(1.05)' }
            }}
          >
            {images[active] ? (
              <Box key={active} className="zoom" sx={{ position: 'absolute', inset: 0, transition: 'transform .6s ease', animation: `${fadeIn} .45s ease` }}>
                <Image alt={combo.name} src={images[active].url} fill style={{ objectFit: 'cover' }} priority />
              </Box>
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', fontSize: 64 }}>🪔</Stack>
            )}

            {saving > 0 && (
              <Box sx={{ position: 'absolute', top: 14, left: 14, background: '#e8380d', color: '#fff', fontSize: 11, fontWeight: 700, px: 1.2, py: 0.5, borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 3px 8px rgba(232,56,13,0.35)', zIndex: 2 }}>
                {combo.discountPercent > 0 ? `${combo.discountPercent}% OFF` : `SAVE ${inr(saving)}`}
              </Box>
            )}

            {images.length > 1 && (
              <>
                <IconButton onClick={() => go(-1)} sx={{ ...arrowBtn, left: 12 }}>
                  <MdChevronLeft />
                </IconButton>
                <IconButton onClick={() => go(1)} sx={{ ...arrowBtn, right: 12 }}>
                  <MdChevronRight />
                </IconButton>
                <Box sx={{ position: 'absolute', right: 14, bottom: 12, zIndex: 2, color: '#fff', fontSize: 12, fontWeight: 600, background: 'rgba(0,0,0,0.45)', px: 1.2, py: 0.3, borderRadius: '12px' }}>
                  {active + 1}/{images.length}
                </Box>
              </>
            )}
          </Box>

          {images.length > 1 && (
            <Stack direction="row" spacing={1.2} sx={{ mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
              {images.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setActive(i)}
                  sx={{
                    position: 'relative',
                    flex: '1 0 84px',
                    maxWidth: 140,
                    height: { xs: 62, md: 74 },
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2.5px solid ${i === active ? ORANGE : 'transparent'}`,
                    opacity: i === active ? 1 : 0.8,
                    transition: 'all .2s ease',
                    '&:hover': { opacity: 1, transform: 'translateY(-2px)' }
                  }}
                >
                  <Image alt={`${combo.name} ${i + 1}`} src={img.url} fill style={{ objectFit: 'cover' }} />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ md: 6, xs: 12 }}>
          <Stack spacing={2} sx={{ animation: `${fadeUp} .5s ease both` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              {combo.isFeatured ? (
                <Stack direction="row" alignItems="center" spacing={0.7} sx={{ background: '#fff1dc', color: '#d97200', borderRadius: '8px', px: 1.3, py: 0.5 }}>
                  <FaCrown size={13} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>Most Popular</Typography>
                </Stack>
              ) : (
                <span />
              )}
              <Button onClick={handleShare} size="small" startIcon={<MdShare size={16} />} sx={{ textTransform: 'none', color: '#4a3a2a', flexShrink: 0, border: '1px solid #eee', borderRadius: '10px', px: 1.5, background: '#fff' }}>
                Share
              </Button>
            </Stack>

            <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 800, color: NAVY, lineHeight: 1.2, fontFamily: SERIF }}>
              {combo.name}
            </Typography>

            {combo.shortDescription && <Typography sx={{ color: '#5b5b5b', fontSize: { xs: 14, md: 15 }, lineHeight: 1.6 }}>{combo.shortDescription}</Typography>}

            <Stack direction="row" gap={1} flexWrap="wrap">
              {combo.duration && (
                <Stack direction="row" alignItems="center" spacing={0.6} sx={chip}>
                  <MdAccessTime size={15} color={ORANGE} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#b86000' }}>{combo.duration}</Typography>
                </Stack>
              )}
              {languages && (
                <Stack direction="row" alignItems="center" spacing={0.6} sx={chip}>
                  <FaLanguage size={15} color={ORANGE} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#b86000' }}>{languages}</Typography>
                </Stack>
              )}
            </Stack>

            {/* price + booking card */}
            <Box sx={{ background: 'linear-gradient(180deg, #fff6ea, #fffaf4)', border: '1px solid #f5dcc0', borderRadius: '18px', p: { xs: 2, md: 2.5 } }}>
              {isNum(combo.comboPrice) && (
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>{inr(combo.comboPrice)}</Typography>
                  {saving > 0 && <Typography sx={{ color: '#aaa', textDecoration: 'line-through', fontSize: 16 }}>{inr(combo.originalPrice)}</Typography>}
                  {saving > 0 && (
                    <Box sx={{ background: '#e3f4e1', color: '#2e7d32', fontSize: 13, fontWeight: 700, px: 1.4, py: 0.6, borderRadius: '8px' }}>
                      Save {inr(saving)}{combo.discountPercent > 0 ? ` (${combo.discountPercent}% off)` : ''}
                    </Box>
                  )}
                </Stack>
              )}

              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Button fullWidth component={Link} href={bookHref} variant="contained" disabled={outOfStock} endIcon={<MdArrowForward />} sx={{ ...bookBtn, py: 1.5, fontSize: 17 }}>
                  Book Combo Now
                </Button>
                {outOfStock && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.8 }}>Currently out of stock.</Typography>}
              </Box>

              <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mt: { md: 2 } }}>
                {[
                  { icon: MdOutlineLock, t: 'Secure Booking' },
                  { icon: MdOutlineVerifiedUser, t: 'Verified Pandit Ji' },
                  { icon: MdOutlineSupportAgent, t: 'Support Assistance' }
                ].map((f) => (
                  <Stack key={f.t} direction="row" alignItems="center" spacing={0.7}>
                    <f.icon size={19} color={ORANGE} />
                    <Typography sx={{ fontSize: 12.5, color: '#4a3a2a' }}>{f.t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* ---------- What's included ---------- */}
      <Box sx={{ mt: { xs: 4, md: 6 } }}>
        <SectionHeading title="Everything Included in This Combo" subtitle="One booking. Pandit Ji, puja service and samagri kit — all together for a seamless and divine experience." />

        <Grid container spacing={{ xs: 2, md: 0 }} alignItems="stretch">
          <Grid size={{ md: 'grow', xs: 12 }}>
            <ComboIncludeCard
              icon={FaUserTie}
              label="Pandit Ji"
              title="Verified & Experienced"
              delay={0}
              image="/images/pandit-ji.jpg"
              imagePosition="center 25%"
              fallbackIcon={FaUserTie}
              points={[
                ...(combo.pandit?.points || []).filter((pt) => !/verified pandit ji available/i.test(String(pt))),
                'Experienced in Vedic rituals',
                'Choose your preferred Pandit Ji at booking',
                languages ? `Languages: ${languages}` : null,
                'Guidance included throughout the ritual'
              ]}
            />
          </Grid>
          <Grid size={{ md: 'auto', xs: 12 }}><Box sx={{ px: { md: 1.2 }, height: '100%' }}><Plus /></Box></Grid>
          <Grid size={{ md: 'grow', xs: 12 }}>
            <ComboIncludeCard
              icon={GiFireBowl}
              label="Puja Service"
              title={pujaServiceText(combo.puja?.name)}
              image={images[0]?.url || ''}
              delay={120}
              points={[
                combo.duration ? `Duration: ${combo.duration}` : null,
                'Performed as per Vedic rituals',
                ...(combo.puja?.points || []),
                'Ideal for home & family blessings',
                'Smooth and guided puja experience'
              ]}
            />
          </Grid>
          <Grid size={{ md: 'auto', xs: 12 }}><Box sx={{ px: { md: 1.2 }, height: '100%' }}><Plus /></Box></Grid>
          <Grid size={{ md: 'grow', xs: 12 }}>
            <ComboIncludeCard
              icon={FaBoxOpen}
              label="Puja Samagri Kit"
              title={kitTitle}
              image="/images/samagri-kit.jpg"
              imagePosition="center 40%"
              fallbackIcon={FaBoxOpen}
              delay={240}
              points={[
                ...(kits.length ? [] : combo.kit?.items?.length ? combo.kit.items : combo.inclusions || []),
                'All essential items included',
                'Carefully curated for the ritual',
                'Delivered as selected combo',
                kits.length > 1 ? 'Choose from the kit options below' : null
              ]}
            >
              {kits.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: kits.length > 1 ? '1fr 1fr' : '1fr' }, gap: 1, mt: 0.5 }}>
                  {kits.map((k, ki) => (
                    <Stack
                      key={k.id || ki}
                      component={k.slug ? Link : 'div'}
                      href={k.slug ? `/product/${k.slug}` : undefined}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ p: 1, borderRadius: '12px', border: '1px solid #f8e3c6', background: '#fff7ec', textDecoration: 'none', color: 'inherit', transition: 'all .2s', '&:hover': { background: '#fff3e0', borderColor: ORANGE } }}
                    >
                      <FaBolt size={18} color={ORANGE} style={{ flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#2d1a06', lineHeight: 1.25 }}>{k.name}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Box>
              )}
            </ComboIncludeCard>
          </Grid>
        </Grid>
      </Box>

      {/* ---------- How it works ---------- */}
      <Box sx={{ mt: { xs: 4, md: 6 } }}>
        <SectionHeading size="md" title="How It Works" subtitle="Book your combo in just a few simple steps" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr auto 1fr auto 1fr auto 1fr' }, gap: { xs: 1.5, md: 1 }, alignItems: 'stretch' }}>
          {[
            { icon: MdOutlineEventAvailable, t: 'Choose Date & Time', d: 'Select a convenient slot' },
            { icon: MdOutlineLocationOn, t: 'Add Details', d: 'Share your address' },
            { icon: FaUserTie, t: 'Confirm Pandit Ji', d: 'Choose your preferred Pandit Ji' },
            { icon: MdOutlinePayment, t: 'Review & Pay', d: 'Complete your booking securely' }
          ].map((s, i, arr) => (
            <React.Fragment key={s.t}>
              <Stack alignItems="center" spacing={0.6} sx={{ position: 'relative', background: '#fff', border: '1px solid #f5dcc0', borderRadius: '14px', px: 1.5, pt: 2.4, pb: 1.8, textAlign: 'center', boxShadow: '0 4px 14px rgba(251,139,5,0.06)' }}>
                <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', top: -11, width: 24, height: 24, borderRadius: '50%', background: ORANGE, color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {i + 1}
                </Stack>
                <s.icon size={30} color={ORANGE} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#2d1a06' }}>{s.t}</Typography>
                <Typography sx={{ fontSize: 12, color: '#6b5a48' }}>{s.d}</Typography>
              </Stack>
              {i < arr.length - 1 && (
                <Stack alignItems="center" justifyContent="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <MdArrowForward size={18} color={ORANGE} />
                </Stack>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      {/* ---------- Trust strip ---------- */}
      <Box
        sx={{
          mt: { xs: 3, md: 4 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: { xs: 2, md: 0 },
          background: '#fdebd3',
          borderRadius: '16px',
          p: { xs: 2, md: 2.2 }
        }}
      >
        {[
          { icon: MdOutlineVerifiedUser, t: 'Authentic Ritual Process', d: 'Performed as per Vedic traditions' },
          { icon: MdOutlineEventAvailable, t: 'Easy Online Booking', d: 'Select date, time and Pandit Ji' },
          { icon: MdOutlineHome, t: 'Convenient Home Puja', d: 'Complete arrangement at your home' },
          { icon: GiLotus, t: 'Divine Experience', d: 'Bring peace, prosperity and happiness' }
        ].map((f, i) => (
          <Stack key={f.t} direction="row" spacing={1.5} alignItems="center" sx={{ px: { md: 2 }, borderLeft: { md: i ? '1px solid #f3cf9f' : 'none' } }}>
            <f.icon size={34} color={ORANGE} style={{ flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2d1a06', lineHeight: 1.25 }}>{f.t}</Typography>
              <Typography sx={{ fontSize: 12.5, color: '#6b5a48', lineHeight: 1.3 }}>{f.d}</Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      {/* ---------- About / benefits / exclusions / instructions ---------- */}
      {(combo.description || combo.benefits?.length > 0 || combo.exclusions?.length > 0 || combo.instructions) && (
        <Stack spacing={3} sx={{ mt: 5 }}>
          {combo.description && (
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1, fontFamily: SERIF, color: NAVY }}>About This Combo</Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{combo.description}</Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            {combo.benefits?.length > 0 && (
              <Grid size={{ md: 4, xs: 12 }}>
                <IncludedBlock icon={MdVerified} label="Benefits" title="Puja Benefits" points={combo.benefits} />
              </Grid>
            )}
            {combo.exclusions?.length > 0 && (
              <Grid size={{ md: 4, xs: 12 }}>
                <IncludedBlock icon={MdAccessTime} label="Please note" title="Not Included" points={combo.exclusions} />
              </Grid>
            )}
            {combo.instructions && (
              <Grid size={{ md: 4, xs: 12 }}>
                <IncludedBlock icon={MdCheckCircle} label="Before the puja" title="Instructions" points={combo.instructions.split('\n')} />
              </Grid>
            )}
          </Grid>
        </Stack>
      )}

      {/* ---------- Explore more combos ---------- */}
      {related.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: NAVY, fontFamily: SERIF, lineHeight: 1.2 }}>Explore More Puja Combos</Typography>
              <Typography sx={{ fontSize: 13.5, color: '#5b4a39', mt: 0.4 }}>Discover other popular combos for your spiritual needs</Typography>
            </Box>
            <Button component={Link} href="/puja-combos" variant="outlined" endIcon={<MdArrowForward size={15} />} sx={{ display: { xs: 'none', sm: 'inline-flex' }, flexShrink: 0, borderRadius: '50px', textTransform: 'none', border: `1.5px solid ${ORANGE}`, color: ORANGE, fontWeight: 700, px: 2.2, '&:hover': { border: `1.5px solid ${ORANGE}`, background: 'rgba(251,139,5,0.07)' } }}>
              View All Combos
            </Button>
          </Stack>
          <Grid container spacing={2.5}>
            {related.map((c, i) => (
              <Grid key={c.slug} size={{ lg: 3, sm: 6, xs: 12 }} sx={{ animation: `${fadeUp} .5s ease both`, animationDelay: `${i * 90}ms` }}>
                <ComboCard combo={c} />
              </Grid>
            ))}
          </Grid>
          <Stack alignItems="center" sx={{ display: { xs: 'flex', sm: 'none' }, mt: 2 }}>
            <Button component={Link} href="/puja-combos" variant="outlined" endIcon={<MdArrowForward size={15} />} sx={{ borderRadius: '50px', textTransform: 'none', border: `1.5px solid ${ORANGE}`, color: ORANGE, fontWeight: 700, px: 3 }}>
              View All Combos
            </Button>
          </Stack>
        </Box>
      )}

      {/* ---------- Mobile sticky booking bar ---------- */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1200, background: '#fff', borderTop: '1px solid #f5dcc0', boxShadow: '0 -6px 20px rgba(0,0,0,0.08)', px: 2, py: 1.2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{isNum(combo.comboPrice) ? inr(combo.comboPrice) : ''}</Typography>
          {saving > 0 && <Typography sx={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>You save {inr(saving)}</Typography>}
        </Box>
        <Button component={Link} href={bookHref} variant="contained" disabled={outOfStock} sx={{ ...bookBtn, px: 4, py: 1.1, flexShrink: 0 }}>
          Book Combo Now
        </Button>
      </Stack>
    </Container>
  );
}