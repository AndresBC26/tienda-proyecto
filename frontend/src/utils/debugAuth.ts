// src/utils/debugAuth.ts
export const debugGoogleAuth = async (token: string, intent: 'register' | 'login') => {
  const API_URL = process.env.REACT_APP_API_URL;
  
  console.log('🔍 Debug Google Auth:');
  console.log('API_URL:', API_URL);
  console.log('Token length:', token?.length);
  console.log('Intent:', intent);
  
  try {
    const response = await fetch(`${API_URL}/api/users/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, intent }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en el servidor');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en debugGoogleAuth:', error);
    throw error;
  }
};

export const testBackendConnection = async () => {
  const API_URL = process.env.REACT_APP_API_URL;
  
  console.log('🔍 Testing backend connection:');
  console.log('API_URL:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();
    console.log('✅ Backend connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};
