import { FC, useState, useMemo } from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const emojiGroups: { name: string; emoji: string[] }[] = [
  {
    name: "Smileys & people",
    emoji: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊",
      "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "🤗", "🤭", "🤫",
      "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "😶‍🌫️", "😏", "😒", "🙄", "😬",
      "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮"
    ],
  },
  {
    name: "Animals & nature",
    emoji: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮",
      "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺"
    ],
  },
  {
    name: "Food & drink",
    emoji: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
      "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️"
    ],
  },
  {
    name: "Activities",
    emoji: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓",
      "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿"
    ],
  },
  {
    name: "Objects",
    emoji: [
      "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💾",
      "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟"
    ],
  },
  {
    name: "Symbols",
    emoji: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕",
      "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️"
    ],
  },
];

export const EmojiPicker: FC<EmojiPickerProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return emojiGroups;
    const lowerQuery = query.toLowerCase();
    return emojiGroups
      .map((group) => ({
        ...group,
        emoji: group.emoji.filter((e) => e.includes(lowerQuery)),
      }))
      .filter((group) => group.emoji.length > 0);
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 border-b border-[#181B22] pb-3">
        <input
          type="text"
          placeholder="Search emojis"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 flex-1 rounded-full border border-[#181B22] bg-black px-3 text-xs text-[#E7E9EA] placeholder:text-[#808283] backdrop-blur-[50px] focus:border-[#A06AFF] focus:outline-none"
          autoFocus
        />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div key={group.name}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#768089]">
                {group.name}
              </div>
              <div className="grid grid-cols-8 gap-2">
                {group.emoji.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-white/10"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-[#768089]">No emojis found</div>
        )}
      </div>
    </div>
  );
};
