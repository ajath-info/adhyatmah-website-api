import * as Yup from 'yup';

const masterServiceSchema = Yup.object().shape({
    name: Yup.string().required('Service name is required'),
    slug: Yup.string().required('Slug is required'),
    description: Yup.string(),
    duration: Yup.string().required('Duration is required'),
    price: Yup.number().typeError('Price must be a number').required('Price is required').positive('Price must be greater than 0'),
    originalPrice: Yup.number().typeError('Original price must be a number').nullable(),
    image: Yup.mixed().nullable(),
    status: Yup.string().required('Status is required')
});

export default masterServiceSchema;