import { AnimatePresence, motion } from "framer-motion";
import { Eye, Trash2, X } from "lucide-react";  // ✅ added X
import { useState } from "react";
import { createPortal } from "react-dom";  // ✅ added createPortal
import { formatBytes } from "../utils/format";

function ImageCard({ image, index, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [lightbox, setLightbox] = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation();
        setDeleting(true);
        await new Promise((r) => setTimeout(r, 400));
        onDelete(image._id);
    };

    return (
        <>
            <motion.div layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: index * 0.03 }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                className={`rounded-xl overflow-hidden bg-[#1E1E2E] border cursor-pointer transition-all duration-200
          ${hovered ? "border-white/20 shadow-2xl shadow-black/50 -translate-y-0.5" : "border-white/[0.07]"}`}>

                {/* Thumbnail */}
                <div className="relative overflow-hidden aspect-[4/3]" onClick={() => setLightbox(true)}>
                    <img src={image.cdnUrl} alt={image.originalFilename} loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`} />

                    <AnimatePresence>
                        {hovered && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                                    className="p-1.5 rounded-lg bg-white/15 border-none text-white cursor-pointer flex items-center">
                                    <Eye size={13} />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={handleDelete}
                                    className="p-1.5 rounded-lg bg-rose-500/20 border-none text-rose-400 cursor-pointer flex items-center hover:bg-rose-500/35 transition-colors">
                                    {deleting
                                        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity }}
                                            className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full" />
                                        : <Trash2 size={13} />}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Info */}
                <div className="p-2.5 px-3">
                    <p className="text-xs text-white font-medium truncate mb-1">{image.originalFilename}</p>
                    <div className="flex justify-between">
                        <span className="text-xs text-slate-500">{formatBytes(image.sizeBytes)}</span>
                        <span className="text-xs text-slate-500">{image.dimensions?.width}×{image.dimensions?.height}</span>
                    </div>
                </div>
            </motion.div>

            {/* ✅ Lightbox via portal — no z-index or overflow issues */}
            {lightbox && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(false)}
                        className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-8">

                        <motion.img
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            src={image.cdnUrl}
                            alt={image.originalFilename}
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            onClick={() => setLightbox(false)}
                            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 border-none text-white cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors">
                            <X size={17} />
                        </button>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs whitespace-nowrap">
                            {image.originalFilename} · {formatBytes(image.sizeBytes)} · {image.dimensions?.width}×{image.dimensions?.height}
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

export default ImageCard;