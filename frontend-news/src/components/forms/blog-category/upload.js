import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import * as api from "src/services";
import { useUploadSingleFile } from "@/hooks/use-upload-file";

export default function useBlogCategoryUpload(formik) {

  const [loading, setLoading] = useState(false);

  // Delete Previous Image
  const { mutateAsync: deleteMutate } = useMutation({
    mutationFn: api.singleDeleteFile,

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Unable to delete image."
      );
    }
  });

  // Upload Image
  const { mutate: uploadMutate } = useUploadSingleFile(

    async (data) => {

      formik.setFieldValue("image", {
        _id: data.public_id,
        url: data.secure_url
      });

      if (formik.values.image?._id) {

        await deleteMutate(
          formik.values.image._id
        );

      }

      setLoading(false);

    },

    () => {

      toast.error("Image upload failed.");

      setLoading(false);

    }

  );

  const handleDrop = (acceptedFiles) => {

    const file = acceptedFiles[0];

    if (!file) return;

    Object.assign(file, {

      preview: URL.createObjectURL(file)

    });

    setLoading(true);

    uploadMutate({

      file,

      config: {

        onUploadProgress: (event) => {

          const progress = Math.floor(

            (event.loaded * 100) / event.total

          );

          setLoading(progress);

        }

      }

    });

  };

  return {

    loading,

    handleDrop

  };

}