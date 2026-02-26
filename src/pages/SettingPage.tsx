import { motion, AnimatePresence } from "framer-motion";
import InputField from "../components/InputField";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useImages, useUpdateProfile, useUserStats, useDeleteAccount } from "../hooks/useImages";
import { Check, AlertCircle, Images, HardDrive, Zap, Activity, Trash2 } from "lucide-react";

function SettingsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ── Hooks ─────────────────────────────────────────────────────────────────
    const { data: images = [] } = useImages();
    const { data: statsData } = useUserStats();
    const { mutate: updateProfile, isPending: saving } = useUpdateProfile();
    const { mutate: deleteAccount, isPending: deleting } = useDeleteAccount();

    // ── Local state ───────────────────────────────────────────────────────────
    const [displayName, setDisplayName] = useState(user?.name || "");
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // ── Format helpers ────────────────────────────────────────────────────────
    const formatBytes = (b = 0) =>
        b > 1073741824 ? `${(b / 1073741824).toFixed(2)} GB`
            : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB`
                : `${(b / 1024).toFixed(0)} KB`;

    const formatNumber = (n = 0) =>
        n > 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

    // ── Stats from backend ────────────────────────────────────────────────────
    const stats = [
        {
            label: "Total Images",
            value: images.length,               // ← from React Query cache
            icon: Images,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
        },
        {
            label: "Storage Used",
            value: formatBytes(statsData?.totalStorageBytes), // ← from backend
            icon: HardDrive,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
        },
        {
            label: "API Calls",
            value: formatNumber(statsData?.apiCalls || 0),   // ← from backend
            icon: Zap,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Bandwidth",
            value: formatBytes(statsData?.bandwidthBytes),   // ← from backend
            icon: Activity,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
    ];

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSave = () => {
        if (!displayName.trim()) {
            setAlert({ type: "error", message: "Display name cannot be empty." });
            return;
        }
        updateProfile({ displayName }, {
            onSuccess: () => {
                setAlert({ type: "success", message: "Profile updated successfully." });
                setTimeout(() => setAlert(null), 3000);
            },
            onError: (err: any) => {
                setAlert({ type: "error", message: err.message });
                setTimeout(() => setAlert(null), 3000);
            },
        });
    };

    const handleDeleteAccount = () => {
        deleteAccount(undefined, {
            onSuccess: async () => {
                await logout();
                navigate("/login");
            },
            onError: (err: any) => {
                setAlert({ type: "error", message: err.message });
            },
        });
    };

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-extrabold tracking-tight mb-7">Settings</h1>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="p-5 rounded-xl bg-[#1E1E2E] border border-white/[0.07]">
                        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                            <Icon size={15} className={color} />
                        </div>
                        <div className={`text-2xl font-extrabold mb-1 ${color}`}>{value}</div>
                        <div className="text-slate-500 text-xs">{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Profile ── */}
            <div className="p-5 rounded-xl bg-[#1E1E2E] border border-white/[0.07] mb-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Profile</h2>

                {/* Avatar */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-lg font-bold">
                        {user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className="text-white text-sm font-semibold">{user?.name}</p>
                        <p className="text-slate-500 text-xs">Member since {new Date(statsData?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <InputField
                        label="Display name"
                        value={displayName}
                        onChange={setDisplayName}
                        placeholder="Your name"
                        error=""
                    />

                    {/* ✅ Email is read-only — cannot be changed */}
                    <div>
                        <label className="block text-slate-400 text-xs font-medium mb-1.5">
                            Email <span className="text-slate-600 ml-1">(cannot be changed)</span>
                        </label>
                        <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#252535]/50 border border-white/[0.05] text-slate-500 text-sm cursor-not-allowed">
                            {user?.email}
                        </div>
                    </div>

                    {/* Alert */}
                    <AnimatePresence>
                        {alert && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm
                                    ${alert.type === "success"
                                        ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                                        : "bg-rose-500/10 border border-rose-500/25 text-rose-400"}`}>
                                {alert.type === "success"
                                    ? <Check size={14} />
                                    : <AlertCircle size={14} />}
                                {alert.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="self-start px-5 py-2 rounded-lg bg-indigo-500 border-none text-white text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center gap-2">
                        {saving
                            ? <motion.div animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            : "Save changes"}
                    </motion.button>
                </div>
            </div>

            {/* ── Danger zone ── */}
            <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <h2 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">Danger Zone</h2>
                <p className="text-slate-400 text-sm mb-4">
                    Permanently delete your account and all {images.length} images ({formatBytes(statsData?.totalStorageBytes)}). This cannot be undone.
                </p>

                <AnimatePresence mode="wait">
                    {!deleteConfirm ? (
                        <motion.button
                            key="delete-btn"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm(true)}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-transparent border border-rose-500/50 text-rose-400 text-sm font-semibold cursor-pointer hover:bg-rose-500/10 transition-colors">
                            <Trash2 size={14} /> Delete account
                        </motion.button>
                    ) : (
                        <motion.div
                            key="delete-confirm"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col gap-3">
                            <p className="text-rose-400 text-sm font-semibold">
                                ⚠️ Are you sure? All images will be deleted from S3 permanently.
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="px-5 py-2 rounded-lg bg-rose-500 border-none text-white text-sm font-semibold cursor-pointer disabled:opacity-60 flex items-center gap-2">
                                    {deleting
                                        ? <motion.div animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                        : "Yes, delete everything"}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    onClick={() => setDeleteConfirm(false)}
                                    className="px-5 py-2 rounded-lg bg-[#252535] border border-white/[0.09] text-white text-sm font-semibold cursor-pointer">
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default SettingsPage;