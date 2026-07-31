import * as Yup from 'yup';

const blogCategorySchema = Yup.object().shape({
    title: Yup.string().required('Category name is required'),
    handle: Yup.string().required('Slug is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.mixed().required('Image is required'),
    metaTitle: Yup.string().required('SEO Title is required'),
    metaDescription: Yup.string().required('SEO Description is required'),
    status: Yup.string().required('Status is required')
});

export default blogCategorySchema;