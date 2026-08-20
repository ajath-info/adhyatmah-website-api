'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import CareerJobDetail from 'src/components/_main/careers/job-detail';

export default function Page() {
    const { slug } = useParams();

    return <CareerJobDetail slug={slug} />;
}