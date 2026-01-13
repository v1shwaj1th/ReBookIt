import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expirationTime');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const expirationTime = localStorage.getItem('expirationTime');

      if (token && expirationTime) {
        if (Date.now() > parseInt(expirationTime)) {
          logout();
        } else {
          axios.defaults.headers.common['x-auth-token'] = token;
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) setUser(storedUser);
        }
      } else {
        logout(); // Ensure clean state if no token or no expiration
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    const expiresIn = 3600 * 1000; // 1 hour in ms
    const expirationTime = Date.now() + expiresIn;
    
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('expirationTime', expirationTime.toString());
    
    axios.defaults.headers.common['x-auth-token'] = res.data.token;
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
    const expiresIn = 3600 * 1000; // 1 hour in ms
    const expirationTime = Date.now() + expiresIn;

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('expirationTime', expirationTime.toString());

    axios.defaults.headers.common['x-auth-token'] = res.data.token;
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
