const invoices = [
  {
    id: "INV-2041",
    date: "May 12, 2024",
    amount: "$89.60",
    status: "Paid",
    method: "Visa •• 8421",
  },
  {
    id: "INV-2038",
    date: "Apr 12, 2024",
    amount: "$89.60",
    status: "Paid",
    method: "Visa •• 8421",
  },
  {
    id: "INV-2034",
    date: "Mar 12, 2024",
    amount: "$89.60",
    status: "Paid",
    method: "Visa •• 8421",
  },
];

export default function Billing() {
  return (
    <div className="flex flex-col gap-6">
      <div className="container-card p-6">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-2 text-sm text-webGray">
          View payment history, upcoming invoices, and manage your subscription
          details.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#0C101480] border border-widget-border p-4">
            <p className="text-webGray text-xs uppercase tracking-wide">
              Current Plan
            </p>
            <p className="mt-2 text-white text-lg font-semibold">Platinum</p>
            <p className="mt-1 text-xs text-webGray">
              Billed yearly — renews Jul 14, 2024
            </p>
          </div>
          <div className="rounded-2xl bg-[#0C101480] border border-widget-border p-4">
            <p className="text-webGray text-xs uppercase tracking-wide">
              Payment Method
            </p>
            <p className="mt-2 text-white text-lg font-semibold">
              Visa •• 8421
            </p>
            <p className="mt-1 text-xs text-webGray">Expires 08/26</p>
          </div>
          <div className="rounded-2xl bg-[#0C101480] border border-widget-border p-4">
            <p className="text-webGray text-xs uppercase tracking-wide">
              Last Invoice
            </p>
            <p className="mt-2 text-white text-lg font-semibold">$89.60</p>
            <p className="mt-1 text-xs text-webGray">Paid May 12, 2024</p>
          </div>
        </div>
      </div>

      <div className="container-card p-6">
        <h2 className="text-xl font-semibold text-white">Invoice History</h2>
        <div className="mt-4 divide-y divide-[#181B22]/60">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <p className="text-white font-medium">{invoice.id}</p>
                <p className="text-xs text-webGray mt-1">{invoice.date}</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/80">
                <span>{invoice.amount}</span>
                <span>{invoice.method}</span>
                <span className="rounded-full bg-green/10 text-green px-3 py-1 text-xs font-semibold">
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
