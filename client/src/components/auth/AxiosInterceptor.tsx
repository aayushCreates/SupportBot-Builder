import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../../api/axios';

const AxiosInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const interceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error fetching auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Extract backend error message
        if (error.response?.data) {
          const backendError = error.response.data.error || error.response.data.message;
          if (backendError) {
            error.message = backendError;
          }
        }

        if (error.response?.status === 401) {
          console.warn('Unauthorized request detected');
        }
        
        return Promise.reject(error);
      }
    );


    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [getToken, isLoaded, isSignedIn]);

  return <>{children}</>;
};

export default AxiosInterceptor;
