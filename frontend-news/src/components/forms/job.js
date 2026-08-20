'use client';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';

// mui
import {
    Card,
    Stack,
    TextField,
    Typography,
    Box,
    Select,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    Skeleton
} from '@mui/material';

// toast
import toast from 'react-hot-toast';

// formik
import { Form, FormikProvider, useFormik } from 'formik';

// api
import * as api from 'src/services';
import { jobSchema } from '@/validations';

JobForm.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

const EMPLOYMENT_TYPE_OPTIONS = ['Full-Time', 'Part-Time', 'Internship', 'Contract', 'Remote'];
const STATUS_OPTIONS = ['active', 'inactive'];

// helper: array <-> newline separated text
const arrToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : (arr || ''));
const arrToCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : (arr || ''));

export default function JobForm({
    data: currentJob,
    isLoading: jobLoading
}) {
    const router = useRouter();

    const mutationFn =
        currentJob
            ?
            api.updateCareerJobByAdmin
            :
            api.addCareerJobByAdmin;

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn,
        retry: false,
        onSuccess: (data) => {
            toast.success(data.message);
            router.push('/admin/careers/jobs');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Something went wrong!');
        }
    });

    const formik = useFormik({
        initialValues: {
            title: currentJob?.title || '',
            department: currentJob?.department || '',
            location: currentJob?.location || '',
            employmentType: currentJob?.employmentType || 'Full-Time',
            experience: currentJob?.experience || '',
            description: currentJob?.description || '',
            responsibilities: arrToLines(currentJob?.responsibilities),
            requirements: arrToLines(currentJob?.requirements),
            skills: arrToCsv(currentJob?.skills),
            openings: currentJob?.openings ?? 1,
            seoTitle: currentJob?.seoTitle || '',
            seoDescription: currentJob?.seoDescription || '',
            status: currentJob ? (currentJob?.status ? 'active' : 'inactive') : 'active'
        },
        enableReinitialize: true,
        validationSchema: jobSchema,
        onSubmit: async (values) => {

            const payload = {
                ...values,
                openings: parseInt(values.openings, 10) || 1
            };

            mutate({
                ...payload,
                ...(currentJob && {
                    id: currentJob._id
                })
            });

        }
    });
    const { errors, values, touched, handleSubmit, getFieldProps } = formik;

    return (
        <Box position="relative">
            <FormikProvider value={formik}>
                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{ md: 8, xs: 12 }}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={3}>
                                    <Stack gap={1}>
                                        {jobLoading ? (
                                            <Skeleton variant="text" width={100} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="title" component={'label'}>
                                                Job Title
                                            </Typography>
                                        )}
                                        {jobLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                id="title"
                                                fullWidth
                                                {...getFieldProps('title')}
                                                error={Boolean(touched.title && errors.title)}
                                                helperText={touched.title && errors.title}
                                                placeholder="e.g. Senior Full-Stack Developer"
                                            />
                                        )}
                                    </Stack>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={100} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="department" component={'label'}>
                                                        Department
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="department"
                                                        fullWidth
                                                        {...getFieldProps('department')}
                                                        error={Boolean(touched.department && errors.department)}
                                                        helperText={touched.department && errors.department}
                                                        placeholder="e.g. Engineering"
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={80} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="location" component={'label'}>
                                                        Location
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="location"
                                                        fullWidth
                                                        {...getFieldProps('location')}
                                                        error={Boolean(touched.location && errors.location)}
                                                        helperText={touched.location && errors.location}
                                                        placeholder="e.g. Delhi, India / Remote"
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={120} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="employmentType" component={'label'}>
                                                        Employment Type
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <Select
                                                        id="employmentType"
                                                        fullWidth
                                                        native
                                                        {...getFieldProps('employmentType')}
                                                        error={Boolean(touched.employmentType && errors.employmentType)}
                                                    >
                                                        {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
                                                            <option key={type} value={type}>
                                                                {type}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                )}
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={90} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="experience" component={'label'}>
                                                        Experience
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="experience"
                                                        fullWidth
                                                        {...getFieldProps('experience')}
                                                        error={Boolean(touched.experience && errors.experience)}
                                                        helperText={touched.experience && errors.experience}
                                                        placeholder="e.g. 2-4 years"
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={80} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="openings" component={'label'}>
                                                        Openings
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="openings"
                                                        type="number"
                                                        fullWidth
                                                        {...getFieldProps('openings')}
                                                        error={Boolean(touched.openings && errors.openings)}
                                                        helperText={touched.openings && errors.openings}
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    <Stack gap={1}>
                                        {jobLoading ? (
                                            <Skeleton variant="text" width={100} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="description" component={'label'}>
                                                Job Description
                                            </Typography>
                                        )}
                                        {jobLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={140} />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                id="description"
                                                {...getFieldProps('description')}
                                                error={Boolean(touched.description && errors.description)}
                                                helperText={touched.description && errors.description}
                                                rows={5}
                                                multiline
                                            />
                                        )}
                                    </Stack>

                                    <Stack gap={1}>
                                        {jobLoading ? (
                                            <Skeleton variant="text" width={140} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="responsibilities" component={'label'}>
                                                Responsibilities (one per line)
                                            </Typography>
                                        )}
                                        {jobLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={140} />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                id="responsibilities"
                                                {...getFieldProps('responsibilities')}
                                                error={Boolean(touched.responsibilities && errors.responsibilities)}
                                                helperText={touched.responsibilities && errors.responsibilities}
                                                rows={5}
                                                multiline
                                                placeholder={'Manage end-to-end puja bookings\nCoordinate with vendors and pandits'}
                                            />
                                        )}
                                    </Stack>

                                    <Stack gap={1}>
                                        {jobLoading ? (
                                            <Skeleton variant="text" width={120} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="requirements" component={'label'}>
                                                Requirements (one per line)
                                            </Typography>
                                        )}
                                        {jobLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={140} />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                id="requirements"
                                                {...getFieldProps('requirements')}
                                                error={Boolean(touched.requirements && errors.requirements)}
                                                helperText={touched.requirements && errors.requirements}
                                                rows={5}
                                                multiline
                                                placeholder={'2+ years experience in Node.js\nGood communication skills'}
                                            />
                                        )}
                                    </Stack>

                                    <Stack gap={1}>
                                        {jobLoading ? (
                                            <Skeleton variant="text" width={60} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="skills" component={'label'}>
                                                Skills (comma separated)
                                            </Typography>
                                        )}
                                        {jobLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                id="skills"
                                                {...getFieldProps('skills')}
                                                error={Boolean(touched.skills && errors.skills)}
                                                helperText={touched.skills && errors.skills}
                                                placeholder="Node.js, MongoDB, React, Next.js"
                                            />
                                        )}
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid size={{ md: 4, xs: 12 }}>
                            <div style={{ position: '-webkit-sticky', position: 'sticky', top: 0 }}>
                                <Stack spacing={3}>
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <FormControl fullWidth sx={{ select: { textTransform: 'capitalize' } }}>
                                                <Stack gap={1}>
                                                    {jobLoading ? (
                                                        <Skeleton variant="text" width={70} />
                                                    ) : (
                                                        <Typography variant="overline" color="text.primary" htmlFor="status" component={'label'}>
                                                            Status
                                                        </Typography>
                                                    )}
                                                    {jobLoading ? (
                                                        <Skeleton variant="rounded" width="100%" height={56} />
                                                    ) : (
                                                        <Select
                                                            id="status"
                                                            native
                                                            {...getFieldProps('status')}
                                                            error={Boolean(touched.status && errors.status)}
                                                        >
                                                            {STATUS_OPTIONS.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                </Stack>

                                                {touched.status && errors.status && (
                                                    <FormHelperText error sx={{ px: 2, mx: 0 }}>
                                                        {touched.status && errors.status}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                            {currentJob && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Marking this inactive hides it from the public /careers listing. Existing applications are not affected.
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Card>

                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={80} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="seoTitle" component={'label'}>
                                                        SEO Title
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="seoTitle"
                                                        fullWidth
                                                        {...getFieldProps('seoTitle')}
                                                        error={Boolean(touched.seoTitle && errors.seoTitle)}
                                                        helperText={touched.seoTitle && errors.seoTitle}
                                                    />
                                                )}
                                            </Stack>
                                            <Stack gap={1}>
                                                {jobLoading ? (
                                                    <Skeleton variant="text" width={130} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="seoDescription" component={'label'}>
                                                        SEO Description
                                                    </Typography>
                                                )}
                                                {jobLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={100} />
                                                ) : (
                                                    <TextField
                                                        id="seoDescription"
                                                        fullWidth
                                                        {...getFieldProps('seoDescription')}
                                                        error={Boolean(touched.seoDescription && errors.seoDescription)}
                                                        helperText={touched.seoDescription && errors.seoDescription}
                                                        rows={3}
                                                        multiline
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Card>

                                    {jobLoading ? (
                                        <Skeleton variant="rounded" width="100%" height={56} />
                                    ) : (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            loading={isLoading}
                                            sx={{ ml: 'auto', mt: 0 }}
                                        >
                                            {currentJob ? 'Update' : 'Create'}
                                        </Button>
                                    )}
                                </Stack>
                            </div>
                        </Grid>
                    </Grid>
                </Form>
            </FormikProvider>
        </Box>
    );
}