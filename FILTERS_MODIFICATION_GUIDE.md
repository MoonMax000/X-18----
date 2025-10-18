# Filter Modification & Enhancement Guide

## 📌 Quick Reference - Filter Flow

```
FILTERS_CONFIG (line 69-83)
    ↓ defines all available filters
TABS_CONFIG (line 85-112)
    ↓ defines which filters show in each tab
Filter Button (line 1619-1811)
    ↓ renders visible filters
Advanced Panel (line 1829-1976)
    ↓ renders advanced filters
updateFilter() (line 1214)
    ↓ updates state
filteredPosts useMemo (line 1258)
    ↓ applies all filter logic
ContinuousFeedTimeline (line 2000)
    ↓ displays filtered posts
```

---

## 🔧 HOW TO ADD A NEW FILTER

### Step 1: Add to FILTERS_CONFIG (Line 69)
```javascript
const FILTERS_CONFIG = {
  // ... existing filters ...
  newFilter: { type: 'select', opts: ['Option1', 'Option2', 'Option3'] }
} as const;
```

**Available types:**
- `select` - Dropdown (one selection)
- `chips` - Button grid (appears as buttons)
- `toggle` - On/off switch
- `buckets` - Predefined ranges
- `autocomplete` - Search input

### Step 2: Add to TABS_CONFIG (Line 85)
```javascript
const TABS_CONFIG = {
  signals: {
    visible: ['symbol', 'direction', 'timeframe', 'risk', 'sort', 'newFilter'], // ADD HERE
    advanced: ['accuracy', 'minSamples', 'strategy', 'price', 'verified'],
    defaults: { sort: 'Recent', verified: true, minSamples: '≥30' }
  }
} as const;
```

### Step 3: Add Filter Rendering (Line 1619+)
Add a new Popover section before the Advanced button:
```jsx
{/* New Filter */}
{activeConfig?.visible?.includes('newFilter') && (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="inline-flex h-[22px] items-center gap-1.5 rounded-[20px] border border-[#181B22] bg-[#0C1014]/50 px-3 text-[11px] font-semibold text-[#B0B0B0] backdrop-blur-[40px] transition hover:border-[#A06AFF]/40 hover:bg-[#0C1014]/70"
      >
        <span className="truncate">{filters.newFilter || 'New Filter'}</span>
        <ChevronDown className="h-4 w-4 text-[#B0B0B0]" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      sideOffset={12}
      className="w-[260px] space-y-2 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl"
    >
      <div className="grid gap-2">
        {FILTERS_CONFIG.newFilter.opts.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => updateFilter('newFilter', opt)}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.1em] transition",
              filters.newFilter === opt
                ? "border-[#A06AFF]/50 bg-[#1B1230] text-[#CDB8FF] shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#1B1230]/70",
            )}
          >
            {opt}
            {filters.newFilter === opt ? <Check className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
)}
```

### Step 4: Add Filter Logic (Line 1258+)
In the `filteredPosts` useMemo:
```javascript
if (filters.newFilter && filters.newFilter !== "All") {
  posts = posts.filter(p => p.newFilterField === filters.newFilter.toLowerCase());
}
```

---

## 🎨 CURRENT FILTER STYLING PATTERNS

### Visible Filter Button (Closed state)
```css
h-[22px]                           /* Height 22px */
px-3                               /* Padding horizontal */
rounded-[20px]                     /* Very rounded corners */
border border-[#181B22]            /* Subtle border */
bg-[#0C1014]/50                    /* Dark background with 50% opacity */
text-[11px] font-semibold          /* Small, bold text */
backdrop-blur-[40px]               /* Blur effect */
hover:border-[#A06AFF]/40          /* Purple hover border */
hover:bg-[#0C1014]/70              /* Darker on hover */
```

### Popover Menu (Open state)
```css
w-[260px]                                      /* Fixed width */
rounded-2xl                                    /* Rounded corners */
border border-[#1B1F27]/70 bg-[#0F131A]/95    /* Dark semi-transparent bg */
p-4                                            /* Internal padding */
shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)]  /* Deep shadow */
backdrop-blur-xl                               /* Heavy blur background */
```

### Selected Option (Inside popover)
```css
border-[#A06AFF]/50                                      /* Purple border when selected */
bg-[#1B1230]                                            /* Purple-ish background */
text-[#CDB8FF]                                          /* Light purple text */
shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]        /* Purple glow shadow */
```

### Unselected Option (Inside popover)
```css
border-transparent                              /* No border */
bg-white/5                                      /* Very subtle white background */
text-[#C5C9D3]                                  /* Gray text */
hover:border-[#A06AFF]/30                       /* Subtle purple on hover */
hover:bg-[#1B1230]/70                           /* Subtle purple background */
```

---

## 🎯 ADVANCED FILTERS STYLING

### Section Header (With icon)
```jsx
<label className="text-sm font-semibold text-white flex items-center gap-2">
  <TrendingUp className="h-4 w-4 text-green-400" />
  Market Sentiment
</label>
```

### Chips (Button style for selection)
```jsx
className={cn(
  "h-8 rounded-full font-medium transition-all",
  filters.sentiment === opt
    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50"
    : "bg-[#0A0D12] border border-[#1B1F27] text-[#C5C9D3] hover:border-green-500/50 hover:text-green-400"
)}
```

### Dropdown (Select style)
```jsx
<SelectTrigger className="h-9 rounded-lg border-[#1B1F27] bg-[#0A0D12] text-white hover:border-purple-500/50 transition">
  <SelectValue placeholder="All prices" />
</SelectTrigger>
<SelectContent className="border-[#1B1F27] bg-[#0F131A] rounded-lg">
  {options.map(opt => <SelectItem key={opt} value={opt} className="text-white">{opt}</SelectItem>)}
</SelectContent>
```

---

## 🔍 DETAILED FILTER LOGIC EXPLANATION

### Market Filter (Line 1271-1272)
```javascript
if (filters.market && filters.market !== "All") {
  posts = posts.filter(p => p.market?.toLowerCase() === filters.market.toLowerCase());
}
```
- Compares post's `market` field with selected filter
- Ignores case differences

### Direction Filter (Line 1283-1284)
```javascript
if (filters.direction) {
  posts = posts.filter(p => p.direction === filters.direction.toLowerCase());
}
```
- Only applies to signal posts
- Filters by "long" or "short" direction

### Sentiment Filter (Line 1277-1278)
```javascript
if (filters.sentiment && filters.sentiment !== "All") {
  posts = posts.filter(p => p.sentiment === filters.sentiment.toLowerCase());
}
```
- Filters posts by bullish/bearish/neutral sentiment

### Verified Filter (Line 1292-1293)
```javascript
if (filters.verified) {
  posts = posts.filter(p => p.author.verified);
}
```
- Only shows posts from verified authors

### Multi-filter Combination
All filters work together - if 3 filters are active, post must pass ALL of them:
```javascript
// Example: market=crypto AND sentiment=bullish AND verified=true
// Only crypto posts that are bullish AND from verified authors show
```

---

## 📊 POST DATA STRUCTURE

```javascript
interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    isPremium?: boolean;
    isFollowing?: boolean;
  };
  timestamp: string;
  type: PostType; // 'signal' | 'news' | 'analysis' | 'code' | 'general' | 'education' | 'macro' | 'onchain' | 'video'
  text: string;
  sentiment?: SentimentType; // 'bullish' | 'bearish' | 'neutral'
  market?: MarketType; // 'crypto' | 'stocks' | 'forex' | 'commodities' | 'indices'
  price?: PriceType; // 'free' | 'pay-per-post' | 'subscribers-only'
  
  // Signal specific
  ticker?: string;
  direction?: DirectionType; // 'long' | 'short'
  timeframe?: TimeframeType; // '15m' | '1h' | '4h' | '1d' | '1w'
  risk?: RiskType; // 'low' | 'medium' | 'high'
  accuracy?: number;
  sampleSize?: number;
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  
  // Engagement
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  
  // Metadata
  isEditorPick?: boolean;
  tags?: string[];
}
```

---

## 💡 COMMON MODIFICATION SCENARIOS

### Scenario 1: Add "Language" filter for code posts
**Step 1:** Add to config
```javascript
const FILTERS_CONFIG = {
  ...
  language: { type: 'select', opts: ['Python', 'JavaScript', 'Solidity', 'Rust'] }
}
```

**Step 2:** Add to signals advanced
```javascript
signals: {
  ...
  advanced: [..., 'language']
}
```

**Step 3:** Add filter logic
```javascript
if (filters.language && filters.language !== "All") {
  posts = posts.filter(p => p.language === filters.language);
}
```

### Scenario 2: Change Market options
**File:** Line 70
```javascript
market: { type: 'select', opts: ['Crypto', 'Stocks', 'Forex', 'Commodities', 'Indices', 'Commodities'] }
// Just add or remove from array
```

### Scenario 3: Change which filters show in Popular tab
**File:** Line 87
```javascript
popular: {
  visible: ['market', 'category', 'sort', 'newFilter'], // Add 'newFilter' here
  advanced: ['sentiment', 'price', 'strategy'],
}
```

### Scenario 4: Add default values for tab
**File:** Line 89
```javascript
popular: {
  visible: ['market', 'category', 'sort'],
  advanced: ['sentiment', 'price', 'strategy'],
  defaults: { sort: 'Popular', market: 'Crypto', newDefaultFilter: 'Value' } // Add here
}
```

---

## 🚀 STATE MANAGEMENT

### Update single filter
```javascript
updateFilter('market', 'Crypto')
// Results in: filters = { ...filters, market: 'Crypto' }
```

### Clear all filters
```javascript
setFilters(prev => ({...prev, sentiment: undefined, price: undefined, accuracy: undefined}))
```

### Add to selected categories
```javascript
setSelectedCategories(prev => 
  prev.includes('Signal') ? prev.filter(c => c !== 'Signal') : [...prev, 'Signal']
)
```

### Toggle follow
```javascript
setFollowingAuthors(prev => {
  const newSet = new Set(prev);
  if (newSet.has('@handle')) {
    newSet.delete('@handle');
  } else {
    newSet.add('@handle');
  }
  return newSet;
})
```

---

## 🎨 COLOR SCHEME BY FILTER TYPE

| Filter | Border Color | Background (Selected) | Text Color (Selected) | Icon Color |
|--------|--------------|----------------------|----------------------|------------|
| Market | `#A06AFF` | `#1C1430` | `#CDB8FF` | `#A06AFF` |
| Direction | `#6CA8FF` | `#14243A` | `#6CA8FF` | `#6CA8FF` |
| Timeframe | `#6CA8FF` | `#14243A` | `#6CA8FF` | `#6CA8FF` |
| Risk | `#A06AFF` | `#1B1230` | `#CDB8FF` | `#A06AFF` |
| Sentiment (Advanced) | N/A | `green gradient` | `#FFF` | `#10B981` |
| Accuracy (Advanced) | N/A | `blue gradient` | `#FFF` | `#3B82F6` |
| Strategy (Advanced) | N/A | N/A | N/A | `#FB923C` |

---

## ⚡ PERFORMANCE NOTES

- **useMemo dependency array** (line 1306): `[activeTab, filters, selectedCategories, followingAuthors, selectedTicker, displayedPosts]`
- Filters recalculate only when these values change
- MOCK_POSTS array is large - may want pagination

---

## 🐛 DEBUGGING TIPS

1. **Check if filter is showing:**
   ```javascript
   console.log(activeConfig?.visible?.includes('yourFilter'))
   ```

2. **Check filter state:**
   ```javascript
   console.log('Current filters:', filters)
   ```

3. **Check filtered results:**
   ```javascript
   console.log('Filtered posts count:', filteredPosts.length)
   ```

4. **Check post data structure:**
   ```javascript
   console.log('Sample post:', MOCK_POSTS[0])
   ```

---

## 📋 CHECKLIST FOR ADDING NEW FILTER

- [ ] Add to FILTERS_CONFIG with type and options
- [ ] Add to TABS_CONFIG in relevant tab's visible or advanced array
- [ ] Add Popover UI component (if visible) or form field (if advanced)
- [ ] Add filter logic in filteredPosts useMemo
- [ ] Test with different tab combinations
- [ ] Verify styling matches existing filters
- [ ] Test on mobile (hidden sidebar) and desktop
- [ ] Add to Post interface if needed
