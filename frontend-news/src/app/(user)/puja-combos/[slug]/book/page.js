'use client';
import ComboBookingWizard from '@/components/_main/puja-combos/combo-booking-wizard';
import { useParams } from 'next/navigation';

export default function ComboBookPage() {
    const { slug } = useParams();
    return <ComboBookingWizard slug={slug} />;
}