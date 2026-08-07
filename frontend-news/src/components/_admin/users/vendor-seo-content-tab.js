'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
    Alert
} from '@mui/material';
import { MdAdd, MdDelete } from 'react-icons/md';
import * as api from 'src/services';

const emptyForm = () => ({
    h1: '',
    introHeading: 'Traditional Puja Services',
    introContent: '',
    aboutHeading: 'Pandit Ji Overview',
    aboutContent: '',
    experience: '',
    specialization: '',
    services: '',
    availability: '',
    faqs: []
});

// Flattens the nested `seoContent` shape stored on the vendor's User
// document into a flat form-state object that's easy to bind to text fields.
const toFormState = (seoContent) => {
    if (!seoContent) return emptyForm();
    return {
        h1: seoContent.h1 || '',
        introHeading: seoContent.intro?.heading || 'Traditional Puja Services',
        introContent: seoContent.intro?.content || '',
        aboutHeading: seoContent.about?.heading || 'Pandit Ji Overview',
        aboutContent: seoContent.about?.content || '',
        experience: seoContent.details?.experience || '',
        specialization: seoContent.details?.specialization || '',
        services: seoContent.details?.services || '',
        availability: seoContent.details?.availability || '',
        faqs: Array.isArray(seoContent.faqs)
            ? seoContent.faqs.map((faq) => ({ question: faq.question || '', answer: faq.answer || '' }))
            : []
    };
};

// Rebuilds the nested `seoContent` shape expected by the backend/User schema
// from the flat form-state object.
const toSeoContentPayload = (form) => ({
    h1: form.h1.trim(),
    intro: {
        heading: form.introHeading.trim(),
        content: form.introContent.trim()
    },
    about: {
        heading: form.aboutHeading.trim(),
        content: form.aboutContent.trim()
    },
    details: {
        experience: form.experience.trim(),
        specialization: form.specialization.trim(),
        services: form.services.trim(),
        availability: form.availability.trim()
    },
    faqs: form.faqs
        .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
        .filter((faq) => faq.question || faq.answer)
});

export default function VendorSeoContentTab({ user, isLoading }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState(emptyForm());

    useEffect(() => {
        setForm(toFormState(user?.seoContent));
    }, [user?._id, user?.seoContent]);

    const { mutate, isPending: isSaving } = useMutation({
        mutationFn: api.updateUserDetailsByAdmin,
        onSuccess: (res) => {
            toast.success(res?.message || 'SEO content updated.');
            queryClient.invalidateQueries({ queryKey: ['user-details', user?._id] });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong!');
        }
    });

    const handleChange = (key) => (e) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const handleFaqChange = (index, key) => (e) => {
        const value = e.target.value;
        setForm((prev) => {
            const faqs = [...prev.faqs];
            faqs[index] = { ...faqs[index], [key]: value };
            return { ...prev, faqs };
        });
    };

    const handleAddFaq = () => {
        setForm((prev) => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
    };

    const handleRemoveFaq = (index) => () => {
        setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        mutate({ id: user._id, seoContent: toSeoContentPayload(form) });
    };

    if (isLoading || !user) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={3}>
                    <Alert severity="info">
                        This content is displayed on the selected pandit's public profile page, including the page heading, the "Traditional Puja Services" section, the "Pandit Ji Overview" section, and the FAQ section.
                    </Alert>

                    <TextField
                        fullWidth
                        label="Page Heading (H1)"
                        placeholder="e.g. Pandit Ashish Shukla | Satyanarayan Katha & Home Puja Services"
                        value={form.h1}
                        onChange={handleChange('h1')}
                    />

                    <Divider />

                    <Typography variant="h6">Traditional Puja Services (Intro Section)</Typography>
                    <TextField
                        fullWidth
                        label="Heading"
                        value={form.introHeading}
                        onChange={handleChange('introHeading')}
                    />
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Content"
                        placeholder="Describe the pujas and services this pandit performs..."
                        value={form.introContent}
                        onChange={handleChange('introContent')}
                    />

                    <Divider />

                    <Typography variant="h6">Pandit Ji Overview (About Section)</Typography>
                    <TextField
                        fullWidth
                        label="Heading"
                        value={form.aboutHeading}
                        onChange={handleChange('aboutHeading')}
                    />
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Content"
                        placeholder="Write a detailed overview of the pandit's background and specialization..."
                        value={form.aboutContent}
                        onChange={handleChange('aboutContent')}
                    />

                    <Divider />

                    <Typography variant="h6">Additional Details</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Experience"
                                placeholder="e.g. 10+ Years"
                                value={form.experience}
                                onChange={handleChange('experience')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Specialization"
                                placeholder="e.g. Satyanarayan Katha, Griha Pravesh Puja, Havan Ceremonies"
                                value={form.specialization}
                                onChange={handleChange('specialization')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Services"
                                placeholder="e.g. Puja Services & Katha Rituals"
                                value={form.services}
                                onChange={handleChange('services')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Availability"
                                placeholder="e.g. Available for Home Services"
                                value={form.availability}
                                onChange={handleChange('availability')}
                            />
                        </Grid>
                    </Grid>

                    <Divider />

                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Frequently Asked Questions</Typography>
                        <Button size="small" startIcon={<MdAdd />} onClick={handleAddFaq}>
                            Add FAQ
                        </Button>
                    </Stack>

                    {form.faqs.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No FAQs added yet.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {form.faqs.map((faq, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label={`Question ${index + 1}`}
                                                value={faq.question}
                                                onChange={handleFaqChange(index, 'question')}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                multiline
                                                minRows={2}
                                                label="Answer"
                                                value={faq.answer}
                                                onChange={handleFaqChange(index, 'answer')}
                                            />
                                        </Stack>
                                        <IconButton size="small" color="error" onClick={handleRemoveFaq(index)}>
                                            <MdDelete />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}

                    <Box>
                        <Button variant="contained" onClick={handleSave} loading={isSaving}>
                            Save SEO Content
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

VendorSeoContentTab.propTypes = {
    user: PropTypes.object,
    isLoading: PropTypes.bool
};