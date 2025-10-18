import { FC } from "react";
import { cn } from "@/lib/utils";

const paymentMethods = [
  {
    id: "pm-visa",
    brand: "Visa",
    details: "**** **** **** 4242",
    expiry: "09/26",
    isDefault: true,
  },
  {
    id: "pm-mastercard",
    brand: "Mastercard",
    details: "**** **** **** 5555",
    expiry: "07/34",
    isDefault: false,
  },
] as const;

const billingHistory = [
  {
    id: "bh-20250615",
    date: "15.06.25",
    description: "Premium Plan - Monthly",
    amount: "$19.99",
    status: "Paid",
  },
  {
    id: "bh-20250515",
    date: "15.05.25",
    description: "Premium Plan - Monthly",
    amount: "$19.99",
    status: "Paid",
  },
  {
    id: "bh-20250415",
    date: "15.04.25",
    description: "Premium Plan - Monthly",
    amount: "$19.99",
    status: "Paid",
  },
] as const;

const billingStatusVariants = {
  Paid: "bg-[#1C3430] text-green",
  Pending: "bg-[#3A2127] text-[#EF454A]",
} as const;

const paymentColumnWidths = ["22%", "24%", "18%", "16%", "20%"] as const;
const billingColumnWidths = ["18%", "34%", "16%", "16%", "16%"] as const;

const ColumnGroup: FC<{ widths: readonly string[] }> = ({ widths }) => (
  <colgroup>
    {widths.map((width, index) => (
      <col key={index} style={{ width }} />
    ))}
  </colgroup>
);

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M1.667 9.99967C1.667 7.05177 1.667 5.57782 2.54433 4.59376C2.68465 4.43637 2.83931 4.2908 3.00654 4.15873C4.0521 3.33301 5.61818 3.33301 8.75033 3.33301H11.2503C14.3825 3.33301 15.9486 3.33301 16.9941 4.15873C17.1613 4.2908 17.316 4.43637 17.4563 4.59376C18.3337 5.57782 18.3337 7.05177 18.3337 9.99967C18.3337 12.9476 18.3337 14.4215 17.4563 15.4056C17.316 15.563 17.1613 15.7085 16.9941 15.8406C15.9486 16.6663 14.3825 16.6663 11.2503 16.6663H8.75033C5.61818 16.6663 4.0521 16.6663 3.00654 15.8406C2.83931 15.7085 2.68465 15.563 2.54433 15.4056C1.667 14.4215 1.667 12.9476 1.667 9.99967Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.33301 13.333H9.58301" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.083 13.333H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.667 7.5H18.3337" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
);

const BillingSettings: FC = () => {
  return (
    <div className="flex w-full max-w-[1059px] flex-col items-center gap-6">
      {/* Current Plan Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex items-center justify-between gap-4 pb-2">
            <h2 className="flex-1 text-xl font-bold text-white sm:text-2xl">
              Current Plan
            </h2>
            <div className="flex items-center justify-center gap-1 rounded bg-[#1C3430] px-1 py-0.5">
              <span className="text-xs font-bold text-green">Active</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-bold text-white sm:text-[19px]">
                Premium
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white sm:text-[19px]">
                  $19.99
                </span>
                <span className="text-sm font-normal text-webGray sm:text-[15px]">
                  / month
                </span>
              </div>
            </div>
            <p className="text-sm font-normal text-webGray sm:text-[15px]">
              Next billing date: July 15, 2025
            </p>
          </div>

          <div className="flex flex-col-reverse items-center gap-2.5 sm:flex-row sm:justify-end">
            <button className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] px-3 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:w-auto sm:text-sm">
              <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
                <path
                  d="M14.6472 16.25C16.6681 14.9063 18 12.6087 18 10C18 5.85787 14.6422 2.5 10.5 2.5C9.92717 2.5 9.36933 2.56422 8.83333 2.68585M14.6472 16.25V13.3333M14.6472 16.25H17.5833M6.33333 3.76296C4.32336 5.10839 3 7.39965 3 10C3 14.1422 6.35787 17.5 10.5 17.5C11.0728 17.5 11.6307 17.4357 12.1667 17.3142M6.33333 3.76296V6.66667M6.33333 3.76296H3.41667"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Change Plan
            </button>
            <button className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-full border border-[#EF454A] px-3 text-xs font-bold text-[#EF454A] backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:w-auto sm:text-sm">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4.375 4.16699L16.0417 15.8337"
                  stroke="#EF454A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5417 10.0003C18.5417 5.39795 14.8107 1.66699 10.2083 1.66699C5.60596 1.66699 1.875 5.39795 1.875 10.0003C1.875 14.6027 5.60596 18.3337 10.2083 18.3337C14.8107 18.3337 18.5417 14.6027 18.5417 10.0003Z"
                  stroke="#EF454A"
                  strokeWidth="1.5"
                />
              </svg>
              Cancel Subscription
            </button>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Payment Methods
              </h2>
              <p className="text-sm text-webGray">
                Manage saved cards and set a default payment option.
              </p>
            </div>
            <button className="inline-flex h-8 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#482090] px-3 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-auto">
              Add Payment Method
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.4)]">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full table-fixed border-collapse text-left text-sm text-white">
                <ColumnGroup widths={paymentColumnWidths} />
                <thead className="bg-[rgba(12,16,20,0.6)] text-xs uppercase tracking-[0.08em] text-webGray">
                  <tr>
                    <th className="px-4 py-3 font-bold">Method</th>
                    <th className="px-4 py-3 font-bold">Details</th>
                    <th className="px-4 py-3 font-bold">Expiry</th>
                    <th className="px-4 py-3 font-bold">Default</th>
                    <th className="px-4 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181B22]">
                  {paymentMethods.map((method) => (
                    <tr key={method.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 font-bold">
                          <span className="text-primary">
                            <CardIcon />
                          </span>
                          {method.brand}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold">{method.details}</td>
                      <td className="px-4 py-4">{method.expiry}</td>
                      <td className="px-4 py-4">
                        {method.isDefault ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-3 py-1 text-xs font-semibold text-white">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                              <path
                                d="M1.25 2.5L5.25 6.5L10.75 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Default
                          </span>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button className="inline-flex h-8 items-center justify-center rounded-full border border-transparent px-3 text-xs font-semibold text-primary transition-colors hover:text-white">
                            Edit
                          </button>
                          <button className="inline-flex h-8 items-center justify-center rounded-full border border-transparent px-3 text-xs font-semibold text-[#EF454A] transition-colors hover:text-[#FF6B70]">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Billing History Section */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Billing History
              </h2>
              <p className="text-sm text-webGray">
                Track previous invoices and payment statuses.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.4)]">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full table-fixed border-collapse text-left text-sm text-white">
                <ColumnGroup widths={billingColumnWidths} />
                <thead className="bg-[rgba(12,16,20,0.6)] text-xs uppercase tracking-[0.08em] text-webGray">
                  <tr>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Description</th>
                    <th className="px-4 py-3 font-bold">Amount</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 text-right font-bold">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181B22]">
                  {billingHistory.map((invoice) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-4 font-semibold">{invoice.date}</td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-white">{invoice.description}</span>
                      </td>
                      <td className="px-4 py-4">{invoice.amount}</td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                            billingStatusVariants[invoice.status] ?? "bg-[#181B22] text-webGray",
                          )}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white/70 transition-colors hover:bg-[rgba(12,16,20,0.7)] hover:text-white">
                            <DownloadIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BillingSettings;
