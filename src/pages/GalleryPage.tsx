import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import SkeletonGrid from "../components/SkeletonGrid";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import { formatBytes } from "../utils/format";
import { useImages, useDeleteImage } from "../hooks/useImages";

function GalleryPage() {
  const { searchQuery, gridView } = useOutletContext<any>();
  const { data: images = [], isLoading: loading } = useImages();
  const { mutate: deleteImageMutation } = useDeleteImage();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const handleDelete = useCallback((id: string) => {
    deleteImageMutation(id);
  }, [deleteImageMutation]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filtered = useMemo(() =>
    images.filter((img) =>
      img.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
    ), [images, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const columns = useMemo(() => {
    const colCount = gridView === "grid" ? 4 : 3;
    const cols: any[][] = Array.from({ length: colCount }, () => []);
    paginated.forEach((img, i) => {
      cols[i % colCount].push(img);
    });
    return cols;
  }, [paginated, gridView]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-0.5">Image Library</h1>
          <p className="text-slate-500 text-sm">{filtered.length} images</p>
        </div>
      </div>

      {loading ? <SkeletonGrid /> : images.length === 0 ? <EmptyState /> : (
        <>
          <div className={`flex gap-3 ${gridView === "grid" ? "" : "max-w-3xl mx-auto"}`}>
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-3 flex-1">
                <AnimatePresence>
                  {col.map((img, i) => (
                    <MasonryCard
                      key={img._id}
                      image={img}
                      index={i + colIndex}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}

// MasonryCard stays exactly the same as your current code
function MasonryCard({ image, index, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    onDelete(image._id);
  };

  const aspectRatio = useMemo(() => {
    if (!image.dimensions?.width || !image.dimensions?.height) return "75%";
    return `${(image.dimensions.height / image.dimensions.width) * 100}%`;
  }, [image.dimensions]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className={`rounded-xl overflow-hidden bg-[#1E1E2E] border cursor-pointer transition-all duration-300
          ${hovered ? "border-white/20 shadow-2xl shadow-black/60" : "border-white/[0.07]"}`}>

        <div className="relative w-full overflow-hidden"
          style={{ paddingBottom: aspectRatio }}
          onClick={() => setLightbox(true)}>
          <img src={image.cdnUrl} alt={image.originalFilename} loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500
              ${hovered ? "scale-105" : "scale-100"}`} />

          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm border-none text-rose-400 cursor-pointer flex items-center hover:bg-rose-500/30 transition-colors">
                    {deleting
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full" />
                      : <Trash2 size={14} />}
                  </motion.button>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold truncate mb-1">{image.originalFilename}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">{formatBytes(image.sizeBytes)}</span>
                    <span className="text-white/60 text-xs">{image.dimensions?.width}×{image.dimensions?.height}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-2.5 px-3">
              <p className="text-xs text-white font-medium truncate mb-1">{image.originalFilename}</p>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">{formatBytes(image.sizeBytes)}</span>
                <span className="text-xs text-slate-500">{image.dimensions?.width}×{image.dimensions?.height}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {lightbox && createPortal(
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-8">
            <motion.img initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              src={image.cdnUrl} alt={image.originalFilename}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 border-none text-white cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors">
              <X size={17} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-5 py-2 rounded-full text-white text-xs whitespace-nowrap flex items-center gap-3">
              <span className="font-medium">{image.originalFilename}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">{formatBytes(image.sizeBytes)}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">{image.dimensions?.width}×{image.dimensions?.height}</span>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default GalleryPage;