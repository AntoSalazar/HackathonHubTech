// utils/imgbbUpload.ts

/**
 * Uploads an image to ImgBB and returns the URL
 * @param file The file to upload
 * @returns Promise that resolves to the image URL
 */
export const uploadImageToImgBB = async (file: File): Promise<{ success: boolean; url: string; error?: string }> => {
    // You'll need to get a free API key from https://api.imgbb.com/
    const apiKey = ''; // Replace with your actual API key
    
    try {
      // Create FormData object for the API request
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', apiKey);
      
      // Make request to ImgBB API
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          url: data.data.url // Or use data.data.display_url for direct image link
        };
      } else {
        return {
          success: false,
          url: '',
          error: data.error?.message || 'Failed to upload image'
        };
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        url: '',
        error: 'Network error when uploading'
      };
    }
  };