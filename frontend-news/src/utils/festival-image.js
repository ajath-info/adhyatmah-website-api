// Shared name -> photo matching for files in public/images/festivals.
// Used by the Vrat & Upvas page so a vrat named e.g. "Aja Ekadashi" or
// "Kalashtami" automatically shows /images/festivals/aja-ekadashi.png etc.
// It is a plain in-memory lookup against the list of files read on the
// server (see app/(spiritual)/vrat-upvas/page.js) — no network guessing.

export function slugifyFestivalName(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function getFestivalImageSlugs(name) {
    if (!name) return [];
    const combined = slugifyFestivalName(name.replace(/\//g, ' '));
    const halves = name.split('/').map((part) => slugifyFestivalName(part));
    // "Pradosh Vrat (Guru)" also tries "pradosh-vrat"
    const withoutParens = slugifyFestivalName(name.replace(/\([^)]*\)/g, ' '));
    return [...new Set([combined, withoutParens, ...halves].filter(Boolean))];
}

export function resolveFestivalImageSrc(name, availableImages) {
    if (!name || !availableImages || availableImages.length === 0) return null;
    const bySlug = new Map(availableImages.map((f) => [f.toLowerCase().replace(/\.[^.]+$/, ''), f]));
    for (const slug of getFestivalImageSlugs(name)) {
        const match = bySlug.get(slug.toLowerCase());
        if (match) return `/images/festivals/${match}`;
    }
    return null;
}