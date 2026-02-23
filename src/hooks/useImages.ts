// hooks/useImages.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const fetchImages = async () => {
  const res = await fetch(`${API}/images`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch images");
  const data = await res.json();
  return data.images || [];
};

const deleteImage = async (id: string) => {
  const res = await fetch(`${API}/images/${id}`, {
    method: "DELETE",
    credentials: "include",
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
      console.error("Delete failed, rolling back:", err);
    },
  });
}

export function useAddImage() {
  const queryClient = useQueryClient();

  const addImage = (newImage: any) => {
    queryClient.setQueryData(["images"], (old: any[] = []) => [
      newImage,
      ...old,
    ]);
  };

  return { addImage };
}
