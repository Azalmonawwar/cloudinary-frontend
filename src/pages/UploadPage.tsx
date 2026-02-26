import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadImage } from "../hooks/useImages";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function UploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // ✅ React Query mutation — handles upload + cache update
    const { mutate: uploadImage, isPending: uploading } = useUploadImage((p) => {
        setProgress(p); // ← receives progress updates
    });

    const handleFile = (f: File) => {
        setError(""); setDone(false); setProgress(0);
        if (!ALLOWED.includes(f.type)) {
            setError(`"${f.name}" is not supported. Use JPEG, PNG, WebP, GIF, or AVIF.`);
            return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setError("File exceeds the 50 MB limit.");
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleUpload = () => {
        if (!file) return;

        uploadImage(file, {
            onSuccess: () => {
                setDone(true);
                setTimeout(() => navigate("/dashboard"), 900); // ← redirect after done
            },
            onError: (err: any) => {
                setError(err.message);
                setProgress(0);
            },
        });
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setError("");
        setDone(false);
        setProgress(0);
    };

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
                onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => !file && inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors mb-5
          ${dragOver ? "bg-indigo-500/10" : "bg-transparent"}
          ${!file ? "cursor-pointer hover:border-indigo-500/60 hover:bg-indigo-500/5" : ""}`}>

                <input ref={inputRef} type="file" accept={ALLOWED.join(",")} className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

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
                            <p className="text-slate-500 text-sm">or <span className="text-indigo-400">browse files</span></p>
                        </motion.div>
                    ) : (
                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }} className="flex flex-col items-center">

                            <div className="relative inline-block mb-4">
                                <img src={preview!} alt="preview"
                                    className="max-h-64 max-w-full rounded-xl object-contain shadow-2xl" />
                                {!uploading && !done && (
                                    <button onClick={(e) => { e.stopPropagation(); reset(); }}
                                        className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-rose-500 border-none text-white cursor-pointer flex items-center justify-center hover:bg-rose-600 transition-colors">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded-md bg-[#252535] border border-white/[0.08] text-xs text-slate-400 uppercase">
                                    {file.type.split("/")[1]}
                                </span>
                                <span className="text-slate-300 text-sm">{file.name}</span>
                                <span className="text-slate-500 text-sm">
                                    {file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`}
                                </span>
                            </div>

                            {/* Progress bar */}
                            {uploading && (
                                <div className="w-full mt-5">
                                    <div className="h-1 bg-[#252535] rounded-full overflow-hidden">
                                        <motion.div animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full" />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-1.5 text-center">Uploading… {progress}%</p>
                                </div>
                            )}

                            {/* Done */}
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
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/25 mb-5 text-rose-400 text-sm">
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
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 border-none text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.35)]">
                        <Upload size={17} /> Upload to S3
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UploadPage;