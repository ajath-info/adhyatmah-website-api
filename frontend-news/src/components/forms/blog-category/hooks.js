import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "@bprogress/next";

import * as api from "src/services";

import { blogCategorySchema } from "@/validations";

export default function useBlogCategory(currentCategory){

const router=useRouter();

const mutationFn=currentCategory
?api.updateBlogByAdmin
:api.addBlogByAdmin;

const mutation=useMutation({

mutationFn,

retry:false,

onSuccess:(data)=>{

toast.success(data.message);

router.push("/admin/blog-categories");

},

onError:(error)=>{

toast.error(

error?.response?.data?.message ||

"Something went wrong"

);

}

});

const formik=useFormik({

initialValues:{

title:currentCategory?.title || "",

handle:currentCategory?.handle || "",

description:currentCategory?.description || "",

image:currentCategory?.image || null,

metaTitle:currentCategory?.metaTitle || "",

metaDescription:currentCategory?.metaDescription || "",

status:currentCategory?.status
?"active"
:"inactive"

},

enableReinitialize:true,

validationSchema:blogCategorySchema,

onSubmit:(values)=>{

mutation.mutate({

...values,

...(currentCategory && {

currentSlug:currentCategory.handle

})

});

}

});

return{

formik,

mutation

};

}