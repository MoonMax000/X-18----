import { useEffect } from 'react';
import { useLocation, useParams, matchPath } from 'react-router-dom';

export const RouteDebugger = () => {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('[ROUTE_DEBUG] Navigation occurred');
    console.log('[ROUTE_DEBUG] Current pathname:', location.pathname);
    console.log('[ROUTE_DEBUG] Current search:', location.search);
    console.log('[ROUTE_DEBUG] Current hash:', location.hash);
    console.log('[ROUTE_DEBUG] Route params:', params);
    console.log('[ROUTE_DEBUG] Full location:', location);
    
    // Check if path matches profile pattern
    const profileMatch = matchPath('/@:username', location.pathname);
    console.log('[ROUTE_DEBUG] Profile pattern match:', profileMatch);
    
    // Check wildcard match
    const wildcardMatch = matchPath('*', location.pathname);
    console.log('[ROUTE_DEBUG] Wildcard match:', wildcardMatch);
    
    console.log('═══════════════════════════════════════');
  }, [location, params]);

  return null;
};
