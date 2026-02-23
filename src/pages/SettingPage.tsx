
import { AnimatePresence, motion } from "framer-motion";
import InputField from "../components/InputField";
function SettingsPage({ user, totalImages }) {
    const stats = [
        { label: "Total Images", value: totalImages, color: "text-indigo-400" },
        { label: "Storage Used", value: "2.4 GB", color: "text-cyan-400" },
        { label: "Bandwidth", value: "18.2 GB", color: "text-amber-400" },
        { label: "API Calls", value: "14,291", color: "text-emerald-400" },
    ];

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-extrabold tracking-tight mb-7">Settings</h1>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.map(({ label, value, color }) => (
                    <div key={label} className="p-5 rounded-xl bg-[#1E1E2E] border border-white/[0.07]">
                        <div className={`text-2xl font-extrabold mb-1 ${color}`}>{value}</div>
                        <div className="text-slate-500 text-xs">{label}</div>
                    </div>
                ))}
            </div>

            {/* Profile */}
            <div className="p-5 rounded-xl bg-[#1E1E2E] border border-white/[0.07] mb-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Profile</h2>
                <div className="flex flex-col gap-4">
                    <InputField label="Display name" value={user.name} onChange={() => { }} />
                    <InputField label="Email" type="email" value={user.email} onChange={() => { }} />
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        className="self-start px-5 py-2 rounded-lg bg-indigo-500 border-none text-white text-sm font-semibold cursor-pointer">
                        Save changes
                    </motion.button>
                </div>
            </div>

            {/* Danger zone */}
            <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <h2 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">Danger Zone</h2>
                <p className="text-slate-400 text-sm mb-4">Permanently delete your account and all images. This cannot be undone.</p>
                <button className="px-5 py-2 rounded-lg bg-transparent border border-rose-500/50 text-rose-400 text-sm font-semibold cursor-pointer hover:bg-rose-500/10 transition-colors">
                    Delete account
                </button>
            </div>
        </div>
    );
}

export default SettingsPage;