import { ImageIcon } from "lucide-react";

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-5">
                <ImageIcon size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold mb-1.5">No images yet</h3>
            <p className="text-slate-500 text-sm">Upload your first image to get started</p>
        </div>
    );
}
export default EmptyState;