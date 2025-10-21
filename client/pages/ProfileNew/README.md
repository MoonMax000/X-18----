# ProfileNew - Refactored Profile Settings Page

Refactored from monolithic 2664-line component into modular structure.

## 📁 Planned Structure

```
ProfileNew/
├── ProfileNew.tsx              # Main component (~200 lines)
├── index.tsx                   # Barrel export
├── types.ts                    # Type definitions
├── README.md                   # This file
│
├── config/                     # Configuration files
│   ├── tabs.tsx               # Main tab configurations
│   ├── profileSubTabs.tsx     # Profile sub-tabs config
│   ├── socialSubTabs.tsx      # Social sub-tabs config
│   ├── marketplaceSubTabs.tsx # Marketplace sub-tabs config
│   ├── streamingSubTabs.tsx   # Streaming sub-tabs config
│   ├── portfolioSubTabs.tsx   # Portfolio sub-tabs config
│   └── index.ts               # Barrel export
│
├── components/                 # UI Components
│   ├── TabNavigation.tsx      # Main tab navigation bar
│   ├── SubTabNavigation.tsx   # Reusable sub-tab navigation
│   ├── DashboardContent.tsx   # Dashboard tab content
│   ├── ProfileContent.tsx     # Profile settings content
│   ├── SocialContent.tsx      # Social network content
│   ├── MarketplaceContent.tsx # Marketplace content
│   ├── StreamingContent.tsx   # Live streaming content
│   ├── PortfoliosContent.tsx  # Portfolios content
│   └── index.ts               # Barrel export
│
└── hooks/                      # Custom hooks
    ├── useProfileTabs.ts      # Tab state management
    └── index.ts               # Barrel export
```

## 🎯 Goals

1. **Reduce main component** from 2664 lines to ~200 lines
2. **Extract SVG icons** into separate config files
3. **Reusable components** for tab navigation (avoid duplication)
4. **Centralized tab management** via custom hook
5. **Clear file organization** for AI and human understanding

## 📦 Current Status

- ✅ Types extracted (types.ts)
- ✅ Hooks created (useProfileTabs)
- ⏳ Config files (in progress)
- ⏳ UI Components (in progress)
- ⏳ Main component refactor (pending)

## 🔧 Components Breakdown

### TabNavigation
Renders the main horizontal tab bar (Dashboard, Profile, Marketplace, etc.)

### SubTabNavigation (Generic)
Reusable component that renders sub-tabs for any section. Takes config as props.

### Content Components
Each major tab has its own content component:
- **DashboardContent**: Dashboard widgets and stats
- **ProfileContent**: Profile settings with sub-tabs (Profile, Security, Notifications, etc.)
- **SocialContent**: Social network features with sub-tabs
- **MarketplaceContent**: Marketplace with sub-tabs
- **StreamingContent**: Live streaming settings
- **PortfoliosContent**: Portfolio management

## 🧩 Previous Implementation

The original monolithic file has been backed up to (will be created after refactoring):
`client/pages/ProfileNew.BACKUP.tsx`

## ✅ Benefits

1. **Maintainability**: Much easier to find and update specific sections
2. **Reusability**: Tab navigation component can be reused elsewhere
3. **Testability**: Smaller units are easier to test
4. **Performance**: Code splitting opportunities
5. **Collaboration**: Multiple developers can work on different sections
6. **AI-Friendly**: Clear structure helps AI understand relationships

## 📝 Migration Notes

All imports remain the same:

```tsx
// Both work the same
import ProfileNew from '@/pages/ProfileNew';
import { ProfileNew } from '@/pages/ProfileNew';
```

No changes needed in consuming components (routing, etc.).

## 🚀 Next Steps

1. Extract all tab configurations to `config/` directory
2. Create reusable TabNavigation components
3. Split content into separate Content components
4. Refactor main ProfileNew component to orchestrate everything
5. Test all functionality remains intact
6. Create barrel exports for clean imports
