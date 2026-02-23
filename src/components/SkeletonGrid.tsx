import { motion } from "framer-motion";
function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                    animate={{ opacity: [0.4, 0.65, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07 }}
                    className="rounded-xl overflow-hidden bg-[#1E1E2E] border border-white/[0.06]">
                    <div className="aspect-[4/3] bg-[#252535]" />
                    <div className="p-3">
                        <div className="h-2.5 bg-[#252535] rounded mb-2 w-3/4" />
                        <div className="h-2 bg-[#252535] rounded w-2/5" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default SkeletonGrid;