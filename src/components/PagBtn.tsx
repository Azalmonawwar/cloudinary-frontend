
import { motion } from "framer-motion";
function PagBtn({ children, onClick, disabled, active }) {
    return (
        <motion.button whileHover={!disabled ? { scale: 1.06 } : {}} whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick} disabled={disabled}
            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer border transition-all
        ${active ? "bg-indigo-500 border-indigo-500 text-white font-bold"
                    : disabled ? "bg-transparent border-transparent text-slate-600 cursor-not-allowed"
                        : "bg-[#252535] border-white/[0.08] text-slate-400 hover:text-white"}`}>
            {children}
        </motion.button>
    );
}

export default PagBtn;