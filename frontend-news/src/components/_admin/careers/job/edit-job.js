'use client';

import React from 'react';
import PropTypes from 'prop-types';

import JobForm from '@/components/forms/job';

EditJob.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

export default function EditJob({
    data,
    isLoading
}) {
    return (
        <JobForm
            data={data}
            isLoading={isLoading}
        />
    );
}