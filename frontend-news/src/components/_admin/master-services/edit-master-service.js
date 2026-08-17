'use client';

import React from 'react';
import PropTypes from 'prop-types';

import MasterServiceForm from '@/components/forms/master-service';

EditMasterService.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

export default function EditMasterService({
    data,
    isLoading
}) {
    return (
        <MasterServiceForm
            data={data}
            isLoading={isLoading}
        />
    );
}