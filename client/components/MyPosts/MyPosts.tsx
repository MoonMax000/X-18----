import { FC, useState } from "react";
import { cn } from "@/lib/utils";

type PostStatus = "published" | "draft";
type PostCategory = "analysis" | "tutorial" | "review" | "opinion" | "news";

interface Post {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  status: PostStatus;
  category: PostCategory;
  views: number;
  likes: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: "1",
    title: "Bitcoin Price Analysis Q2 2025",
    description: "An in-depth analysis of Bitcoin's price movements during Q2 2025, including key resistance levels, support ...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/dbe2cb77af13e1f5ccc8611b585b1172d4491793",
    date: "06.06.25",
    status: "published",
    category: "analysis",
    views: 12450,
    likes: 320,
    comments: 85,
  },
  {
    id: "2",
    title: "Ethereum 2.0: The Complete Guide",
    description: "Everything you need to know about Ethereum 2.0, including staking requirements, technical improvements, ...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/6c1636b94ab2935c85143c790d37c26781b4f015",
    date: "15.05.25",
    status: "published",
    category: "tutorial",
    views: 9872,
    likes: 124,
    comments: 287,
  },
  {
    id: "3",
    title: "Top 5 DeFi Projects to Watch in 2025",
    description: "A comprehensive review of the most promising DeFi projects in 2025, with analysis of their technology, ...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/ee9d6f5a40d05208be0a0bcc58b449b8aa143d80",
    date: "10.05.25",
    status: "published",
    category: "review",
    views: 7345,
    likes: 63,
    comments: 195,
  },
  {
    id: "4",
    title: "NFT Market Recovery: What's Next?",
    description: "An opinion piece on the current state of the NFT market, recent trends, and predictions for the future of digital ...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/dbe2cb77af13e1f5ccc8611b585b1172d4491793",
    date: "05.05.25",
    status: "draft",
    category: "opinion",
    views: 0,
    likes: 0,
    comments: 0,
  },
  {
    id: "5",
    title: "Regulatory Landscape for Crypto in 2025",
    description: "A detailed overview of the current regulatory environment for cryptocurrencies across major jurisdictions, ...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/6c1636b94ab2935c85143c790d37c26781b4f015",
    date: "28.04.25",
    status: "published",
    category: "news",
    views: 5621,
    likes: 47,
    comments: 132,
  },
];

const MyPosts: FC = () => {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
  const [currentPage, setCurrentPage] = useState(1);

  const getCategoryColor = (category: PostCategory) => {
    const colors = {
      analysis: "#A06AFF",
      tutorial: "#A06AFF",
      review: "#A06AFF",
      opinion: "#A06AFF",
      news: "#A06AFF",
    };
    return colors[category];
  };

  const getCategoryLabel = (category: PostCategory) => {
    const labels = {
      analysis: "Analysis",
      tutorial: "Tutorial",
      review: "Review",
      opinion: "Opinion",
      news: "News",
    };
    return labels[category];
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1059px] w-full mx-auto p-4 md:p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            My Posts
          </h2>
          <p className="text-[15px] text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Manage and track your published content
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:opacity-90 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.6771 4.985L13.8452 3.81686C14.4904 3.17172 15.5364 3.17172 16.1815 3.81686C16.8266 4.46201 16.8266 5.50799 16.1815 6.15313L15.0134 7.32126M12.6771 4.985L5.81556 11.8466C4.94447 12.7177 4.50891 13.1532 4.21234 13.6839C3.91576 14.2147 3.61736 15.4679 3.33203 16.6663C4.53044 16.381 5.78369 16.0826 6.31444 15.786C6.84519 15.4894 7.28073 15.0539 8.15182 14.1828L15.0134 7.32126M12.6771 4.985L15.0134 7.32126" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[15px] font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            New Post
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 22L20 20" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] focus:outline-none"
              style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
            />
          </div>

          {/* Status Filter */}
          <select className="px-4 py-3 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] text-[15px] text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#A06AFF] cursor-pointer" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            <option>Status: All</option>
            <option>Published</option>
            <option>Draft</option>
          </select>

          {/* Date Filter */}
          <select className="px-4 py-3 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] text-[15px] text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#A06AFF] cursor-pointer" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            <option>Date: All Time</option>
            <option>Last Week</option>
            <option>Last Month</option>
          </select>

          {/* Category Filter */}
          <select className="px-4 py-3 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] text-[15px] text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#A06AFF] cursor-pointer" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            <option>Category: All</option>
            <option>Analysis</option>
            <option>Tutorial</option>
            <option>Review</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("public")}
            className={cn(
              "px-4 py-2 rounded-full text-[15px] font-bold transition-all",
              activeTab === "public"
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                : "bg-[rgba(12,16,20,0.5)] border border-[#181B22] text-white hover:border-[#A06AFF]"
            )}
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Public Posts
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={cn(
              "px-4 py-2 rounded-full text-[15px] font-bold transition-all",
              activeTab === "private"
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                : "bg-[rgba(12,16,20,0.5)] border border-[#181B22] text-white hover:border-[#A06AFF]"
            )}
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            Private Posts
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="flex flex-col">
        {mockPosts.map((post, index) => (
          <div
            key={post.id}
            className={cn(
              "flex flex-col md:flex-row gap-4 py-4",
              index !== 0 && "border-t border-widget-border",
              post.status === "draft" && "border-t border-[#2E2744]"
            )}
          >
            {/* Thumbnail */}
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full md:w-[142px] h-[74px] object-cover rounded-lg flex-shrink-0"
            />

            {/* Content */}
            <div className="flex flex-col gap-2.5 flex-1">
              {/* Title, Date, Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <h3 className="flex-1 text-[15px] font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  {post.title}
                </h3>
                <span className="text-[12px] font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  {post.date}
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "px-1 py-0.5 rounded text-[12px] font-bold",
                      post.status === "published"
                        ? "bg-[#1C3430] text-[#2EBD85]"
                        : "bg-[rgba(255,168,0,0.16)] text-[#FFA800]"
                    )}
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span
                    className="px-1 py-0.5 rounded text-[12px] font-bold bg-[#2E2744]"
                    style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif', color: getCategoryColor(post.category) }}
                  >
                    {getCategoryLabel(post.category)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[15px] text-[#B0B0B0] line-clamp-2" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                {post.description}
              </p>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {/* Stats */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.4742 9.20449C18.7275 9.55974 18.8542 9.73741 18.8542 10.0003C18.8542 10.2632 18.7275 10.4409 18.4742 10.7962C17.3358 12.3925 14.4285 15.8337 10.5208 15.8337C6.61315 15.8337 3.70592 12.3925 2.56753 10.7962C2.31417 10.4409 2.1875 10.2632 2.1875 10.0003C2.1875 9.73741 2.31417 9.55974 2.56753 9.20449C3.70592 7.60819 6.61315 4.16699 10.5208 4.16699C14.4285 4.16699 17.3358 7.60819 18.4742 9.20449Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                      <path d="M13.0195 10C13.0195 8.61925 11.9003 7.5 10.5195 7.5C9.13878 7.5 8.01953 8.61925 8.01953 10C8.01953 11.3807 9.13878 12.5 10.5195 12.5C11.9003 12.5 13.0195 11.3807 13.0195 10Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-[12px] font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {post.views > 0 ? post.views.toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.7397 3.32846C14.5049 1.95769 12.5545 2.51009 11.3828 3.39001C10.9023 3.7508 10.6622 3.93119 10.5208 3.93119C10.3795 3.93119 10.1393 3.7508 9.65883 3.39001C8.48718 2.51009 6.53674 1.95769 4.30203 3.32846C1.36922 5.12745 0.7056 11.0624 7.47044 16.0695C8.75893 17.0232 9.40317 17.5 10.5208 17.5C11.6385 17.5 12.2827 17.0232 13.5712 16.0695C20.3361 11.0624 19.6724 5.12745 16.7397 3.32846Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[12px] font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {post.likes > 0 ? post.likes.toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.8542 9.63827C18.8542 14.0409 15.1227 17.6105 10.5208 17.6105C9.97975 17.6113 9.44017 17.5612 8.90867 17.4614C8.52611 17.3895 8.33482 17.3536 8.20127 17.374C8.06772 17.3944 7.87848 17.495 7.49999 17.6963C6.42928 18.2658 5.18079 18.4668 3.98009 18.2435C4.43645 17.6822 4.74813 17.0087 4.88565 16.2867C4.96898 15.845 4.7625 15.416 4.45324 15.1019C3.04861 13.6756 2.1875 11.7536 2.1875 9.63827C2.1875 5.23566 5.91898 1.66602 10.5208 1.66602C15.1227 1.66602 18.8542 5.23566 18.8542 9.63827Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M10.5171 10H10.5246M13.8467 10H13.8542M7.1875 10H7.19498" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-bold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {post.comments > 0 ? post.comments.toLocaleString() : "-"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="p-0 hover:opacity-70 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.80964 16.5237L16.5237 6.80964C16.9781 6.35527 17.2052 6.12808 17.3267 5.883C17.5578 5.41671 17.5578 4.86925 17.3267 4.40295C17.2052 4.15787 16.9781 3.93068 16.5237 3.47631C16.0693 3.02193 15.8421 2.79475 15.597 2.6733C15.1307 2.44223 14.5833 2.44223 14.117 2.6733C13.8719 2.79475 13.6447 3.02193 13.1904 3.47631L3.47631 13.1903C2.99459 13.672 2.75373 13.9129 2.62687 14.2192C2.5 14.5254 2.5 14.8661 2.5 15.5473V17.4999H4.45262C5.13388 17.4999 5.4745 17.4999 5.78078 17.3731C6.08707 17.2462 6.32792 17.0053 6.80964 16.5237Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 17.5H15" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.082 4.58301L15.4154 7.91634" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="p-0 hover:opacity-70 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.91797 7.91699V15.417C2.91797 15.8052 2.91797 15.9994 2.9814 16.1526C3.06598 16.3567 3.22821 16.519 3.4324 16.6036C3.58554 16.667 3.77969 16.667 4.16797 16.667C4.55625 16.667 4.75039 16.667 4.90354 16.6036C5.10773 16.519 5.26996 16.3567 5.35454 16.1526C5.41797 15.9994 5.41797 15.8052 5.41797 15.417V7.91699C5.41797 7.52871 5.41797 7.33457 5.35454 7.18143C5.26996 6.97723 5.10773 6.815 4.90354 6.73043C4.75039 6.66699 4.55625 6.66699 4.16797 6.66699C3.77969 6.66699 3.58554 6.66699 3.4324 6.73043C3.22821 6.815 3.06598 6.97723 2.9814 7.18143C2.91797 7.33457 2.91797 7.52871 2.91797 7.91699Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
                      <path d="M8.75 4.58301V15.4159C8.75 15.8042 8.75 15.9983 8.81342 16.1515C8.898 16.3557 9.06025 16.5179 9.26442 16.6025C9.41758 16.6659 9.61175 16.6659 10 16.6659C10.3882 16.6659 10.5824 16.6659 10.7356 16.6025C10.9397 16.5179 11.102 16.3557 11.1866 16.1515C11.25 15.9983 11.25 15.8042 11.25 15.4159V4.58301C11.25 4.19472 11.25 4.00058 11.1866 3.84744C11.102 3.64325 10.9397 3.48102 10.7356 3.39644C10.5824 3.33301 10.3882 3.33301 10 3.33301C9.61175 3.33301 9.41758 3.33301 9.26442 3.39644C9.06025 3.48102 8.898 3.64325 8.81342 3.84744C8.75 4.00058 8.75 4.19472 8.75 4.58301Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
                      <path d="M14.582 10.417V15.417C14.582 15.8052 14.582 15.9994 14.6454 16.1526C14.73 16.3567 14.8923 16.519 15.0964 16.6036C15.2496 16.667 15.4438 16.667 15.832 16.667C16.2203 16.667 16.4144 16.667 16.5676 16.6036C16.7718 16.519 16.934 16.3567 17.0186 16.1526C17.082 15.9994 17.082 15.8052 17.082 15.417V10.417C17.082 10.0287 17.082 9.83458 17.0186 9.68141C16.934 9.47724 16.7718 9.31499 16.5676 9.23041C16.4144 9.16699 16.2203 9.16699 15.832 9.16699C15.4438 9.16699 15.2496 9.16699 15.0964 9.23041C14.8923 9.31499 14.73 9.47724 14.6454 9.68141C14.582 9.83458 14.582 10.0287 14.582 10.417Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="p-0 hover:opacity-70 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.25 4.58301L15.7336 12.9373C15.6016 15.0717 15.5357 16.1389 15.0007 16.9063C14.7361 17.2856 14.3956 17.6058 14.0006 17.8463C13.2017 18.333 12.1325 18.333 9.99392 18.333C7.8526 18.333 6.78192 18.333 5.98254 17.8454C5.58733 17.6044 5.24667 17.2837 4.98223 16.9037C4.4474 16.1352 4.38287 15.0664 4.25384 12.929L3.75 4.58301" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M2.5 4.58366H17.5M13.3797 4.58366L12.8109 3.4101C12.433 2.63054 12.244 2.24076 11.9181 1.99767C11.8458 1.94374 11.7693 1.89578 11.6892 1.85424C11.3283 1.66699 10.8951 1.66699 10.0287 1.66699C9.14067 1.66699 8.69667 1.66699 8.32973 1.86209C8.24842 1.90533 8.17082 1.95524 8.09774 2.0113C7.76803 2.26424 7.58386 2.66828 7.21551 3.47638L6.71077 4.58366" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M7.91797 13.75V8.75" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M12.082 13.75V8.75" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1 pt-4">
        <button className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:border-[#A06AFF] transition-colors">
          <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.157 15L16.332 13.825L12.5154 10L16.332 6.175L15.157 5L10.157 10L15.157 15Z" fill="#B0B0B0"/>
            <path d="M9.66484 15L10.8398 13.825L7.02318 10L10.8398 6.175L9.66484 5L4.66484 10L9.66484 15Z" fill="#B0B0B0"/>
          </svg>
        </button>
        <button className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:border-[#A06AFF] transition-colors">
          <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.075 15L14.25 13.825L10.4333 10L14.25 6.175L13.075 5L8.075 10L13.075 15Z" fill="#B0B0B0"/>
          </svg>
        </button>
        <button
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded text-[15px] font-bold transition-all",
            currentPage === 1
              ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
              : "border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] text-[#B0B0B0] hover:border-[#A06AFF]"
          )}
          onClick={() => setCurrentPage(1)}
          style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          1
        </button>
        <button
          className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] text-[15px] font-bold text-[#B0B0B0] hover:border-[#A06AFF] transition-colors"
          onClick={() => setCurrentPage(2)}
          style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          2
        </button>
        <button
          className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] text-[15px] font-bold text-[#B0B0B0] hover:border-[#A06AFF] transition-colors"
          onClick={() => setCurrentPage(3)}
          style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          3
        </button>
        <button className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:border-[#A06AFF] transition-colors">
          <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.175 5L8 6.175L11.8167 10L8 13.825L9.175 15L14.175 10L9.175 5Z" fill="#B0B0B0"/>
          </svg>
        </button>
        <button className="flex items-center justify-center w-11 h-11 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:border-[#A06AFF] transition-colors">
          <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.84297 5L4.66797 6.175L8.48464 10L4.66797 13.825L5.84297 15L10.843 10L5.84297 5Z" fill="#B0B0B0"/>
            <path d="M11.3352 5L10.1602 6.175L13.9768 10L10.1602 13.825L11.3352 15L16.3352 10L11.3352 5Z" fill="#B0B0B0"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MyPosts;
