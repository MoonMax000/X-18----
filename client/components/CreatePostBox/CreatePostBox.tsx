import { FC, useState } from "react";
import type { ViewMode } from "@/screens/home/Home";
import CreatePostModal from "./CreatePostModal";

interface CreatePostBoxProps {
  onToggleView?: () => void;
  viewMode?: ViewMode;
}

const CreatePostBox: FC<CreatePostBoxProps> = ({
  onToggleView,
  viewMode = "normal",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-4 rounded-3xl border border-[#181B22] bg-black p-4 backdrop-blur-[50px]">
      {/* Input area */}
      <div className="flex w-full items-start gap-2">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/928e0a03eef447eade18cba6b182af59d4bd42b9?width=88"
          alt=""
          className="h-11 w-11 flex-shrink-0 rounded-full"
        />
        <div
          onClick={() => setIsModalOpen(true)}
          className="relative flex flex-1 flex-col items-center rounded-2xl border border-[#181B22] bg-black px-4 py-3 shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px] cursor-pointer hover:bg-[#482090]/10 transition-colors"
        >
          <div className="w-full text-[15px] font-normal text-[#B0B0B0]">
            How do you feel about markets today? Share your ideas here!
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleView}
          aria-label={
            viewMode === "normal"
              ? "Switch to compact view"
              : "Switch to normal view"
          }
          aria-pressed={viewMode === "compact"}
          className={`group inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/50 focus-visible:ring-offset-0 ${
            viewMode === "compact"
              ? "border-[#A06AFF] bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
              : "border-transparent bg-[#A06AFF]/10 text-[#E3D8FF] hover:border-[#A06AFF] hover:bg-[#A06AFF]/20 hover:text-white"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200 group-hover:scale-105"
          >
            <path
              d="M3.51256 9.48744C4.02513 10 4.85008 10 6.5 10C8.14992 10 8.97487 10 9.48744 9.48744C10 8.97487 10 8.14992 10 6.5C10 4.85008 10 4.02513 9.48744 3.51256C8.97487 3 8.14992 3 6.5 3C4.85008 3 4.02513 3 3.51256 3.51256C3 4.02513 3 4.85008 3 6.5C3 8.14992 3 8.97487 3.51256 9.48744Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.51256 20.4874C4.02513 21 4.85008 21 6.5 21C8.14992 21 8.97487 21 9.48744 20.4874C10 19.9749 10 19.1499 10 17.5C10 15.8501 10 15.0251 9.48744 14.5126C8.97487 14 8.14992 14 6.5 14C4.85008 14 4.02513 14 3.51256 14.5126C3 15.0251 3 15.8501 3 17.5C3 19.1499 3 19.9749 3.51256 20.4874Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 4H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 15H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 9H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 20H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex w-full items-center justify-end">
        {/* Post button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-10 min-w-[92px] items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/60 focus-visible:ring-offset-0"
        >
          Post
        </button>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CreatePostBox;
