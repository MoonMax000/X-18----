import { FC } from 'react';
import { Loader2 } from 'lucide-react';
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
  // GeoIP location fields
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

const ActiveSessions: FC = () => {
  const { sessions, isLoading: sessionsLoading, revokeSession } = useSessions();

  // Deduplicate sessions by IP address - keep only the most recent session per IP
  const deduplicateSessions = (sessions: Session[]) => {
    const sessionsByIP = new Map<string, Session>();
    
    sessions.forEach(session => {
      const existing = sessionsByIP.get(session.ip_address);
      const currentTime = new Date(session.last_active || session.created_at).getTime();
      
      if (!existing) {
        sessionsByIP.set(session.ip_address, session);
      } else {
        const existingTime = new Date(existing.last_active || existing.created_at).getTime();
        // Keep the session with the most recent activity
        if (currentTime > existingTime) {
          sessionsByIP.set(session.ip_address, session);
        }
      }
    });
    
    return Array.from(sessionsByIP.values());
  };

  // Get unique sessions (deduplicated by IP)
  const uniqueSessions = sessions ? deduplicateSessions(sessions) : [];

  // Check if there are other sessions besides current
  const hasOtherSessions = uniqueSessions && uniqueSessions.some(s => !s.is_current);

  // Sign out from all other sessions
  const signOutAllOthers = async () => {
    if (!sessions) return;
    
    const otherSessions = sessions.filter(s => !s.is_current);
    if (otherSessions.length === 0) return;

    if (confirm(`Выйти из ${otherSessions.length} других сессий?`)) {
      for (const session of otherSessions) {
        await revokeSession(session.id);
      }
    }
  };

  // Get device name from OS
  const getDeviceName = (session: Session) => {
    if (session.os === 'macOS' || session.os.toLowerCase().includes('mac')) return 'Mac';
    if (session.os === 'Windows') return 'Windows';
    if (session.os === 'Linux') return 'Linux';
    if (session.os === 'iOS' || session.os === 'Android') return session.device_type || 'Mobile';
    return session.os || 'Unknown Device';
  };

  // Get device info string
  const getDeviceInfo = (session: Session) => {
    return `${session.browser || 'Unknown'} - ${session.os || 'Unknown'}`;
  };

  // Get location from GeoIP data
  const getLocation = (session: Session) => {
    // Check for localhost/local IP addresses
    if (session.ip_address === '127.0.0.1' || session.ip_address === '::1' || session.ip_address.startsWith('192.168.') || session.ip_address.startsWith('10.')) {
      return 'Это устройство';
    }
    // Check if we have GeoIP data from backend
    if (session.city && session.country) {
      return `${session.city}, ${session.country}`;
    }
    if (session.country) {
      return session.country;
    }
    // Fallback to IP address if no GeoIP data
    return session.ip_address || 'Unknown Location';
  };

  return (
    <div className="flex w-full max-w-[1400px] flex-col gap-6 bg-black rounded-3xl p-6">
      <section className="w-full">
        {/* Sign out all other sessions button */}
        {hasOtherSessions && !sessionsLoading && (
          <div className="flex justify-end mb-4">
            <button
              onClick={signOutAllOthers}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-700 px-6 text-sm font-bold text-white backdrop-blur-[50px] transition-all hover:opacity-90 hover:scale-105 active:scale-95 focus:outline-hidden"
            >
              <svg 
                className="shrink-0 size-4" 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Выйти из всех других сессий
            </button>
          </div>
        )}

        <div className="flex w-full flex-col gap-6">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !uniqueSessions || uniqueSessions.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
              <svg 
                className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-neutral-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 dark:text-neutral-400">Нет активных сессий</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-[1059px] mx-auto w-full">
              {uniqueSessions.map((session: Session) => {
                const lastActiveDate = session.last_active ? new Date(session.last_active) : null;
                
                return (
                  <div
                    key={session.id}
                    className={`p-5 space-y-4 flex flex-col rounded-xl ${
                      session.is_current 
                        ? 'bg-black border border-white/10' 
                        : 'bg-white border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between">
                      <div className={`flex justify-center items-center w-12 h-12 border rounded-xl ${
                        session.is_current ? 'border-gray-700' : 'border-gray-200 dark:border-neutral-700'
                      }`}>
                        <svg 
                          className={`w-6 h-6 ${
                            session.is_current ? 'text-gray-400' : 'text-gray-500 dark:text-neutral-500'
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
                        </svg>
                      </div>

                      {!session.is_current && (
                        <button 
                          type="button" 
                          onClick={() => revokeSession(session.id)}
                          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                        >
                          <svg 
                            className="shrink-0 size-3" 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" x2="9" y1="12" y2="12"/>
                          </svg>
                          Sign out
                        </button>
                      )}
                    </div>
                    {/* End Header */}

                    {/* Heading */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className={`font-medium ${
                        session.is_current ? 'text-white' : 'text-gray-800 dark:text-neutral-200'
                      }`}>
                        {getDeviceName(session)}
                      </span>
                      {session.is_current && (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                          Current session
                        </span>
                      )}
                    </div>
                    {/* End Heading */}

                    {/* List Group */}
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span className={`text-xs uppercase ${
                          session.is_current ? 'text-gray-400' : 'text-gray-500 dark:text-neutral-500'
                        }`}>
                          Location:
                        </span>
                        <span className={`text-sm ${
                          session.is_current ? 'text-gray-200' : 'text-gray-800 dark:text-neutral-200'
                        }`}>
                          {getLocation(session)}
                        </span>
                      </li>

                      <li className="flex justify-between items-center">
                        <span className={`text-xs uppercase ${
                          session.is_current ? 'text-gray-400' : 'text-gray-500 dark:text-neutral-500'
                        }`}>
                          Device:
                        </span>
                        <span className={`text-sm ${
                          session.is_current ? 'text-gray-200' : 'text-gray-800 dark:text-neutral-200'
                        }`}>
                          {getDeviceInfo(session)}
                        </span>
                      </li>

                      <li className="flex justify-between items-center">
                        <span className={`text-xs uppercase ${
                          session.is_current ? 'text-gray-400' : 'text-gray-500 dark:text-neutral-500'
                        }`}>
                          IP address:
                        </span>
                        <span className={`text-sm ${
                          session.is_current ? 'text-gray-200' : 'text-gray-800 dark:text-neutral-200'
                        }`}>
                          {session.ip_address}
                        </span>
                      </li>

                      <li className="flex justify-between items-center">
                        <span className={`text-xs uppercase ${
                          session.is_current ? 'text-gray-400' : 'text-gray-500 dark:text-neutral-500'
                        }`}>
                          Recent activity:
                        </span>
                        <span className={`text-sm ${
                          session.is_current ? 'text-gray-200' : 'text-gray-800 dark:text-neutral-200'
                        }`}>
                          {lastActiveDate ? (
                            `${formatDistanceToNow(lastActiveDate)} ago`
                          ) : (
                            'Recently'
                          )}
                        </span>
                      </li>
                    </ul>
                    {/* End List Group */}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActiveSessions;
