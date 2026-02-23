
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { formatBytes } from "../utils/format";
// import { formatBytes } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
function UploadPage({ onUpload }) {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const inputRef = useRef();

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

    const handleFile = (f) => {
        setError(""); setDone(false); setProgress(0);
        if (!ALLOWED.includes(f.type)) {
            setError(`"${f.name}" is not supported. Use JPEG, PNG, WebP, GIF, or AVIF.`);
            setFile(null); setPreview(null); return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setError("File exceeds the 50 MB limit.");
            setFile(null); setPreview(null); return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };
    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
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

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(0);

        try {
            // ── Step 1: Get presigned URL ──────────────────────────────────────────
            const presignRes = await fetch(`${API}/images/presign`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
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
            setProgress(20);

            // ── Step 2: Upload directly to S3 ─────────────────────────────────────
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type }, // must match presign
                body: file,
            });

            if (!uploadRes.ok) throw new Error("S3 upload failed.");
            setProgress(70);

            // ── Step 3: Get image dimensions ──────────────────────────────────────
            const dimensions = await getImageDimensions(file);
            setProgress(80);

            // ── Step 4: Sync metadata to server ───────────────────────────────────
            const syncRes = await fetch(`${API}/images/sync`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
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
            setProgress(100);
            setDone(true);
            setUploading(false);

            setTimeout(() => onUpload(image), 900);

        } catch (err: any) {
            setUploading(false);
            setProgress(0);
            setError(err.message);
        }
    };


    const reset = () => { setFile(null); setPreview(null); setError(""); setDone(false); setProgress(0); };

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-7">
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">Upload Image</h1>
                <p className="text-slate-500 text-sm">JPEG · PNG · WebP · GIF · AVIF — max 50 MB</p>
            </div>

            {/* Drop zone */}
            <motion.div
                animate={{ borderColor: dragOver ? "rgb(99,102,241)" : error ? "rgb(244,63,94)" : "rgba(255,255,255,0.1)" }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors mb-5
          ${dragOver ? "bg-indigo-500/10" : "bg-transparent"}
          ${!file ? "cursor-pointer hover:border-indigo-500/60 hover:bg-indigo-500/5" : ""}`}>

                <input ref={inputRef} type="file" accept={ALLOWED.join(",")} className="hidden"
                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center">
                            <motion.div animate={{ y: dragOver ? -10 : 0 }} transition={{ type: "spring", stiffness: 300 }}
                                className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-4">
                                <Upload size={22} className="text-indigo-400" />
                            </motion.div>
                            <p className="text-white font-semibold text-base mb-1">
                                {dragOver ? "Drop it here!" : "Drag & drop your image"}
                            </p>
                            <p className="text-slate-500 text-sm">
                                or <span className="text-indigo-400">browse files</span>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }} className="flex flex-col items-center">
                            <div className="relative inline-block mb-4">
                                <img src={preview} alt="preview"
                                    className="max-h-64 max-w-full rounded-xl object-contain shadow-2xl" />
                                <button onClick={(e) => { e.stopPropagation(); reset(); }}
                                    className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-rose-500 border-none text-white cursor-pointer flex items-center justify-center hover:bg-rose-600 transition-colors">
                                    <X size={13} />
                                </button>
                            </div>

                            {/* File badge */}
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded-md bg-[#252535] border border-white/[0.08] text-xs text-slate-400 uppercase">
                                    {file.type.split("/")[1]}
                                </span>
                                <span className="text-slate-300 text-sm">{file.name}</span>
                                <span className="text-slate-500 text-sm">{formatBytes(file.size)}</span>
                            </div>

                            {/* Progress */}
                            {uploading && (
                                <div className="w-full mt-5">
                                    <div className="h-1 bg-[#252535] rounded-full overflow-hidden">
                                        <motion.div animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full" />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-1.5 text-center">Uploading… {progress}%</p>
                                </div>
                            )}

                            {done && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-semibold">
                                    <Check size={15} /> Upload complete! Redirecting…
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/8 border border-rose-500/25 mb-5 text-rose-400 text-sm">
                        <AlertCircle size={15} className="flex-shrink-0" /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload button */}
            <AnimatePresence>
                {file && !uploading && !done && (
                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={handleUpload}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 border-none text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_28px_rgba(99,102,241,0.5)] transition-shadow">
                        <Upload size={17} /> Upload to S3
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UploadPage;