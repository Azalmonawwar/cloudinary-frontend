import { AnimatePresence } from "framer-motion";
import SkeletonGrid from "../components/SkeletonGrid";
import ImageCard from "../components/ImageCard";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";

function GalleryPage({ images, loading, onDelete, gridView, currentPage, totalPages, onPageChange, totalImages }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-0.5">Image Library</h1>
          <p className="text-slate-500 text-sm">{totalImages} images</p>
        </div>
      </div>

      {loading ? <SkeletonGrid /> : images.length === 0 ? <EmptyState /> : (
        <>
          <div className={`grid gap-4 ${gridView === "grid"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
            <AnimatePresence>
              {images.map((img, i) => <ImageCard key={img._id} image={img} index={i} onDelete={onDelete} />)}
            </AnimatePresence>
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        </>
      )}
    </div>
  );
}


export default GalleryPage;

