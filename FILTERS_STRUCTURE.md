# FeedTest Page - Buttons & Filters Structure

## 📋 Overview
The FeedTest page has a tab-based feed system with dynamic filters that change based on the active tab.

---

## 🔘 TAB BUTTONS (Top Navigation)

**Location:** Line 1590-1614 - Sticky header with 5 main tabs

| Tab | Icon | State | Action |
|-----|------|-------|--------|
| **Popular** | Flame 🔥 | Active shows gradient purple | Sorts by engagement (likes + views) |
| **For you** | Sparkles ✨ | | Shows personalized feed |
| **Editor's picks** | Star ⭐ | | Filters editor picks & verified authors |
| **Signals** | Zap ⚡ | | Shows only signal posts (trading signals) |
| **Following** | Users 👥 | | Shows posts from followed authors |

**Behavior:**
- Click any tab ��� `setActiveTab(tab.key)` 
- Active tab gets gradient background + purple shadow
- All filters reset/change based on selected tab configuration

---

## 🎛️ VISIBLE FILTERS (Always shown above Advanced button)

Each tab has its own set of visible filters defined in `TABS_CONFIG`:

### **Popular Tab**
- Market (Crypto, Stocks, Forex, Commodities, Indices)
- Category (News, Education, Analysis, Macro, On-chain, Code, Video, Signal)
- Sort (Popular, New, Top 24h, Top 7d, Recent)
- **Advanced Button**

### **For You Tab**
- Market
- Category
- **Advanced Button**

### **Editor's Picks Tab**
- Market
- Category
- **Advanced Button** (Sort is locked)

### **Signals Tab**
- Symbol (autocomplete)
- Direction (Long, Short)
- Timeframe (15m, 1h, 4h, 1d, 1w)
- Risk (Low, Medium, High)
- Sort
- **Advanced Button**

### **Following Tab**
- Sort only
- **Advanced Button**

### Filter Interaction Pattern:
```
Click Filter Button 
  ↓
Popover opens (width: 240-260px)
  ↓
Select option
  ↓
updateFilter('key', value) called
  ↓
Filters state updates
  ↓
Posts re-filter in real-time
```

---

## 🎚️ ADVANCED FILTERS PANEL (Collapsible)

**Location:** Line 1829-1976

**Trigger:** "Advanced" button (line 1814-1825) with slider icon

**Display:** 
- Background: Purple-tinted gradient panel
- Header: Crown icon + "Advanced Filters" title + close button (X)
- Hidden by default
- Shows different options per tab

### Advanced Filter Content by Tab:

**Popular Tab Advanced:**
- Market Sentiment (Bullish, Bearish, Neutral) - **chips**
- Strategy (TA, Quant, News, Options, On-chain) - **chips**
- Price (Free, Pay-per-post, Subscribers-only) - **dropdown**

**For You Tab Advanced:**
- Market Sentiment - **chips**
- Strategy - **chips**
- Price - **dropdown**

**Editor's Picks Advanced:**
- Market Sentiment - **chips**
- Strategy - **chips**
- Price - **dropdown**

**Signals Tab Advanced (Most comprehensive):**
- Market Sentiment - **chips**
- Accuracy (≥60%, ≥70%, ≥80%) - **chips**
- Strategy - **chips**
- Minimum Sample Size (≥30, ≥50, ≥100) - **dropdown**
- Price - **dropdown**
- Verified toggle - **switch** (default ON)

**Following Tab Advanced:**
- Category - **chips**
- Price - **dropdown**
- Verified toggle - **switch**

### Advanced Panel Buttons:
- **Clear Filters** - Resets sentiment, price, accuracy, minSamples, closes panel
- **Apply Filters** - Closes panel and applies selected filters

---

## 📊 FILTER TYPES & UI COMPONENTS

| Type | Example | Component | Behavior |
|------|---------|-----------|----------|
| **select** | Market, Sort, Price | Popover dropdown | Shows all options, one selection |
| **chips** | Sentiment, Accuracy | Button grid | Multi-selectable (but UI shows single) |
| **toggle** | Verified | Switch | Boolean on/off |
| **autocomplete** | Symbol | Input field | Type to search |

---

## 📈 RIGHT SIDEBAR WIDGETS (Desktop only, hidden on mobile)

**Location:** Line 2006-2117

### 1. **Trending Tickers** Widget
- Shows trending trading symbols
- Each ticker has:
  - Ticker name ($BTC, $AAPL, etc.)
  - Sentiment arrow (up/down)
  - Percentage change with color
  - Mention count
- **Click action:** `setSelectedTicker(item.ticker)` → filters main feed by ticker
- **"View More" button** at bottom (line 2046-2051)

### 2. **Top Authors** Widget  
- Shows top 5-10 trading authors
- Each author has:
  - Avatar
  - Name + Handle
  - Follow/Following button (using FollowButton component)
- **Click action:** `toggleTopAuthorFollow(handle)` → toggle follow state
- **"View More" button** at bottom

### 3. **Market Sentiment** Widget
- Two horizontal progress bars:
  - **Bullish:** 68% (green gradient)
  - **Bearish:** 32% (red/rose gradient)
- Visual only (no interactive filter)

---

## 🔄 FILTER APPLICATION FLOW

```
User interacts with filter
  ↓
updateFilter(key, value) called
  ↓
setFilters(prev => {...prev, [key]: value})
  ↓
filteredPosts useMemo triggers (line 1258)
  ↓
Filters applied in order:
  1. Tab-specific filtering (popular/editors/signals/following)
  2. Market filter
  3. Selected categories
  4. Sentiment
  5. Price
  6. Direction (signals only)
  7. Timeframe (signals only)
  8. Risk (signals only)
  9. Verified flag
  ↓
filteredPosts array updates
  ↓
<ContinuousFeedTimeline posts={filteredPosts} />
```

---

## 🔔 NEW POSTS BUTTON

**Location:** Line 1978-1996

**Display:** Sticky button between filters and feed
- Shows when `newPostsCount > 0`
- Animated pulse indicator
- Text: "X new posts available"
- **Click:** Scrolls to top, resets counter

---

## 🎯 Key State Variables

```javascript
const [activeTab, setActiveTab] = useState<FeedTab>('popular');
const [showAdvanced, setShowAdvanced] = useState(false);
const [filters, setFilters] = useState({...});
const [selectedCategories, setSelectedCategories] = useState([]);
const [followingAuthors, setFollowingAuthors] = useState(new Set());
const [topAuthorsFollowing, setTopAuthorsFollowing] = useState(new Set());
const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
const [newPostsCount, setNewPostsCount] = useState(0);
```

---

## 📝 Config References

**TABS_CONFIG (Lines 85-111):**
- Defines which filters show for each tab (visible & advanced)
- Sets default values per tab
- Can lock certain filters

**FILTERS_CONFIG (Lines 69-83):**
- Defines all available filter options
- Filter type (select, chips, toggle, autocomplete)
- Available options for each filter

**FEED_TABS (Lines 114-120):**
- Tab definitions with icons and labels

---

## 💡 Future Enhancement Ideas

1. **Multi-select Sentiment** - Currently supports single, could do multiple
2. **Date Range Filter** - Add custom date range selector
3. **Save Filter Presets** - Let users save favorite filter combinations
4. **Filter Search** - Search by ticker symbol
5. **Sort by Latest in Advanced** - Add sorting for advanced filters
6. **Strategy Multi-select** - Select multiple strategies at once
7. **Accuracy Range Slider** - Instead of buckets, use slider for precision
