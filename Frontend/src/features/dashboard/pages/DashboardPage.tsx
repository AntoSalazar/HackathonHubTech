import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { fetchApi, userApi } from '../../../utils/api';
import { debounce } from 'lodash';
import AddUserModal from '../../admin/components/AddUserModal';



interface Category {
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
  roles: { id: number; name: string }[];
}

export default function DashboardPage() {
  const { user, logout, token, isAdmin } = useAuth();
  const [users, setUsers] = useState<Person[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users for admin dashboard
  useEffect(() => {
    if (isAdmin && token) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const response = await fetchApi<Person[]>('/persons', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.error) {
            setError(response.error);
          } else if (response.data) {
            // Data is an array directly based on your API response
            setUsers(response.data);
            setFilteredUsers(response.data);
          }
        } catch (err) {
          setError('Failed to fetch users');
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [token, isAdmin]);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (!searchValue.trim()) {
        setFilteredUsers(users);
        return;
      }

      const lowerCaseSearch = searchValue.toLowerCase();
      const filtered = users.filter(user => 
        user.first_name.toLowerCase().includes(lowerCaseSearch) || 
        user.last_name.toLowerCase().includes(lowerCaseSearch) || 
        (user.category?.name?.toLowerCase().includes(lowerCaseSearch) || false)
      );
      
      setFilteredUsers(filtered);
    }, 300),
    [users]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const navigate = useNavigate();

// In your handleDeleteUser function:
const handleDeleteUser = async (userId: number) => {
  if (!token) {
    setError('Authentication token is missing');
    return;
  }

  if (window.confirm('Estas seguro que quieres borrar el usuario?')) {
    try {
      const response = await userApi.deleteUser(userId, token);
      if (!response.error) {
        // Remove the user from the state
        setUsers(users.filter(u => u.id !== userId));
        setFilteredUsers(filteredUsers.filter(u => u.id !== userId));
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  }
};
const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
const handleUserAdded = (newUser: Person) => {
  setUsers([...users, newUser]);
  setFilteredUsers([...filteredUsers, newUser]);
};

  return (
    
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
          <div className="mt-8">
            <div className="flex items-center p-3 mb-4 bg-gray-700 rounded">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="h-10 w-10 rounded-full mr-3 border-2 border-blue-400"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-200">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-400">{isAdmin ? 'Administrator' : 'User'}</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6">
            <div className="px-4 py-3 bg-gray-700 rounded flex items-center text-blue-400 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Dashboard
            </div>
            
            
            
            <div className="px-4 py-3 mt-2 rounded hover:bg-gray-700 flex items-center text-gray-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Configuracion
            </div>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 00-1 1v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 14.586V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Salir
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isAdmin ? "Admin Dashboard" : "Dashboard"}
          </h1>
          <div className="flex items-center">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Usuarios</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Admin Users</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.roles.some(r => r.name === 'admin')).length}
                </p>
              </div>
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Usuarios Regulares</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.roles.some(r => r.name === 'user')).length}
                </p>
              </div>
              <div className="p-3 bg-purple-500 bg-opacity-20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-white">Manejo de usuarios</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="bg-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 border-gray-600 placeholder-gray-400"
                  placeholder="Buscar por nombre o categoria"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    onClick={() => {
                      setSearchTerm('');
                      setFilteredUsers(users);
                    }}
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Usuario
              </button>
            </div>
          </div>
          
          {/* Admin users panel */}
          {isAdmin && (
            <div>
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
              
              {!loading && !error && (
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Roles</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.picture ? (
                                <img 
                                  src={user.picture} 
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="h-10 w-10 rounded-full mr-3 object-cover border border-gray-600"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                                  <span className="text-white font-bold">{user.first_name[0]}{user.last_name[0]}</span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-white">{user.first_name} {user.last_name}</div>
                                <div className="text-xs text-gray-400">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.category ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-indigo-900 text-indigo-200">
                                {user.category.name}
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <span 
                                  key={role.id}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    role.name === 'admin' 
                                      ? 'bg-red-900 text-red-200' 
                                      : 'bg-blue-900 text-blue-200'
                                  }`}
                                >
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => navigate(`/admin/user/edit/${user.id}`)}
                              className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                              title="Edit user"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete user"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && filteredUsers.length === 0 && (
                <div className="bg-gray-700 bg-opacity-50 py-16 rounded-lg flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg">
                    {searchTerm ? `No users matching "${searchTerm}"` : "No users found."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <AddUserModal 
  isOpen={isAddUserModalOpen} 
  onClose={() => setIsAddUserModalOpen(false)}
  onUserAdded={handleUserAdded}
/>
    </div>

    
  );
 
}

