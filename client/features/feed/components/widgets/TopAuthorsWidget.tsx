import React from "react";
import WidgetCard, { WidgetHeader, WidgetShowMore } from "./WidgetCard";
import { BUTTON_VARIANTS } from "../../styles";
import AvatarWithHoverCard from "@/components/common/AvatarWithHoverCard";

export interface TopAuthor {
  name: string;
  handle: string;
  avatar: string;
  followers?: string;
  isFollowing?: boolean;
}

interface TopAuthorsWidgetProps {
  authors: TopAuthor[];
  onFollowToggle?: (handle: string) => void;
  onShowMore?: () => void;
  title?: string;
}

export default function TopAuthorsWidget({
  authors,
  onFollowToggle,
  onShowMore,
  title = "Top Authors"
}: TopAuthorsWidgetProps) {
  return (
    <WidgetCard variant="compact">
      <WidgetHeader title={title} className="mb-4" />
      <div className="space-y-3">
        {authors.map((author, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <AvatarWithHoverCard
              author={{
                name: author.name,
                handle: author.handle,
                avatar: author.avatar,
                followers: parseInt(author.followers?.replace(/[^0-9]/g, '') || '0'),
                following: 0,
              }}
              isFollowing={author.isFollowing}
              onFollowToggle={(nextState) => onFollowToggle?.(author.handle)}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full" />
                <div>
                  <div className="font-semibold text-white">{author.name}</div>
                  <div className="text-xs text-[#6C7280]">
                    {author.handle}
                    {author.followers && ` · ${author.followers}`}
                  </div>
                </div>
              </div>
            </AvatarWithHoverCard>
            <button
              onClick={() => onFollowToggle?.(author.handle)}
              className={author.isFollowing ? BUTTON_VARIANTS.following : BUTTON_VARIANTS.follow}
            >
              {author.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
      {onShowMore && <WidgetShowMore onClick={onShowMore} />}
    </WidgetCard>
  );
}
