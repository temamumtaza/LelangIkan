import React, { createContext, useReducer, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create useAuth hook for components to use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SWITCH_ROLE_SUCCESS':
      return {
        ...state,
        user: {
          ...state.user,
          role: action.payload
        }
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        dispatch({ type: 'AUTH_ERROR' });
        return;
      }

      try {
        // Set default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const res = await axios.get('/api/auth/me');
        dispatch({ type: 'USER_LOADED', payload: res.data.data });
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR', payload: err.response?.data?.message || 'Authentication error' });
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
      
      // Set default headers after successful registration
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    } catch (err) {
      dispatch({ 
        type: 'REGISTER_FAIL', 
        payload: err.response?.data?.message || 'Registration failed' 
      });
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      
      // Set default headers after successful login
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    } catch (err) {
      dispatch({ 
        type: 'LOGIN_FAIL', 
        payload: err.response?.data?.message || 'Invalid credentials' 
      });
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Switch user role
  const switchRole = async (role) => {
    try {
      const res = await axios.put('/api/auth/switchrole', { role });
      dispatch({ type: 'SWITCH_ROLE_SUCCESS', payload: role });
      return res.data;
    } catch (err) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: err.response?.data?.message || 'Role switch failed' 
      });
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('/api/auth/updatedetails', userData);
      dispatch({ type: 'UPDATE_USER', payload: res.data.data });
      return res.data;
    } catch (err) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: err.response?.data?.message || 'Profile update failed' 
      });
      throw err;
    }
  };

  // Upload profile image
  const uploadProfileImage = async (formData) => {
    try {
      const res = await axios.put('/api/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      dispatch({ type: 'UPDATE_USER', payload: res.data.data });
      return res.data;
    } catch (err) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: err.response?.data?.message || 'Image upload failed' 
      });
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        switchRole,
        updateProfile,
        uploadProfileImage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 