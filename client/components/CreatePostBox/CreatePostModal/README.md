# CreatePostModal

Refactored and modular implementation of the CreatePostModal component.

## 📁 Structure

```
CreatePostModal/
├── CreatePostModal.tsx         # Main modal component (~500 lines)
├── index.tsx                   # Barrel export
│
├── components/                 # UI Components
│   ├── CreatePostModalHeader.tsx
│   ├── CreatePostModalToolbar.tsx
│   ├── CreatePostModalFooter.tsx
│   ├── ReplySettingsMenu.tsx
│   ├── EmojiPickerOverlay.tsx
│   └── index.ts
│
└── hooks/                      # Custom hooks
    ├── useModalKeyboardShortcuts.ts
    ├── useDraftManagement.ts
    ├── useClickOutside.ts
    ├── useMenuPositioning.ts
    └── index.ts
```

## 🎯 Purpose

This structure separates concerns and makes the codebase more maintainable:

- **Main Component**: Orchestrates the modal logic
- **UI Components**: Reusable presentational components
- **Hooks**: Encapsulated business logic and side effects

## 📦 Usage

```tsx
import CreatePostModal from '@/components/CreatePostBox/CreatePostModal';

<CreatePostModal
  isOpen={isOpen}
  onClose={handleClose}
  initialBlocks={blocks}
  onBlocksChange={handleBlocksChange}
/>
```

## 🔧 Components

### CreatePostModalHeader
Header with close button and drafts link.

### CreatePostModalToolbar
Toolbar with media, emoji, code block buttons and sentiment toggles.

### CreatePostModalFooter
Footer with reply settings, character counter, and post button.

### ReplySettingsMenu
Dropdown menu for selecting who can reply to the post.

### EmojiPickerOverlay
Emoji picker overlay with portal rendering.

## 🪝 Hooks

### useModalKeyboardShortcuts
Handles keyboard shortcuts:
- `Escape` - Close modal
- `Cmd/Ctrl + Enter` - Submit post

### useDraftManagement
Manages draft saving, loading, and auto-saving to localStorage.

### useClickOutside
Detects clicks outside an element and triggers callback.

### useMenuPositioning
Calculates and manages menu positioning relative to trigger elements.

## 🏗️ Previous Implementation

The previous monolithic implementation (983 lines) has been backed up to:
`client/components/CreatePostBox/CreatePostModal.BACKUP.tsx`

## ✅ Benefits

1. **Modularity**: Each component and hook has a single responsibility
2. **Reusability**: Hooks and components can be used elsewhere
3. **Testability**: Smaller units are easier to test
4. **Maintainability**: Clear structure makes changes easier
5. **Discoverability**: Related files are grouped together
6. **AI-Friendly**: Clear organization helps AI assistants understand relationships

## 📝 Migration Notes

All imports remain the same thanks to the barrel export in `index.tsx`:

```tsx
// Both work the same
import CreatePostModal from '@/components/CreatePostBox/CreatePostModal';
import { CreatePostModal } from '@/components/CreatePostBox/CreatePostModal';
```

No changes needed in consuming components.
