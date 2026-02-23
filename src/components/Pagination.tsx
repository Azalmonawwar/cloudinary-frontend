import { ChevronLeft, ChevronRight } from "lucide-react";
import PagBtn from "./PagBtn";


function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        if (totalPages <= 5) return i + 1;
        if (currentPage <= 3) return i + 1;
        if (currentPage >= totalPages - 2) return totalPages - 4 + i;
        return currentPage - 2 + i;
    });

    return (
        <div className="flex items-center justify-center gap-1.5 mt-10">
            <PagBtn onClick={() => onPageChange((p) => Math.max(1, p - 1))} disabled={currentPage === 1} active={false}>
                <ChevronLeft size={15} />
            </PagBtn>
            {pages.map((p) => (
                <PagBtn key={p} disabled={false} onClick={() => onPageChange(p)} active={p === currentPage}>{p}</PagBtn>
            ))}
            <PagBtn onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} active={false}>
                <ChevronRight size={15} />
            </PagBtn>
        </div>
    );
}


export default Pagination;