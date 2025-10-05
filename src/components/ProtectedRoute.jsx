import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {account} from "../appwriteConfig.js"

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
        try {
          await account.get();
          setAuth(true);
        } catch (err) {
          setAuth(false);
        }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (auth === false) {
      navigate('/not-logged-in');
    }
  }, [auth, navigate]);

  return auth ? children : null;
};

export default ProtectedRoute;