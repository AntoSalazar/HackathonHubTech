// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Interface for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic fetch function with error handling
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    // Check if response status is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || `Error: ${response.status} ${response.statusText}` };
    }
    
    // Parse JSON response
    const data = await response.json();
    return { data };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error occurred';
    return { error: message };
  }
}

export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

export const userApi = {
  // Get all users
  getUsers: async (token: string) => {
    return fetchApi('/persons', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  // Get a single user by ID
  getUserById: async (id: string | number, token: string) => {
    return fetchApi(`/persons/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  // Update a user
  updateUser: async (id: string | number, userData: any, token: string) => {
    return fetchApi(`/persons/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
  },

   // Create a new user
   createUser: async (userData: any, token: string) => {
    return fetchApi('/persons', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
  },
  
  // Delete a user
  deleteUser: async (id: string | number, token: string) => {
    return fetchApi(`/persons/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export const categoryApi = {
  // Get all categories
  getCategories: async (token: string) => {
    return fetchApi('/categories', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export const roleApi = {
  // Get all roles
  getRoles: async (token: string) => {
    return fetchApi('/roles', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

// Add this to your api.ts file

export const fileApi = {
  // Upload an image file
  uploadImage: async (file: File, token: string): Promise<ApiResponse<{ path: string }>> => {
    try {
      const url = `${API_BASE_URL}/upload`;
      
      // Create FormData (don't set Content-Type header - browser will set it with boundary)
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.message || `Error: ${response.status} ${response.statusText}` };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error occurred';
      return { error: message };
    }
  }
};
