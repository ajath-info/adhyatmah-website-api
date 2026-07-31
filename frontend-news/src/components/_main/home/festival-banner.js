'use client';
import Link from 'next/link';

export default function FestivalBanner({ image, title, subtitle, buttonText, buttonLink }) {
    return (
        <Link
            href={buttonLink || '#'}
            style={{ textDecoration: 'none', display: 'block' }}
        >
            <div
                style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    width: '100%',
                    height: '130px',
                    cursor: 'pointer',
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={title || 'Festival Banner'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: '14px',
                        }}
                    >
                        Yahan apni image lagao
                    </div>
                )}

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '10px',
                        textAlign: 'center',
                    }}
                >
                    {title && (
                        <p style={{ color: '#fff', fontSize: '19px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                            {title}
                        </p>
                    )}
                    {subtitle && (
                        <p style={{ color: '#ffe0a0', fontSize: '12px', margin: 0, lineHeight: 1.2 }}>
                            {subtitle}
                        </p>
                    )}
                    {buttonText && (
                        <span
                            style={{
                                marginTop: '4px',
                                background: '#fb8b05',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: 700,
                                padding: '7px 24px',
                                borderRadius: '50px',
                                display: 'inline-block',
                            }}
                        >
                            {buttonText}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}