'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FormikProvider, Form, useFormik } from 'formik';
import { Card, Grid, Stack, TextField, Button, MenuItem, Typography } from '@mui/material';
import toast from 'react-hot-toast';

import * as api from 'src/services';
import { articleSchema } from '@/validations';
import UploadSingleFile from '@/components/upload/upload-single-file';
import { useUploadSingleFile } from '@/hooks/use-upload-file';
import TipTapEditor from '@/components/tip-tap-editor';

ArticleForm.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
];

export default function ArticleForm({ data: currentArticle, isLoading }) {
    const router = useRouter();

    const [state, setState] = useState({
        loading: false
    });

    const mutationFn = currentArticle
        ? api.updateArticleByAdmin
        : api.addArticleByAdmin;

    const { data: blogs, isPending: blogsLoading } = useQuery({
        queryKey: ['blog-categories-dropdown'],
        queryFn: () => api.getBlogsByAdmin(1, '')
    });

    const generateSlug = (value = '') =>
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    const { mutate, isPending } = useMutation({
        mutationFn,
        onSuccess: (data) => {
            toast.success(data.message);
            router.push('/admin/articles');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Something went wrong');
        }
    });

    const formik = useFormik({
        initialValues: {
            title: currentArticle?.title || '',
            handle: currentArticle?.handle || '',
            blog: currentArticle?.blog?._id || '',
            excerpt: currentArticle?.excerpt || '',
            content: currentArticle?.content || '',
            image: currentArticle?.image || null,
            metaTitle: currentArticle?.seoTitle || '',
            metaDescription: currentArticle?.seoDescription || '',
            status: currentArticle
                ? currentArticle.status
                    ? 'active'
                    : 'inactive'
                : 'active'
        },
        enableReinitialize: true,
        validationSchema: articleSchema,
        onSubmit: (values) => {
            mutate({
                ...values,
                ...(currentArticle && { id: currentArticle._id })
            });
        }
    });

    const {
        values,
        errors,
        touched,
        getFieldProps,
        setFieldValue,
        handleSubmit
    } = formik;

    const { mutate: uploadImage } = useUploadSingleFile(
        (data) => {
            setFieldValue('image', {
                _id: data.public_id,
                url: data.secure_url
            });
            setState({ loading: false });
        },
        () => {
            toast.error('Image upload failed');
            setState({ loading: false });
        }
    );

    const handleDrop = (acceptedFiles) => {
        const file = acceptedFiles?.[0];
        if (!file) return;

        setState({ loading: true });
        uploadImage({ file });
    };

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* LEFT SIDE */}
                    <Grid size={{ md: 8, xs: 12 }}>
                        <Card sx={{ p: 3 }}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    name="title"
                                    label="Article Title"
                                    value={values.title}
                                    onChange={(e) => {
                                        formik.handleChange(e);

                                        if (!currentArticle) {
                                            setFieldValue("handle", generateSlug(e.target.value));
                                        }
                                    }}
                                    error={Boolean(touched.title && errors.title)}
                                    helperText={touched.title && errors.title}
                                />

                                <TextField
                                    fullWidth
                                    name="handle"
                                    label="Slug"
                                    value={values.handle}
                                    onChange={formik.handleChange}
                                    error={Boolean(touched.handle && errors.handle)}
                                    helperText={touched.handle && errors.handle}
                                />

                                <TextField
                                    select
                                    fullWidth
                                    name="blog"
                                    label="Blog Category"
                                    value={values.blog}
                                    onChange={formik.handleChange}
                                    disabled={blogsLoading}
                                    error={Boolean(touched.blog && errors.blog)}
                                    helperText={touched.blog && errors.blog}
                                >
                                    {blogs?.data?.map((item) => (
                                        <MenuItem key={item._id} value={item._id}>
                                            {item.title}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    name="excerpt"
                                    label="Excerpt"
                                    value={values.excerpt}
                                    onChange={formik.handleChange}
                                    error={Boolean(touched.excerpt && errors.excerpt)}
                                    helperText={touched.excerpt && errors.excerpt}
                                />

                                <Stack gap={1}>
                                    <Typography variant="overline" component="label" htmlFor="content">
                                        Article Content
                                    </Typography>

                                    <TipTapEditor
                                        value={values.content}
                                        onChange={(v) => setFieldValue('content', v)}
                                    />

                                    {Boolean(touched.content && errors.content) && (
                                        <Typography variant="caption" color="error">
                                            {errors.content}
                                        </Typography>
                                    )}
                                </Stack>
                            </Stack>
                        </Card>
                    </Grid>

                    {/* RIGHT SIDE */}
                    <Grid size={{ md: 4, xs: 12 }}>
                        <Stack spacing={3}>
                            <Card sx={{ p: 3 }}>
                                <UploadSingleFile
                                    file={values.image}
                                    loading={state.loading}
                                    onDrop={handleDrop}
                                />
                            </Card>

                            <Card sx={{ p: 3 }}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        name="metaTitle"
                                        label="SEO Title"
                                        value={values.metaTitle}
                                        onChange={formik.handleChange}
                                        error={Boolean(touched.metaTitle && errors.metaTitle)}
                                        helperText={touched.metaTitle && errors.metaTitle}
                                    />

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={5}
                                        name="metaDescription"
                                        label="SEO Description"
                                        value={values.metaDescription}
                                        onChange={formik.handleChange}
                                        error={Boolean(
                                            touched.metaDescription && errors.metaDescription
                                        )}
                                        helperText={touched.metaDescription && errors.metaDescription}
                                    />

                                    <TextField
                                        select
                                        fullWidth
                                        name="status"
                                        label="Status"
                                        value={values.status}
                                        onChange={formik.handleChange}
                                    >
                                        {STATUS_OPTIONS.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Button
                                        fullWidth
                                        size="large"
                                        variant="contained"
                                        type="submit"
                                        disabled={isPending || isLoading}
                                    >
                                        {currentArticle ? "Update Article" : "Create Article"}
                                    </Button>
                                </Stack>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Form>
        </FormikProvider>
    );
}