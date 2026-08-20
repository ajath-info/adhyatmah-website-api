'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { useFormik, Form, FormikProvider } from 'formik';

// mui
import {
    Box, Stack, Grid, Button, TextField, Typography, alpha
} from '@mui/material';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

// project
import { careerApplicationSchema } from '@/validations';
import PhoneInputField from '@/components/phone-input-field';
import { fData } from '@/utils/format-number';
import * as api from 'src/services';

const ORANGE = '#fb8b05';

export default function CareerApplyForm({ jobId, jobTitle, onSuccess }) {
    const [loading, setLoading] = React.useState(false);
    const [resumeFile, setResumeFile] = React.useState(null);
    const [resumeError, setResumeError] = React.useState('');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 5 * 1024 * 1024,
        onDrop: (accepted, rejected) => {
            if (rejected?.length) {
                setResumeError(rejected[0]?.errors?.[0]?.message || 'Invalid file');
                return;
            }
            setResumeError('');
            if (accepted?.[0]) setResumeFile(accepted[0]);
        }
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            experience: '',
            linkedin: '',
            portfolio: '',
            coverLetter: ''
        },
        validationSchema: careerApplicationSchema,
        onSubmit: async (values, { resetForm }) => {
            if (!resumeFile) {
                setResumeError('Please upload your resume');
                return;
            }

            try {
                setLoading(true);

                const formData = new FormData();
                if (jobId) formData.append('job', jobId);
                formData.append('name', values.name);
                formData.append('email', values.email);
                formData.append('phone', values.phone);
                formData.append('experience', values.experience);
                formData.append('linkedin', values.linkedin || '');
                formData.append('portfolio', values.portfolio || '');
                formData.append('coverLetter', values.coverLetter || '');
                formData.append('resume', resumeFile);

                await api.applyToCareerJob(formData);

                toast.success('Application submitted successfully!');
                resetForm();
                setResumeFile(null);
                if (onSuccess) onSuccess();
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    });

    const { errors, touched, handleSubmit, getFieldProps, values, setFieldValue } = formik;

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                    {jobTitle && (
                        <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                            Applying for: <Box component="span" sx={{ fontWeight: 800, color: ORANGE }}>{jobTitle}</Box>
                        </Typography>
                    )}

                    <Grid container spacing={2.5}>
                        <Grid size={{ md: 6, xs: 12 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                {...getFieldProps('name')}
                                error={Boolean(touched.name && errors.name)}
                                helperText={touched.name && errors.name}
                            />
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                            <TextField
                                label="Email Address"
                                fullWidth
                                {...getFieldProps('email')}
                                error={Boolean(touched.email && errors.email)}
                                helperText={touched.email && errors.email}
                            />
                        </Grid>

                        <Grid size={{ md: 6, xs: 12 }}>
                            <Stack spacing={0.5}>
                                <Typography variant="overline" color="text.primary" component="label">
                                    Phone Number
                                </Typography>
                                <PhoneInputField
                                    error={errors?.phone}
                                    onChange={(val) => setFieldValue('phone', val)}
                                    value={values.phone}
                                />
                                {touched.phone && errors.phone && (
                                    <Typography variant="caption" color="error.main">{errors.phone}</Typography>
                                )}
                            </Stack>
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                            <TextField
                                label="Total Experience (e.g. 2 Years)"
                                fullWidth
                                {...getFieldProps('experience')}
                                error={Boolean(touched.experience && errors.experience)}
                                helperText={touched.experience && errors.experience}
                            />
                        </Grid>

                        <Grid size={{ md: 6, xs: 12 }}>
                            <TextField
                                label="LinkedIn Profile (optional)"
                                fullWidth
                                placeholder="https://linkedin.com/in/username"
                                {...getFieldProps('linkedin')}
                                error={Boolean(touched.linkedin && errors.linkedin)}
                                helperText={touched.linkedin && errors.linkedin}
                            />
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                            <TextField
                                label="Portfolio / GitHub (optional)"
                                fullWidth
                                placeholder="https://github.com/username"
                                {...getFieldProps('portfolio')}
                                error={Boolean(touched.portfolio && errors.portfolio)}
                                helperText={touched.portfolio && errors.portfolio}
                            />
                        </Grid>

                        <Grid size={12}>
                            <TextField
                                label="Cover Letter (optional)"
                                multiline
                                rows={4}
                                fullWidth
                                {...getFieldProps('coverLetter')}
                                error={Boolean(touched.coverLetter && errors.coverLetter)}
                                helperText={touched.coverLetter && errors.coverLetter}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="overline" color="text.primary" component="label" sx={{ display: 'block', mb: 0.5 }}>
                                Upload Resume (PDF/DOC, max 5MB)
                            </Typography>

                            <Box
                                {...getRootProps()}
                                sx={{
                                    border: '1px dashed',
                                    borderColor: resumeError ? 'error.main' : (isDragActive ? ORANGE : 'divider'),
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: (theme) => (isDragActive ? alpha(ORANGE, 0.06) : theme.palette.background.neutral || 'transparent'),
                                    transition: 'all .2s'
                                }}
                            >
                                <input {...getInputProps()} />

                                {!resumeFile ? (
                                    <Stack alignItems="center" spacing={1}>
                                        <FiUploadCloud size={28} color={ORANGE} />
                                        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                                            Drag & drop your resume here, or click to browse
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                            PDF, DOC or DOCX up to 5MB
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
                                        <FiFile size={20} color={ORANGE} />
                                        <Typography sx={{ fontSize: 13.5, fontWeight: 600 }} noWrap>
                                            {resumeFile.name} ({fData(resumeFile.size)})
                                        </Typography>
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                                            sx={{ border: 'none', bgcolor: 'transparent', cursor: 'pointer', display: 'flex' }}
                                        >
                                            <FiX size={16} />
                                        </Box>
                                    </Stack>
                                )}
                            </Box>

                            {resumeError && (
                                <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                                    {resumeError}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        loading={loading}
                        sx={{
                            alignSelf: { xs: 'stretch', sm: 'flex-start' },
                            px: 4,
                            bgcolor: ORANGE,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: 15,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#d06a1a', boxShadow: 'none' }
                        }}
                    >
                        Submit Application
                    </Button>
                </Stack>
            </Form>
        </FormikProvider>
    );
}