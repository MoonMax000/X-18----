# GoToSocial Pages Integration Guide

## Overview

This guide explains how to integrate each frontend page and component with the GoToSocial backend API. All pages have been prepared with proper hooks and service layers.

---

## 🔧 Setup Instructions

### 1. Configure API URL

Create `.env` file:

```bash
VITE_API_URL=https://your-gotosocial-instance.com
# OR for local development
VITE_API_URL=http://localhost:8080
```

### 2. Install Dependencies

Already installed:
- `@tanstack/react-query` (optional, for advanced caching)
- React hooks (built-in)

### 3. Authentication

Ensure users are authenticated before accessing protected endpoints. Use the `useAuth` hook:

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, getCurrentUser } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      // Redirect to login
    }
  }, []);
}
```

---

## 📄 Page Integration Details

### 1. **Profile Page** (`/profile-page`)

**File:** `client/pages/ProfilePage.tsx`  
**Component:** `ProfilePageLayout` (own profile)

#### Integration Steps:

```typescript
// client/pages/ProfilePage.tsx
import { useGTSProfile } from '@/hooks/useGTSProfile';
import { getCurrentAccount } from '@/services/api/gotosocial';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getCurrentAccount().then(setCurrentUser);
  }, []);

  const { profile, statuses, isLoading } = useGTSProfile({
    userId: currentUser?.id,
    fetchStatuses: true,
  });

  if (isLoading) return <div>Loading...</div>;

  return <ProfilePageLayout isOwnProfile={true} profile={profile} posts={statuses} />;
}
```

**Required Backend Endpoints:**
- `GET /api/v1/accounts/verify_credentials` - Get current user
- `GET /api/v1/accounts/:id` - Get profile data
- `GET /api/v1/accounts/:id/statuses` - Get user posts
- `GET /api/v1/accounts/:id/followers` - Get followers
- `GET /api/v1/accounts/:id/following` - Get following

**Custom Endpoints Needed:**
- `GET /api/v1/custom/subscriptions` - Get active subscriptions (monetization)
- `GET /api/v1/custom/purchases` - Get purchased posts (monetization)
- `GET /api/v1/custom/earnings` - Get earnings data (monetization)

---

### 2. **Other Profile Page** (`/other-profile`)

**File:** `client/pages/OtherProfilePage.tsx`  
**Component:** `ProfilePageLayout` (other user's profile)

#### Integration Steps:

```typescript
// client/pages/OtherProfilePage.tsx
import { useGTSProfile } from '@/hooks/useGTSProfile';
import { useParams } from 'react-router-dom';

export default function OtherProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { 
    profile, 
    statuses, 
    relationship,
    isFollowing,
    toggleFollow,
    isLoading 
  } = useGTSProfile({
    username,
    fetchStatuses: true,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ProfilePageLayout 
      isOwnProfile={false} 
      profile={profile} 
      posts={statuses}
      isFollowing={isFollowing}
      onFollowToggle={toggleFollow}
    />
  );
}
```

**Required Backend Endpoints:**
- `GET /api/v2/search?type=accounts&q={username}` - Find user by username
- `GET /api/v1/accounts/:id/statuses` - Get user posts
- `GET /api/v1/accounts/relationships?id[]={id}` - Check relationship
- `POST /api/v1/accounts/:id/follow` - Follow user
- `POST /api/v1/accounts/:id/unfollow` - Unfollow user

---

### 3. **Feed Test Page** (`/feedtest`)

**File:** `client/pages/FeedTest.tsx`  
**Component:** `ContinuousFeedTimeline` + `RightSidebar`

#### Integration Steps:

```typescript
// client/pages/FeedTest.tsx
import { useGTSTimeline } from '@/hooks/useGTSTimeline';

export default function FeedTest() {
  const { 
    statuses, 
    isLoading, 
    loadMore, 
    newCount, 
    loadNew 
  } = useGTSTimeline({
    type: 'home', // or 'public' or 'local'
    limit: 20,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });

  return (
    <div className="flex min-h-screen w-full gap-6">
      <div className="flex-1 max-w-[720px]">
        {/* Quick Composer */}
        <QuickComposer />

        {/* Tabs & Filters */}
        <FeedTabs />
        <FeedFilters />

        {/* New Posts Banner */}
        {newCount > 0 && <NewPostsBanner count={newCount} onClick={loadNew} />}

        {/* Timeline */}
        <ContinuousFeedTimeline posts={statuses} onLoadMore={loadMore} />
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
```

**Required Backend Endpoints:**
- `GET /api/v1/timelines/home` - Home timeline (following)
- `GET /api/v1/timelines/public?local=true` - Local timeline
- `GET /api/v1/timelines/public` - Federated timeline

**Custom Endpoints Needed:**
- `GET /api/v1/custom/trending/tags` - Trending hashtags
- `GET /api/v1/custom/trending/statuses` - Trending posts
- `GET /api/v1/custom/suggestions` - Suggested profiles

---

### 4. **Notifications Page** (`/social/notifications`)

**File:** `client/pages/SocialNotifications.tsx`

#### Integration Steps:

```typescript
// client/pages/SocialNotifications.tsx
import { useGTSNotifications } from '@/hooks/useGTSNotifications';
import { useState } from 'react';

export default function SocialNotifications() {
  const [filter, setFilter] = useState<'all' | 'mentions'>('all');

  const { 
    notifications, 
    isLoading, 
    loadMore,
    unreadCount,
    markAsRead,
    markAllAsRead 
  } = useGTSNotifications({
    filter,
    limit: 20,
    autoRefresh: true,
  });

  return (
    <div>
      <h1>Уведомления ({unreadCount} непрочитанных)</h1>
      
      {/* Filter Tabs */}
      <FilterTabs active={filter} onChange={setFilter} />

      {/* Notifications List */}
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification}
          onMarkRead={() => markAsRead(notification.id)}
        />
      ))}

      {/* Mark All as Read Button */}
      <button onClick={markAllAsRead}>Прочитать все</button>
    </div>
  );
}
```

**Required Backend Endpoints:**
- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications?types[]=mention` - Filter by type

**Note:** GoToSocial doesn't have explicit "mark as read" API. Implement client-side read state or add custom endpoint.

---

### 5. **Profile Connections Page** (`/profile-connections/:username`)

**File:** `client/pages/ProfileConnections.tsx`

#### Integration Steps:

```typescript
// client/pages/ProfileConnections.tsx
import { useGTSProfile } from '@/hooks/useGTSProfile';
import { useParams, useSearchParams } from 'react-router-dom';

export default function ProfileConnections() {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'followers';

  const { 
    profile,
    followers, 
    following, 
    isLoading 
  } = useGTSProfile({
    username: handle,
    fetchFollowers: tab === 'followers' || tab === 'verified',
    fetchFollowing: tab === 'following',
  });

  const verifiedFollowers = followers.filter(f => f.verified);

  const displayedUsers = 
    tab === 'verified' ? verifiedFollowers :
    tab === 'followers' ? followers :
    following;

  return (
    <div>
      <h1>{handle}</h1>
      
      {/* Tabs */}
      <Tabs value={tab}>
        <Tab value="verified">Verified Followers</Tab>
        <Tab value="followers">Followers</Tab>
        <Tab value="following">Following</Tab>
      </Tabs>

      {/* Users List */}
      {displayedUsers.map(user => (
        <UserRow key={user.id} user={user} />
      ))}
    </div>
  );
}
```

**Required Backend Endpoints:**
- `GET /api/v1/accounts/:id/followers` - Get followers
- `GET /api/v1/accounts/:id/following` - Get following

**Note:** "Verified" filtering is client-side unless custom verification system is implemented.

---

### 6. **Create Post Modal** (Tweet Modal)

**File:** `client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx`

#### Integration Steps:

```typescript
// client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx
import { createStatus, uploadMedia } from '@/services/api/gotosocial';
import { useState } from 'react';

export default function CreatePostModal({ isOpen, onClose }) {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<File[]>([]);

  const handlePost = async () => {
    try {
      // Upload media first
      const mediaIds = await Promise.all(
        media.map(file => uploadMedia(file).then(m => m.id))
      );

      // Create status
      const status = await createStatus({
        status: text,
        media_ids: mediaIds,
        visibility: 'public',
        // Custom metadata (if backend supports)
        // custom_metadata: { ... }
      });

      console.log('Post created:', status);
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Textarea value={text} onChange={e => setText(e.target.value)} />
      <MediaUpload onUpload={files => setMedia(files)} />
      <Button onClick={handlePost}>Post</Button>
    </Modal>
  );
}
```

**Required Backend Endpoints:**
- `POST /api/v1/media` - Upload media (multipart/form-data)
- `POST /api/v1/statuses` - Create post
- `PUT /api/v1/statuses/:id` - Edit post (if editing)

**Custom Endpoints Needed:**
- Custom metadata support for signal data, sentiment, access control
- Payment integration for paid posts

---

### 7. **Hover Cards** (User Hover Card)

**File:** `client/components/PostCard/UserHoverCard.tsx`

#### Integration Steps:

```typescript
// client/components/PostCard/UserHoverCard.tsx
import { getAccount, followAccount, unfollowAccount } from '@/services/api/gotosocial';
import { useState, useEffect } from 'react';

export default function UserHoverCard({ userId, children }) {
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    getAccount(userId).then(account => {
      setProfile(account);
      // Get relationship to check if following
    });
  }, [userId]);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowAccount(userId);
      setIsFollowing(false);
    } else {
      await followAccount(userId);
      setIsFollowing(true);
    }
  };

  return (
    <HoverCardPrimitive.Root>
      <HoverCardPrimitive.Trigger>{children}</HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Content>
        {profile && (
          <>
            <Avatar src={profile.avatar} />
            <h3>{profile.display_name}</h3>
            <p>{profile.note}</p>
            <p>{profile.followers_count} followers</p>
            <Button onClick={handleFollowToggle}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </>
        )}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Root>
  );
}
```

**Required Backend Endpoints:**
- `GET /api/v1/accounts/:id` - Quick profile data
- `POST /api/v1/accounts/:id/follow` - Follow
- `POST /api/v1/accounts/:id/unfollow` - Unfollow

**Optimization:** Create a lightweight `/api/v1/accounts/:id/preview` endpoint for hover cards (optional).

---

### 8. **Widgets**

#### Trending Topics Widget

```typescript
import { getTrending } from '@/services/api/gotosocial';

export function TrendingTopicsWidget() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    getTrending('tags', 10).then(setTags);
  }, []);

  return (
    <Widget title="Trending Topics">
      {tags.map(tag => (
        <TagItem key={tag.name} tag={tag} />
      ))}
    </Widget>
  );
}
```

**Custom Endpoint:** `GET /api/v1/custom/trending/tags`

#### Suggested Profiles Widget

```typescript
import { getSuggestedProfiles } from '@/services/api/gotosocial';

export function SuggestedProfilesWidget() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    getSuggestedProfiles(5).then(setProfiles);
  }, []);

  return (
    <Widget title="Who to follow">
      {profiles.map(profile => (
        <ProfileRow key={profile.id} profile={profile} />
      ))}
    </Widget>
  );
}
```

**Custom Endpoint:** `GET /api/v1/custom/suggestions`

---

## 🔄 Data Flow Architecture

```
Frontend Components
       ↓
Custom Hooks (useGTSProfile, useGTSTimeline, etc.)
       ↓
API Service Layer (gotosocial.ts)
       ↓
HTTP Client (client.ts)
       ↓
GoToSocial Backend API
```

---

## 🛠️ Backend Extensions Required

### Critical Custom Endpoints

1. **Monetization System**
   - `POST /api/v1/custom/posts/purchase` - Purchase a post
   - `POST /api/v1/custom/subscriptions` - Subscribe to author
   - `GET /api/v1/custom/subscriptions` - Get active subscriptions
   - `GET /api/v1/custom/purchases` - Get purchased posts
   - `GET /api/v1/custom/earnings` - Get author earnings

2. **Trending & Discovery**
   - `GET /api/v1/custom/trending/tags` - Trending hashtags
   - `GET /api/v1/custom/trending/statuses` - Trending posts
   - `GET /api/v1/custom/trending/accounts` - Trending accounts
   - `GET /api/v1/custom/suggestions` - Profile suggestions

3. **Enhanced Metadata**
   - Extend `POST /api/v1/statuses` to accept `custom_metadata` field
   - Store and return signal data, sentiment, access control, etc.

4. **Analytics**
   - View count tracking (privacy-preserving)
   - Engagement metrics
   - Author statistics

---

## 📦 Migration Strategy

### Phase 1: Core Social Features (Use Standard GoToSocial)
- ✅ User profiles
- ✅ Follow/unfollow
- ✅ Posts (statuses)
- ✅ Timelines
- ✅ Notifications
- ✅ Media uploads

### Phase 2: Custom Extensions (Build Custom Backend)
- ⚠️ Monetization system
- ⚠️ Trading signals metadata
- ⚠️ Advanced access control
- ⚠️ Trending algorithms

### Phase 3: Enhanced Features (Optional)
- ⚠️ Advanced analytics
- ⚠️ Recommendation engine
- ⚠️ Real-time features beyond WebSocket

---

## 🧪 Testing Checklist

- [ ] User authentication (login, logout, token refresh)
- [ ] Profile page loads with correct data
- [ ] Follow/unfollow works from profile and hover cards
- [ ] Feed displays posts correctly
- [ ] Create post modal uploads media and posts status
- [ ] Notifications load and update in real-time
- [ ] Profile connections (followers/following) display correctly
- [ ] Widgets show trending data (if custom endpoints ready)
- [ ] Error handling for network failures
- [ ] Loading states display correctly

---

## 📝 Environment Variables

```bash
# .env
VITE_API_URL=https://gotosocial.example.com
VITE_OAUTH_CLIENT_ID=your_client_id
VITE_OAUTH_CLIENT_SECRET=your_client_secret
VITE_OAUTH_REDIRECT_URI=https://yourapp.com/auth/callback

# Custom backend (if separate from GoToSocial)
VITE_CUSTOM_API_URL=https://api.yourapp.com
```

---

## 🚀 Next Steps

1. ✅ Review `GOTOSOCIAL_INTEGRATION_ANALYSIS.md` for feature gaps
2. ✅ Review this integration guide
3. ⬜ Set up GoToSocial instance (local or cloud)
4. ⬜ Configure OAuth2 application in GoToSocial admin
5. ⬜ Update `.env` with API URL and OAuth credentials
6. ⬜ Test authentication flow
7. ⬜ Test each page integration one by one
8. ⬜ Build custom backend for monetization & extensions
9. ⬜ Implement trending/discovery algorithms
10. ⬜ Deploy to production

---

**Status:** Ready for Development  
**Last Updated:** 2024  
**Maintainer:** Engineering Team
