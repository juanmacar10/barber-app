import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    
    const { user, loading } = useAuth();

    if(loading) {
        return <div className="container" style={{padding: '3rem'}}>Cargando...</div>;
    }

    if(!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
