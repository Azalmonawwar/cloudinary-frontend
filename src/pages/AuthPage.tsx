
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cloud, Zap, Shield, ArrowRight, Image as ImageIcon,
} from "lucide-react";
import InputField from "../components/InputField";
import { useAuth } from "../context/AuthContext";
function AuthPage() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [form, setForm] = useState({ email: "", password: "", name: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = "Enter a valid email";
        if (form.password.length < 8) e.password = "Min 8 characters";
        if (mode === "register" && !form.name.trim()) e.name = "Name is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setServerError("");

        try {
            if (mode === "login") {
                await login(form.email, form.password);
            } else {
                await register(form.email, form.password, form.name);
            }
            // ✅ No need to redirect — App.tsx automatically shows Dashboard when user is set
        } catch (err: any) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Zap, label: "On-the-fly transforms", desc: "Resize, crop & convert in real-time" },
        { icon: Shield, label: "Secure by default", desc: "AES-256 encryption at rest" },
        { icon: Cloud, label: "Global CDN delivery", desc: "Sub-50ms delivery worldwide" },
    ];

    return (
        <div className="flex min-h-screen bg-[#0A0A0F] font-sans">
            {/* ── Left decorative panel ── */}
            <div className="flex-1 relative overflow-hidden flex flex-col justify-center p-12 hidden lg:flex">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-[#16161F]" />
                <div className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(99,102,241,0.22) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 70% 70%, rgba(34,211,238,0.09) 0%, transparent 60%)" }} />

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: "linear-gradient(rgba(58,58,82,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(58,58,82,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                {/* Floating orbs */}
                {[
                    { size: "w-72 h-72", pos: "top-[5%] left-[8%]", color: "bg-indigo-500/10" },
                    { size: "w-48 h-48", pos: "top-[55%] left-[55%]", color: "bg-cyan-400/7" },
                    { size: "w-36 h-36", pos: "top-[30%] left-[65%]", color: "bg-rose-400/6" },
                ].map((orb, i) => (
                    <motion.div key={i}
                        animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
                        transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute ${orb.size} ${orb.pos} ${orb.color} rounded-full blur-3xl`} />
                ))}

                {/* Content */}
                <div className="relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 mb-12">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
                                <Cloud size={17} className="text-white" />
                            </div>
                            <span className="text-white font-extrabold text-lg tracking-tight">Nimbus</span>
                        </div>

                        <h1 className="text-5xl font-extrabold text-white leading-[1.08] tracking-[-0.04em] mb-5">
                            Your images,<br />
                            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                everywhere.
                            </span>
                        </h1>

                        <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
                            A powerful image CDN with on-the-fly transformations, instant uploads, and global delivery.
                        </p>

                        {/* Feature list */}
                        <div className="flex flex-col gap-3">
                            {features.map(({ icon: Icon, label, desc }, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                                        <Icon size={15} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">{label}</div>
                                        <div className="text-slate-500 text-xs">{desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="w-full lg:w-[440px] flex items-center justify-center p-8 bg-[#1E1E2E] border-l border-white/[0.07]">
                <div className="w-full max-w-[360px]">
                    <AnimatePresence mode="wait">
                        <motion.div key={mode}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ duration: 0.22 }}>

                            <h2 className="text-[1.65rem] font-extrabold text-white tracking-tight mb-1">
                                {mode === "login" ? "Welcome back" : "Create account"}
                            </h2>
                            <p className="text-slate-400 text-sm mb-8">
                                {mode === "login" ? "Sign in to your Nimbus workspace" : "Start managing your images today"}
                            </p>

                            {/* Google button */}
                            <motion.button
                                whileHover={{ backgroundColor: "rgba(46,46,66,1)" }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#252535] border border-white/[0.09] text-white text-sm font-semibold cursor-pointer mb-6 transition-colors">
                                <svg width="17" height="17" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </motion.button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px bg-white/[0.08]" />
                                <span className="text-slate-600 text-xs">or</span>
                                <div className="flex-1 h-px bg-white/[0.08]" />
                            </div>

                            {/* Fields */}
                            {mode === "register" && (
                                <InputField label="Full name" value={form.name} error={errors.name}
                                    onChange={(v: string) => setForm((f) => ({ ...f, name: v }))} placeholder="Alex Chen" />
                            )}
                            <InputField label="Email" type="email" value={form.email} error={errors.email}
                                onChange={(v: string) => setForm((f) => ({ ...f, email: v }))} placeholder="you@company.com" />
                            <InputField label="Password" type="password" value={form.password} error={errors.password}
                                onChange={(v: string) => setForm((f) => ({ ...f, password: v }))} placeholder="Min. 8 characters" />

                            {mode === "login" && (
                                <div className="text-right -mt-2 mb-5">
                                    <button className="bg-transparent border-none text-indigo-400 text-xs cursor-pointer font-medium hover:text-indigo-300 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                className={`w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 border-none text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_28px_rgba(99,102,241,0.5)] transition-shadow ${mode === "register" ? "mt-5" : ""}`}>
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={15} /></>
                                )}
                            </motion.button>

                            {/* Toggle */}
                            <p className="text-center text-slate-400 text-sm mt-5">
                                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => { setMode((m) => (m === "login" ? "register" : "login")); setErrors({}); }}
                                    className="bg-transparent border-none text-indigo-400 font-semibold cursor-pointer text-sm hover:text-indigo-300 transition-colors">
                                    {mode === "login" ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;