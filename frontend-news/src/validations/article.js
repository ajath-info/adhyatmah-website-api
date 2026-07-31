import * as Yup from 'yup';

const articleSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),

    handle: Yup.string().required('Slug is required'),

    blog: Yup.string().required('Blog Category is required'),

    excerpt: Yup.string().required('Excerpt is required'),

    content: Yup.string().required('Content is required'),

    image: Yup.mixed().required('Image is required'),

    metaTitle: Yup.string().required('SEO Title is required'),

    metaDescription: Yup.string().required('SEO Description is required'),

    status: Yup.string().required('Status is required')
});

export default articleSchema;