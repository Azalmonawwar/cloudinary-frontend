// hooks/useImages.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../context/AuthContext";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const API = import.meta.env.VITE_API_URL || "/api";

const fetchImages = async () => {
  const res = await fetch(`${API}/images`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch images");
  const data = await res.json();
  return data.images || [];
};

const deleteImage = async (id: string) => {
  const res = await fetch(`${API}/images/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return id;
};

export function useImages() {
  return useQuery({
    queryKey: ["images"],
    staleTime: 1000 * 60 * 5,
    queryFn: fetchImages,
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteImage,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["images"] });
      const previous = queryClient.getQueryData(["images"]);
      queryClient.setQueryData(["images"], (old: any[]) =>
        old.filter((img) => img._id !== id),
      );
      return { previous };
    },
    // If delete fails — rollback UI
    onError: (err, id, context) => {
      queryClient.setQueryData(["images"], context?.previous);
      console.error("Delete failed, rolling back:", err, id);
    },
  });
}

// ── Helper: get image dimensions ─────────────────────────────────────────────
const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
};

// ── Upload mutation ───────────────────────────────────────────────────────────
export function useUploadImage(onProgress?: (progress: number) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // ── Step 1: Get presigned URL ───────────────────────────────────────────
      const presignRes = await fetch(`${API}/images/presign`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { uploadUrl, s3Key, cdnUrl } = await presignRes.json();
      onProgress?.(20);

      // ── Step 2: Upload directly to S3 ──────────────────────────────────────
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          Authorization: `Bearer ${getToken()}`,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("S3 upload failed.");
      onProgress?.(70);

      // ── Step 3: Get image dimensions ────────────────────────────────────────
      const dimensions = await getImageDimensions(file);
      onProgress?.(80);

      // ── Step 4: Sync metadata ───────────────────────────────────────────────
      const syncRes = await fetch(`${API}/images/sync`, {
        method: "POST",

        headers: authHeaders(),
        body: JSON.stringify({
          s3Key,
          cdnUrl,
          originalFilename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          dimensions,
        }),
      });

      if (!syncRes.ok) {
        const err = await syncRes.json();
        throw new Error(err.error || "Failed to save metadata");
      }

      const { image } = await syncRes.json();
      onProgress?.(100);
      return image; // ← returned to onSuccess
    },

    // ✅ On success — add to cache directly, no refetch needed
    onSuccess: (newImage) => {
      queryClient.setQueryData(["images"], (old: any[] = []) => [
        newImage,
        ...old,
      ]);
    },

    onError: (err: any) => {
      console.error("[useUploadImage]", err.message);
    },
  });
}

// Add these to your existing hooks/useImages.ts

// ── Update profile ────────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { displayName: string }) => {
      const res = await fetch(`${API}/auth/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile.");
      return json.user;
    },
    onSuccess: (updatedUser) => {
      // Update auth context cache
      queryClient.setQueryData(["me"], updatedUser);
    },
  });
}

// ── Fetch user stats ──────────────────────────────────────────────────────────
export function useUserStats() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${API}/auth/me`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch stats.");
      const data = await res.json();
      return data.user;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── Delete account ────────────────────────────────────────────────────────────
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/auth/me`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete account.");
      return res.json();
    },
  });
}
