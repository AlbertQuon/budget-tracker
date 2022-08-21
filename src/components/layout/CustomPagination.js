import { useEffect, useState, useMemo } from "react";
import { Container, Pagination } from "react-bootstrap";
import './../../css/Pagination.css'

function CustomPagination({totalItems = 0, itemsPerPage = 8, currentPage = 1, onPageChange, pagesInterval = 3}) {

    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (totalItems > 0 && itemsPerPage > 0) {
            setTotalPages(Math.ceil(totalItems/itemsPerPage));
        }
    }, [totalItems, itemsPerPage])
    
    const pagItems = useMemo(() => {
        const pages = [];
        const initialPage = currentPage > pagesInterval ? currentPage-pagesInterval : 1;
        const endPage = currentPage+pagesInterval;

        for (let i = initialPage; i <= endPage && i<=totalPages; i++) {
            pages.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return pages;
    }, [totalPages, currentPage, onPageChange, pagesInterval])
    
    // Empty case
    if (totalPages === 0) return null;

    return (
        <Pagination>
            <Pagination.First 
                onClick={() => onPageChange(1)}
                disabled={totalPages === 1}
            />
            <Pagination.Prev
                onClick={() => onPageChange(currentPage-1)}
                disabled={currentPage === 1}
            />
            {currentPage > pagesInterval ? 
                <Pagination.Ellipsis 
                    onClick={() => onPageChange(currentPage-pagesInterval)}
                /> 
                : null 
            }
            {pagItems}
            {currentPage <= totalItems-pagesInterval && totalPages > pagesInterval ? 
                <Pagination.Ellipsis 
                    onClick={() => onPageChange(currentPage+pagesInterval)}
                /> 
                : null 
            }
            <Pagination.Next
                onClick={() => onPageChange(currentPage+1)}
                disabled={currentPage === totalPages}
            />
            <Pagination.Last
                onClick={() => onPageChange(totalPages)}
                disabled={totalPages === 1}
            />
        </Pagination>
    );
}

export default CustomPagination;