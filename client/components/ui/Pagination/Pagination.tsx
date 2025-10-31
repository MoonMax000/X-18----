import { FC } from "react";

interface Props {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
}

const Pagination: FC<Props> = ({ totalPages, currentPage, onChange }) => {
  const handleFirst = () => onChange(1);
  const handlePrev = () => {
    if (currentPage > 1) onChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onChange(currentPage + 1);
  };
  const handleLast = () => onChange(totalPages);

  const controlClass =
    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded border border-[#16C784] bg-[rgba(11,14,17,0.50)] p-2.5 backdrop-blur-[50px] transition hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.8)] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="inline-flex items-start gap-1">
      <button
        type="button"
        onClick={handleFirst}
        disabled={currentPage === 1}
        aria-label="Go to first page"
        className={controlClass}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path
            d="M14.6585 15L15.8335 13.825L12.0168 10L15.8335 6.175L14.6585 5L9.6585 10L14.6585 15Z"
            fill="#B0B0B0"
          />
          <path
            d="M9.1668 15L10.3418 13.825L6.52513 10L10.3418 6.175L9.1668 5L4.1668 10L9.1668 15Z"
            fill="#B0B0B0"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={controlClass}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path
            d="M12.575 15L13.75 13.825L9.93333 10L13.75 6.175L12.575 5L7.575 10L12.575 15Z"
            fill="#B0B0B0"
          />
        </svg>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isActive = currentPage === page;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            aria-label={`Go to page ${page}`}
            className={`flex h-11 w-11 items-center justify-center rounded p-2 text-[15px] font-bold transition ${
              isActive
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]"
                : "border border-[#16C784] bg-[rgba(11,14,17,0.50)] text-[#B0B0B0] backdrop-blur-[50px] hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.8)] hover:text-white"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={controlClass}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path
            d="M8.675 5L7.5 6.175L11.3167 10L7.5 13.825L8.675 15L13.675 10L8.675 5Z"
            fill="#B0B0B0"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleLast}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
        className={controlClass}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path
            d="M5.3415 5L4.1665 6.175L7.98317 10L4.1665 13.825L5.3415 15L10.3415 10L5.3415 5Z"
            fill="#B0B0B0"
          />
          <path
            d="M10.8332 5L9.6582 6.175L13.4749 10L9.6582 13.825L10.8332 15L15.8332 10L10.8332 5Z"
            fill="#B0B0B0"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
