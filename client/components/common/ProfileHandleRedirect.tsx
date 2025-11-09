import { Navigate, useParams } from 'react-router-dom';

/**
 * Redirects old profile routes to new Twitter-style @username format
 * Example: /profile/john -> /@john
 */
export const ProfileHandleRedirect = () => {
  const { handle } = useParams<{ handle: string }>();
  
  if (!handle) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={`/@${handle}`} replace />;
};
