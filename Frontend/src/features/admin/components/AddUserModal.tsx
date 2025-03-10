import React, { useState, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchApi } from '../../../utils/api';
import Modal from '../../../components/layout/Modal';
// Import the new image upload utility
import { uploadImageToImgBB } from '../../../utils/imgbbUpload';
// Import the fingerprint scanner modal
import FingerprintScannerModal from '../../users/components/FingerprintScannerModal';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (newUser: any) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    picture: '',
    category_id: '',
    biometric_fingerprint: 'default' // Default value as in the original code
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Add new state for the fingerprint scanner
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      if (token) {
        try {
          const response = await fetchApi('/categories', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          if (response.data) {
            setCategories(Array.isArray(response.data) ? response.data : []);
          }
        } catch (err) {
          console.error('Failed to fetch categories');
          setCategories([]);
        }
      }
    };
  
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handler for fingerprint capture
  const handleFingerprintCaptured = (fingerprintData: string) => {
    setFormData({
      ...formData,
      biometric_fingerprint: fingerprintData
    });
    setFingerprintCaptured(true);
    setIsFingerprintModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (selectedFile) {
        setUploadingImage(true);
        const uploadResult = await uploadImageToImgBB(selectedFile);
        setUploadingImage(false);
        
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          setError(uploadResult.error || 'Failed to upload image');
          setLoading(false);
          return;
        }
      }
      
      // Prepare user data
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        picture: imageUrl, // Use the URL from the cloud hosting
        category_id: formData.category_id ? Number(formData.category_id) : null,
        roles: [2], // Default role ID for regular users
        biometric_fingerprint: formData.biometric_fingerprint // Use the captured fingerprint data
      };
      
      // Create user
      const response = await fetchApi('/persons', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Success, close modal and update user list
        onUserAdded(response.data);
        resetForm();
        onClose();
      }
    } catch (err) {
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      picture: '',
      category_id: '',
      biometric_fingerprint: 'default'
    });
    setImagePreview(null);
    setSelectedFile(null);
    setError(null);
    setFingerprintCaptured(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Add New User" size="lg">
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div 
              onClick={triggerFileInput}
              className="relative cursor-pointer group"
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview}
                    alt="Profile Preview"
                    className="h-32 w-32 rounded-full object-cover border-4 border-blue-500"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600 text-gray-400">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Choose Photo</span>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Add fingerprint section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Fingerprint</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setIsFingerprintModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  Escanear Huella
                </button>
                {fingerprintCaptured && (
                  <div className="ml-3 flex items-center text-green-500">
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Huella capturada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Fingerprint Scanner Modal */}
      <FingerprintScannerModal 
        isOpen={isFingerprintModalOpen}
        onClose={() => setIsFingerprintModalOpen(false)}
        onFingerprintCaptured={handleFingerprintCaptured}
      />
    </>
  );
};

export default AddUserModal;