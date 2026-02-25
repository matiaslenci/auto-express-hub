import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadService, UploadResponse } from '@/api/services/upload.service';

interface UseUploadOptions {
    onSuccess?: (response: UploadResponse) => void;
    onError?: (error: Error) => void;
}

export function useUploadVehicleImage(options?: UseUploadOptions) {
    const [progress, setProgress] = useState(0);

    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.uploadVehicleImage(file),
        onSuccess: (data) => {
            setProgress(100);
            options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
            setProgress(0);
            options?.onError?.(error);
        },
    });

    return {
        upload: mutation.mutate,
        uploadAsync: mutation.mutateAsync,
        isUploading: mutation.isPending,
        progress,
        error: mutation.error,
        reset: mutation.reset,
    };
}

export function useUploadAgencyLogo(options?: UseUploadOptions) {
    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.uploadAgencyLogo(file),
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });

    return {
        upload: mutation.mutate,
        uploadAsync: mutation.mutateAsync,
        isUploading: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}

export function useUploadAgencyCover(options?: UseUploadOptions) {
    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.uploadAgencyCover(file),
        onSuccess: options?.onSuccess,
        onError: options?.onError,
    });

    return {
        upload: mutation.mutate,
        uploadAsync: mutation.mutateAsync,
        isUploading: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}

export function useDeleteImage() {
    const mutation = useMutation({
        mutationFn: ({ folder, filename }: { folder: 'vehicles' | 'agencies'; filename: string }) =>
            uploadService.deleteImage(folder, filename),
    });

    return {
        deleteImage: mutation.mutate,
        deleteImageAsync: mutation.mutateAsync,
        isDeleting: mutation.isPending,
        error: mutation.error,
    };
}
