import { FC } from 'react';
import { createPortal } from 'react-dom';
import { ReplyPolicy } from '../../types';
import { MenuPosition } from '../hooks';

interface ReplySettingsMenuProps {
  isOpen: boolean;
  position: MenuPosition | null;
  currentSetting: ReplyPolicy;
  onSelect: (policy: ReplyPolicy) => void;
}

const replyOptions: { id: ReplyPolicy; label: string; description: string }[] = [
  {
    id: 'everyone',
    label: 'Everyone',
    description: 'Anyone mentioned can always reply.',
  },
  {
    id: 'following',
    label: 'Accounts you follow',
    description: 'Only people you follow can reply.',
  },
  {
    id: 'verified',
    label: 'Verified accounts',
    description: 'Only verified users can reply.',
  },
  {
    id: 'mentioned',
    label: 'Only accounts you mention',
    description: 'Only people you mention can reply.',
  },
];

/**
 * Reply settings dropdown menu
 * Allows user to select who can reply to their post
 */
export const ReplySettingsMenu: FC<ReplySettingsMenuProps> = ({
  isOpen,
  position,
  currentSetting,
  onSelect,
}) => {
  if (!isOpen || !position) return null;

  return createPortal(
    <div
      className="fixed z-[2300] w-80 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] shadow-2xl backdrop-blur-[100px] p-4"
      style={{
        top: `${position.top - 280}px`,
        left: `${position.left}px`,
      }}
    >
      <h3 className="mb-3 text-sm font-semibold text-white">Who can reply?</h3>
      <div className="space-y-2">
        {replyOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="flex w-full items-start gap-3 rounded-2xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
          >
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill={currentSetting === opt.id ? '#1D9BF0' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              {currentSetting === opt.id && (
                <circle cx="12" cy="12" r="4" fill="#1D9BF0" />
              )}
            </svg>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{opt.label}</div>
              <div className="text-xs text-[#808283]">{opt.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};
