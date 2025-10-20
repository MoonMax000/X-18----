import { FC, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getTopAuthors } from '@/lib/supabase';
import FollowButton from '@/components/PostCard/FollowButton';
import UserHoverCard from '@/components/PostCard/UserHoverCard';

interface Author {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  followers_count: number;
  verified: boolean;
  bio: string | null;
}

interface TopAuthorsWidgetProps {
  limit?: number;
}

const TopAuthorsWidget: FC<TopAuthorsWidgetProps> = ({ limit = 10 }) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAuthors();
  }, [limit]);

  const loadAuthors = async () => {
    setLoading(true);
    const data = await getTopAuthors(limit);
    setAuthors(data);
    setLoading(false);
  };

  const toggleFollow = (username: string) => {
    setFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
  };

  const getDisplayName = (author: Author) => {
    if (author.first_name && author.last_name) {
      return `${author.first_name} ${author.last_name}`;
    }
    return author.username;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[rgba(40,44,52,1)] bg-[#000000] p-4">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Users className="h-5 w-5 text-purple-400" />
          Top Authors
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-700 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#5E5E5E] bg-[#000000] p-4">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Users className="h-5 w-5 text-purple-400" />
        Top Authors
      </h3>
      <div className="space-y-3">
        {authors.map((author) => {
          const isFollowing = following.has(author.username);
          return (
            <div key={author.id} className="flex items-center justify-between gap-3">
              <UserHoverCard
                author={{
                  name: getDisplayName(author),
                  handle: author.username,
                  avatar: author.avatar_url || '/default-avatar.png',
                  verified: author.verified,
                  followers: author.followers_count,
                  following: Math.floor(Math.random() * 2000) + 100,
                  bio: author.bio || 'Crypto trader and analyst',
                }}
                isFollowing={isFollowing}
                onFollowToggle={() => toggleFollow(author.username)}
                showFollowButton={true}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={author.avatar_url || ''} alt={getDisplayName(author)} />
                    <AvatarFallback>
                      {author.first_name?.[0] || author.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate flex items-center gap-1">
                      {getDisplayName(author)}
                      {author.verified && (
                        <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-[#6C7280] truncate">
                      @{author.username}
                    </div>
                  </div>
                </div>
              </UserHoverCard>
              <FollowButton
                profileId={author.username}
                size="compact"
                isFollowing={isFollowing}
                onToggle={() => toggleFollow(author.username)}
                stopPropagation
              />
            </div>
          );
        })}
      </div>
      {authors.length === 0 && !loading && (
        <p className="text-sm text-gray-500 text-center py-4">
          No authors found
        </p>
      )}
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
        onClick={() => window.location.href = '/explore'}
      >
        View More
      </button>
    </div>
  );
};

export default TopAuthorsWidget;
