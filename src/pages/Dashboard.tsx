import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Cloud, LogOut, Menu, Search, Grid3X3, LayoutGrid, Images, Upload, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useImages } from "../hooks/useImages";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [gridView, setGridView] = useState("grid");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { data: images = [] } = useImages();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const navItems = [
        { path: "/dashboard", icon: Images, label: "Library", count: images.length },
        { path: "/dashboard/upload", icon: Upload, label: "Upload" },
        { path: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="flex h-screen w-screen bg-[#0A0A0F] text-white">

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -220, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -220, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-[220px] flex-shrink-0 bg-[#1E1E2E] border-r border-white/[0.07] flex flex-col py-6">

                        {/* Logo */}
                        <div className="flex items-center gap-2.5 px-5 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                                <Cloud size={15} className="text-white" />
                            </div>
                            <span className="font-extrabold text-base tracking-tight">Nimbus</span>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-3">
                            {navItems.map(({ path, icon: Icon, label, count }) => {
                                const isActive = location.pathname === path;
                                return (
                                    <motion.button key={path}
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate(path)}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg mb-1 text-left text-sm font-medium transition-all cursor-pointer border
                                            ${isActive
                                                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                                                : "bg-transparent border-transparent text-slate-400 hover:text-slate-300"}`}>
                                        <Icon size={15} />
                                        <span className="flex-1">{label}</span>
                                        {count !== undefined && (
                                            <span className="bg-[#252535] text-slate-500 text-xs px-1.5 py-0.5 rounded">{count}</span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </nav>

                        {/* User */}
                        <div className="px-4 pt-4 border-t border-white/[0.07]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {user?.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-xs font-semibold truncate">{user?.name ?? user?.email}</div>
                                    <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ backgroundColor: "rgba(251,113,133,0.08)" }}
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-transparent border-none text-slate-500 text-xs cursor-pointer transition-colors hover:text-rose-400">
                                <LogOut size={13} /> Sign out
                            </motion.button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="flex-shrink-0 px-6 py-3.5 border-b border-white/[0.07] bg-[#1E1E2E] flex items-center gap-3">
                    <button onClick={() => setSidebarOpen((o) => !o)}
                        className="bg-transparent border-none text-slate-400 cursor-pointer p-1.5 rounded-lg hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
                        <Menu size={17} />
                    </button>

                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search images…"
                            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#252535] border border-white/[0.08] text-white text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500/50 transition-colors"
                        />
                    </div>

                    <div className="flex gap-1 ml-auto">
                        {[{ v: "grid", Icon: Grid3X3 }, { v: "masonry", Icon: LayoutGrid }].map(({ v, Icon }) => (
                            <button key={v} onClick={() => setGridView(v)}
                                className={`p-2 rounded-lg border cursor-pointer transition-all
                                    ${gridView === v
                                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"}`}>
                                <Icon size={15} />
                            </button>
                        ))}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold cursor-pointer">
                        {user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                </header>

                {/* ✅ Outlet replaces conditional page rendering */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet context={{ searchQuery, gridView }} />
                </div>
            </main>
        </div>
    );
}

export default Dashboard;