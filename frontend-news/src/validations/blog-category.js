import * as Yup from "yup";

const blogCategorySchema = Yup.object().shape({

title:Yup.string().required(),

image:Yup.mixed().required(),

handle:Yup.string().required(),

description:Yup.string().required(),

metaTitle:Yup.string().required(),

metaDescription:Yup.string().required()

});

export default blogCategorySchema;