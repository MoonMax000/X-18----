import { FC } from 'react';
import { Smartphone, Loader2, X, Globe, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSessions } from '@/hooks/useSecurity';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

const ActiveSessions: FC = () => {
  const { sessions, isLoading: sessionsLoading, revokeSession } = useSessions();

  const getDeviceIcon = (deviceType: string) => {
    if (!deviceType) return <Monitor className="w-5 h-5" />;
    
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex w-full max-w-[1400px] flex-col gap-6">
      <section className="w-full">
        <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">User Sessions</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Active devices on your account. End session if unrecognized
                </p>
              </div>
            </div>
            {sessions && sessions.length > 1 && (
              <button
                onClick={() => {
                  if (confirm('Завершить все сессии кроме текущей?')) {
                    sessions.forEach(session => {
                      if (!session.is_current) {
                        revokeSession(session.id);
                      }
                    });
                  }
                }}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-red-500/20 px-4 text-xs font-bold text-red-400 backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm border border-red-500/30 whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                Завершить все остальные
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden md:flex justify-between items-center text-xs font-bold uppercase text-gray-400">
                <div className="flex-1">Device</div>
                <div className="flex-1">IP Address</div>
                <div className="flex-1">Created at</div>
                <div className="flex-1">Last Active</div>
                <div className="flex-1">Status</div>
                <div className="w-[120px] text-center">Actions</div>
              </div>

              {/* Sessions List */}
              <div className="flex flex-col gap-4">
                {sessions?.map((session: Session) => {
                  const createdDate = new Date(session.created_at);
                  const lastActiveDate = session.last_active ? new Date(session.last_active) : null;
                  
                  return (
                    <div
                      key={session.id}
                      className={cn(
                        "p-4 rounded-2xl border backdrop-blur-[50px] flex flex-col md:flex-row md:justify-between md:items-center gap-4",
                        session.is_current 
                          ? "border-primary/50 bg-[rgba(160,106,255,0.1)]" 
                          : "border-[#181B22] bg-[rgba(11,14,17,0.5)]"
                      )}
                    >
                      {/* Device */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          {getDeviceIcon(session.device_type)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm md:text-[15px]">
                            {session.device_type || 'Device'}
                          </span>
                          {session.is_current && (
                            <span className="text-xs text-primary font-bold">
                              Current session
                            </span>
                          )}
                        </div>
                      </div>

                      {/* IP Address */}
                      <div className="flex-1 flex items-center gap-2">
                        <Globe className="w-3 h-3 text-gray-400 md:hidden" />
                        <span className="text-sm font-bold text-white">
                          {session.ip_address}
                        </span>
                      </div>

                      {/* Created At */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:block">
                          <span className="text-xs text-gray-400 md:hidden">Created:</span>
                          <span className="text-sm font-bold text-white">
                            {createdDate.toLocaleDateString()} at {createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Last Active */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:block">
                          <span className="text-xs text-gray-400 md:hidden">Last active:</span>
                          <span className="text-sm font-bold text-white">
                            {lastActiveDate ? (
                              `${formatDistanceToNow(lastActiveDate)} ago`
                            ) : (
                              'Recently'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex-1 flex items-center">
                        <div className="flex px-2 py-1 justify-center items-center gap-1 rounded bg-green-500/20">
                          <span className="text-xs font-bold text-green-400">
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full md:w-[120px] flex justify-center items-center gap-2">
                        {!session.is_current && (
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.25 4.58301L15.7336 12.9373C15.6016 15.0717 15.5357 16.1389 15.0007 16.9063C14.7361 17.2856 14.3956 17.6058 14.0006 17.8463C13.2017 18.333 12.1325 18.333 9.99392 18.333C7.8526 18.333 6.78192 18.333 5.98254 17.8454C5.58733 17.6044 5.24667 17.2837 4.98223 16.9037C4.4474 16.1352 4.38287 15.0664 4.25384 12.929L3.75 4.58301" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M2.5 4.58366H17.5M13.3797 4.58366L12.8109 3.4101C12.433 2.63054 12.244 2.24076 11.9181 1.99767C11.8458 1.94374 11.7693 1.89578 11.6892 1.85424C11.3283 1.66699 10.8951 1.66699 10.0287 1.66699C9.14067 1.66699 8.69667 1.66699 8.32973 1.86209C8.24842 1.90533 8.17082 1.95524 8.09774 2.0113C7.76803 2.26424 7.58386 2.66828 7.21551 3.47638L6.71077 4.58366" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActiveSessions;
