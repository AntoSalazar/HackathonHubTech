import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchApi } from '../../../utils/api';

interface Category {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface Person {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  picture?: string;
  category_id?: number;
  category?: Category | null;
  roles: Role[];
}

export default function ProfileEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [user, setUser] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchApi<Person>(`/persons/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetchApi<Category[]>('/categories', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };

    // Fetch roles
    const fetchRoles = async () => {
      try {
        const response = await fetchApi<Role[]>('/roles', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setRoles(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch roles');
      }
    };

    if (token) {
      fetchUserData();
      fetchCategories();
      fetchRoles();
    }
  }, [id, token]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (user) {
      setUser({
        ...user,
        [name]: value
      });
    }
  };

  // Handle role checkbox changes
  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (!user) return;

    let updatedRoles;
    if (checked) {
      // Add the role if it's not already there
      const roleToAdd = roles.find(r => r.id === roleId);
      if (roleToAdd && !user.roles.some(r => r.id === roleId)) {
        updatedRoles = [...user.roles, roleToAdd];
      } else {
        updatedRoles = user.roles;
      }
    } else {
      // Remove the role
      updatedRoles = user.roles.filter(r => r.id !== roleId);
    }

    setUser({
      ...user,
      roles: updatedRoles
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare data for API submission
      const userData = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        picture: user.picture,
        category_id: user.category_id,
        roles: user.roles.map(role => role.id)
      };
      
      const response = await fetchApi(`/persons/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        // Navigate back after successful update
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Main content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Edit User Profile</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900 bg-opacity-50 text-green-200 p-4 rounded mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>User profile updated successfully! Redirecting...</p>
              </div>
            </div>
          )}
          
          {!loading && user && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                {user.picture ? (
                  <img 
                    src={user.picture}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-32 w-32 rounded-full object-cover border-4 border-blue-500"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={user.first_name}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={user.last_name}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                
                <div>
                  <label htmlFor="picture" className="block text-sm font-medium text-gray-300 mb-1">
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    id="picture"
                    name="picture"
                    value={user.picture || ''}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={user.category_id || ''}
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Roles
                </label>
                <div className="space-y-2">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={user.roles.some(r => r.id === role.id)}
                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`role-${role.id}`} className="ml-2 text-sm font-medium text-gray-300">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mr-4 px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}