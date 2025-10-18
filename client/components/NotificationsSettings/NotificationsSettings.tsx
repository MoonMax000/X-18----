import { FC } from "react";
import { cn } from "@/lib/utils";

const Checkbox: FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className={cn(
      "relative inline-flex h-[18px] w-[18px] items-center justify-center rounded-[3px]",
      checked ? "bg-primary" : "border border-[#2E2744] bg-transparent",
    )}
    aria-hidden
  >
    {checked && (
      <svg
        className="absolute"
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
      >
        <path
          d="M1 2.5L5 6.5L10.5 1"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

type NotificationSectionConfig = {
  title: string;
  channelNames?: string[];
  items: {
    label: string;
    states: boolean[];
  }[];
};

const sections: NotificationSectionConfig[] = [
  {
    title: "Notifications",
    items: [
      { label: "Enable notification sound", states: [true] },
      { label: "Show desktop notifications", states: [true] },
      {
        label: "Emails about suspicious login attempts to your account",
        states: [true],
      },
    ],
  },
  {
    title: "Your Profile",
    channelNames: ["Email", "Web"],
    items: [
      { label: "When someone follows you", states: [false, true] },
      {
        label: "When someone mentions you in idea comments",
        states: [true, true],
      },
      {
        label: "When you're mentioned in chat while offline",
        states: [true, true],
      },
    ],
  },
  {
    title: "Your Ideas",
    channelNames: ["Email", "Web"],
    items: [
      { label: "When someone comments on your idea", states: [true, true] },
      { label: "When someone liked your idea", states: [true, true] },
    ],
  },
  {
    title: "Authors You Follow",
    channelNames: ["Email", "Web"],
    items: [
      { label: "When they publish a new idea", states: [true, true] },
      { label: "When they post a new post", states: [true, true] },
    ],
  },
  {
    title: "Ideas You Follow",
    channelNames: ["Email", "Web"],
    items: [{ label: "When there's an update", states: [true, true] }],
  },
  {
    title: "Products You've Favorited or Rated",
    channelNames: ["Email", "Web"],
    items: [{ label: "When there's an update", states: [true, true] }],
  },
  {
    title: "Opinions",
    channelNames: ["Email", "Web"],
    items: [
      {
        label: "When someone mentions you in an opinion",
        states: [true, true],
      },
      {
        label: "When someone mentions you in a comment on an opinion",
        states: [true, true],
      },
    ],
  },
];

const NotificationRow: FC<{
  label: string;
  states: boolean[];
  channelNames?: string[];
}> = ({ label, states, channelNames }) => {
  const hasChannels = Boolean(channelNames?.length);
  const channelCount = channelNames?.length ?? 0;
  const totalColumns = Math.max(channelCount, 1);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        "sm:grid sm:items-end sm:gap-4",
      )}
      style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${totalColumns}, 72px)` }}
    >
      <span className="text-sm font-bold text-white md:text-[15px] md:leading-snug">
        {label}
      </span>
      {hasChannels
        ? channelNames!.map((channel, idx) => (
            <div
              key={`${label}-${channel}`}
              className="flex items-center gap-3 sm:w-[72px] sm:flex-col sm:items-center sm:justify-end sm:gap-2 sm:text-center sm:justify-self-end"
            >
              <span className="text-xs font-bold uppercase text-webGray sm:hidden">
                {channel}
              </span>
              <Checkbox checked={states[idx] ?? false} />
            </div>
          ))
        : (
            <div className="flex w-full justify-end self-end sm:w-[72px] sm:justify-center sm:justify-self-end sm:self-end">
              <Checkbox checked={states[0] ?? false} />
            </div>
          )}
    </div>
  );
};

const NotificationSection: FC<NotificationSectionConfig> = ({
  title,
  channelNames,
  items,
}) => (
  <section className="w-full">
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
        {channelNames && (
          <div className="hidden items-end gap-6 sm:flex lg:gap-8">
            {channelNames.map((channel) => (
              <span
                key={`${title}-${channel}`}
                className="w-[72px] text-center text-xs font-bold uppercase text-webGray"
              >
                {channel}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5 sm:gap-6">
        {items.map(({ label, states }) => (
          <NotificationRow
            key={`${title}-${label}`}
            label={label}
            states={states}
            channelNames={channelNames}
          />
        ))}
      </div>
    </div>
  </section>
);

const NotificationsSettings: FC = () => {
  return (
    <div className="flex w-full max-w-[1059px] flex-col items-center gap-6">
      {sections.map((section) => (
        <NotificationSection key={section.title} {...section} />
      ))}

      <div className="flex w-full flex-col-reverse items-center justify-center gap-4 pb-2 pt-4 sm:flex-row sm:pb-0">
        <button className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-5 text-sm font-bold text-white shadow-[0_4px_8px_rgba(0,0,0,0.24)] backdrop-blur-[50px] transition-colors hover:bg-[rgba(12,16,20,0.7)] sm:w-[200px]">
          Unsubscribe from all
        </button>
        <button className="inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#482090] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-[200px]">
          Save changes
        </button>
      </div>
    </div>
  );
};

export default NotificationsSettings;
