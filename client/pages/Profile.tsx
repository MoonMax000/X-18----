export default function Profile() {
  return (
    <div className="flex flex-col gap-6">
      <div className="container-card p-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-white">Profile Overview</h1>
          <p className="text-sm text-webGray">
            Manage your personal information, contact details, and account
            preferences in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#0C101480] border border-widget-border p-4">
              <p className="text-webGray text-xs uppercase tracking-wide">
                Status
              </p>
              <p className="mt-2 text-white text-lg font-semibold">Active</p>
              <p className="mt-1 text-xs text-webGray">
                Member since January 2024
              </p>
            </div>
            <div className="rounded-2xl bg-[#0C101480] border border-widget-border p-4">
              <p className="text-webGray text-xs uppercase tracking-wide">
                Plan
              </p>
              <p className="mt-2 text-white text-lg font-semibold">Platinum</p>
              <p className="mt-1 text-xs text-webGray">
                Next renewal: 14 Jul 2024
              </p>
            </div>
            <div className="rounded-2xl bg-[#0C101480] border border-widget-border p-4">
              <p className="text-webGray text-xs uppercase tracking-wide">
                Security
              </p>
              <p className="mt-2 text-white text-lg font-semibold">
                Two-factor enabled
              </p>
              <p className="mt-1 text-xs text-webGray">
                Last login: 2 hours ago
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="container-card p-6">
          <h2 className="text-xl font-semibold text-white">Personal Details</h2>
          <div className="mt-4 flex flex-col gap-4 text-sm text-white/80">
            <div className="flex flex-col">
              <span className="text-xs uppercase text-webGray">Full Name</span>
              <span className="mt-1 font-medium">Devid Stone</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-webGray">Email</span>
              <span className="mt-1 font-medium">devid.stone@example.com</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-webGray">Location</span>
              <span className="mt-1 font-medium">Warsaw, Poland</span>
            </div>
          </div>
        </div>

        <div className="container-card p-6">
          <h2 className="text-xl font-semibold text-white">Preferences</h2>
          <div className="mt-4 flex flex-col gap-4 text-sm text-white/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-xs text-webGray mt-1">
                  Receive weekly summaries and announcements.
                </p>
              </div>
              <span className="rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-semibold">
                Enabled
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">AI Recommendations</p>
                <p className="text-xs text-webGray mt-1">
                  Personalized suggestions for market opportunities.
                </p>
              </div>
              <span className="rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-semibold">
                Enabled
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Two-Factor Auth</p>
                <p className="text-xs text-webGray mt-1">
                  Secure your account with an extra verification step.
                </p>
              </div>
              <span className="rounded-full bg-green/10 text-green px-3 py-1 text-xs font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
