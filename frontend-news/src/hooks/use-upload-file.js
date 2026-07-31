import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as api from 'src/services';

export const useUploadSingleFile = (onSuccess, onError) => {
  return useMutation({
    mutationFn: ({ file, config }) => {
      if (!file) {
        throw new Error('No file selected');
      }
      // Backend signed upload — does not require Cloudinary upload_preset
      return api.uploadImageToServer(file, config);
    },

    onSuccess: (data, variables, context) => {
      onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Image upload failed';
      toast.error(message);
      if (onError) onError(error, variables, context);
    }
  });
};

export const useUploadMultiFiles = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async ({ files }) => {
      const uploads = files.map((file) => api.uploadImageToServer(file));
      return Promise.all(uploads);
    },
    onSuccess: (results, variables) => {
      onSuccess(results, variables);
    },
    onError: (error, variables) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Image upload failed';
      toast.error(message);
      if (onError) onError(error, variables);
    }
  });
};
