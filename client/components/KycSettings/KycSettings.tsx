import { FC } from "react";
import { cn } from "@/lib/utils";

const verificationSteps = [
  {
    title: "Identity Verification",
    description:
      "Submit government-issued ID and a live selfie to confirm identity.",
    status: "completed" as const,
  },
  {
    title: "Residence & Compliance",
    description: "Upload proof of address and complete AML questionnaire.",
    status: "in-progress" as const,
  },
  {
    title: "Privileges Activation",
    description:
      "Sign compliance agreements to unlock streaming and marketplace access.",
    status: "pending" as const,
  },
];

const baseDocuments = [
  {
    title: "Primary Document",
    description: "Passport, National ID, or Driver's License (front & back).",
    key: "primary",
  },
  {
    title: "Proof of Residence",
    description:
      "Bank statement or utility bill issued within the last 90 days.",
    key: "residence",
  },
  {
    title: "Selfie Verification",
    description: "Short video selfie with your document for liveness check.",
    key: "selfie",
  },
];

const roleTracks = [
  {
    id: "analyst",
    name: "Market Analyst",
    description:
      "Unlock publishing of premium analytics, reports, and portfolio strategies.",
    uploadLabel: "Upload analyst certification",
    documents: [
      "Financial analyst certification (CFA, FRM, or equivalent)",
      "Recent market insight sample (PDF)",
      "Proof of professional affiliation (optional)",
    ],
    privileges: [
      "Create paid analytics products in the marketplace",
      "Host data-driven sessions with advanced dashboards",
      "Access to analyst-only community rooms",
    ],
  },
  {
    id: "streamer",
    name: "Live Streamer",
    description:
      "Broadcast live trading sessions and interactive education streams.",
    uploadLabel: "Upload streaming compliance documents",
    documents: [
      "Streaming agreement acknowledgment",
      "Latency and delay policy acceptance",
      "Channel branding assets (optional)",
    ],
    privileges: [
      "Start monetized live streams",
      "Enable community tipping & subscriptions",
      "Access stream moderation toolkit",
    ],
  },
  {
    id: "consultant",
    name: "Banking Consultant",
    description:
      "Provide 1:1 or group advisory sessions with verified credentials.",
    uploadLabel: "Upload consultant documents",
    documents: [
      "Professional license (Series, MiFID, or equivalent)",
      "Client engagement agreement template",
      "Insurance or liability coverage proof",
    ],
    privileges: [
      "Offer premium consultation slots",
      "Access secure document exchange with clients",
      "Feature in expert marketplace highlights",
    ],
  },
];

const statusStyles: Record<
  (typeof verificationSteps)[number]["status"],
  string
> = {
  completed: "bg-[#1C3430] text-green",
  "in-progress": "bg-[#523A83]/40 text-primary",
  pending: "bg-[#181B22] text-webGray",
};

const KycSettings: FC = () => {
  return (
    <div className="flex w-full max-w-[1059px] flex-col gap-8">
      {/* Overview */}
      <section className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white">
                KYC Control Center
              </h1>
              <p className="text-sm font-normal text-white sm:text-[15px]">
                Verify your identity once to unlock every professional
                privilege: streaming, analytics publishing, and banking-grade
                consultations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Verified creators unlock marketplace sales",
                "Stream live with compliance-backed protection",
                "Consult with clients in secure rooms",
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[#181B22] bg-[rgba(11,14,17,0.5)] px-3 py-1 text-xs font-bold text-webGray"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "KYC Status",
                value: "In Progress",
                accent: "text-primary",
              },
              {
                label: "Unlocked Privileges",
                value: "2 / 4",
                accent: "text-white",
              },
              {
                label: "Last Update",
                value: "June 12, 2025",
                accent: "text-white",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="flex flex-col gap-2 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]"
              >
                <span className="text-xs font-bold uppercase text-webGray">
                  {card.label}
                </span>
                <span className={cn("text-xl font-bold", card.accent)}>
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification timeline */}
      <section className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
        <h2 className="text-lg font-bold text-white sm:text-xl">
          Verification Timeline
        </h2>
        <p className="mt-2 text-sm text-webGray">
          Complete each step to activate professional privileges. You can upload
          documents for all tracks in parallel.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {verificationSteps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  Step {index + 1}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-bold",
                    statusStyles[step.status],
                  )}
                >
                  {step.status === "completed" && "Completed"}
                  {step.status === "in-progress" && "In Progress"}
                  {step.status === "pending" && "Pending"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm text-webGray">{step.description}</p>
              <div className="h-2 w-full rounded-full bg-[#181B22]">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r from-primary to-[#482090]",
                    {
                      "w-full": step.status === "completed",
                      "w-2/3": step.status === "in-progress",
                      "w-1/3": step.status === "pending",
                    },
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Base documents */}
      <section className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Core Verification Documents
            </h2>
            <p className="text-sm text-webGray">
              Upload once to satisfy compliance for every role. Files are
              encrypted and only available to the compliance desk.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {baseDocuments.map((doc) => (
              <label
                key={doc.key}
                className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 transition hover:border-primary/60 hover:bg-[#181A20]"
              >
                <span className="text-sm font-bold text-white">
                  {doc.title}
                </span>
                <p className="text-sm text-webGray">{doc.description}</p>
                <div className="flex items-center justify-between rounded-lg border border-dashed border-[#2E2744] bg-[#0C1014]/40 p-3 text-sm text-webGray transition group-hover:border-primary/60 group-hover:text-white">
                  <span>Click to upload</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-primary"
                  >
                    <path
                      d="M10.0003 12.0833V3.75M10.0003 12.0833C9.41683 12.0833 8.3266 10.4214 7.91699 10M10.0003 12.0833C10.5838 12.0833 11.6741 10.4214 12.0837 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.6663 13.75C16.6663 15.8183 16.2347 16.25 14.1663 16.25H5.83301C3.76467 16.25 3.33301 15.8183 3.33301 13.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <input type="file" className="sr-only" multiple />
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Role tracks */}
      <section className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Specialized Privilege Tracks
            </h2>
            <p className="text-sm text-webGray">
              Choose one or all tracks. Submissions are reviewed by dedicated
              teams and typically approved within 72 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {roleTracks.map((track) => (
              <div
                key={track.id}
                className="flex flex-col gap-5 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">{track.name}</h3>
                  <p className="text-sm text-webGray">{track.description}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-webGray">
                    Required Documents
                  </span>
                  <ul className="flex flex-col gap-2 text-sm text-white">
                    {track.documents.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <label className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-[#2E2744] bg-[#0C1014]/50 p-4 transition hover:border-primary/60 hover:bg-[#181A20]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {track.uploadLabel}
                    </span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="text-primary"
                    >
                      <path
                        d="M10.0003 12.0833V3.75M10.0003 12.0833C9.41683 12.0833 8.3266 10.4214 7.91699 10M10.0003 12.0833C10.5838 12.0833 11.6741 10.4214 12.0837 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.6663 13.75C16.6663 15.8183 16.2347 16.25 14.1663 16.25H5.83301C3.76467 16.25 3.33301 15.8183 3.33301 13.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-webGray">
                    PDF, PNG, or JPEG up to 25MB each. Multiple files allowed.
                  </p>
                  <input type="file" className="sr-only" multiple />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-webGray">
                    Privileges Unlocked
                  </span>
                  <ul className="flex flex-col gap-2 text-sm text-white">
                    {track.privileges.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6AA5FF]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="mt-auto inline-flex h-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#482090] px-3 text-xs font-bold text-white transition-opacity hover:opacity-90 sm:text-sm">
                  Submit for review
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support & Compliance */}
      <section className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
            <h3 className="text-lg font-bold text-white">
              Compliance Assistance
            </h3>
            <p className="text-sm text-webGray">
              Need help with certifications or document requirements? Our
              compliance team responds within one business day.
            </p>
            <button className="inline-flex h-8 items-center justify-center rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-3 text-xs font-bold text-white transition-colors hover:bg-[#181A20] sm:text-sm">
              Contact compliance desk
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
            <h3 className="text-lg font-bold text-white">Security & Privacy</h3>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-webGray">
              <li>
                Documents are stored with end-to-end encryption in EU & US
                regions.
              </li>
              <li>
                Only the compliance and legal teams have access to raw files.
              </li>
              <li>
                You can request data deletion at any time from your account
                settings.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KycSettings;
