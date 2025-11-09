import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component to redirect old profile routes to new @username format
 */
export const ProfileRedirect = () => {
  const { user } = useAuth();
  
  if (!user?.username) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={`/@${user.username}`} replace />;
};
