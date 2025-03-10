/**
 * Utility functions for file uploads
 */

// Function to generate a unique filename
const generateUniqueFilename = (file: File): string => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  };
  
  // Function to upload an image to the server
  export const uploadImage = async (file: File): Promise<{ success: boolean, path: string, error?: string }> => {
    try {
      // Create a unique filename
      const filename = generateUniqueFilename(file);
      const path = `/assets/images/profilepics/${filename}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('path', 'profilepics'); // Specify subfolder on the server
  
      // Make API request to the server's file upload endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          path: '', 
          error: errorData.message || `Error: ${response.status} ${response.statusText}` 
        };
      }
  
      const data = await response.json();
      return { success: true, path: data.path || path };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      return { success: false, path: '', error: errorMessage };
    }
  };
  
  // Mock function for testing without a backend
  export const mockUploadImage = async (file: File): Promise<{ success: boolean, path: string, error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filename = generateUniqueFilename(file);
        const path = `/assets/images/profilepics/${filename}`;
        
        // Simulate successful upload
        resolve({ success: true, path });
      }, 1000); // Simulate network delay
    });
  };
  
  // Export a single function that you can use in your components
  // You can manually toggle between real and mock implementations during development
  const USE_MOCK = false; // Set to true during development if needed
  
  export const handleImageUpload = async (file: File): Promise<{ success: boolean, path: string, error?: string }> => {
    return USE_MOCK ? mockUploadImage(file) : uploadImage(file);
  };
  
  export default handleImageUpload;