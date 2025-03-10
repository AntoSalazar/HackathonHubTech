import { useAuth } from '../../auth/context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tu perfil</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-6 mb-6">
            <img 
              src={`http://20.1.155.45:3000/uploads/${user?.picture || 'default.jpg'}`} 
              alt="Profile" 
              className="h-24 w-24 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
              }} 
            />
            <div>
              <h2 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2">
                {user?.roles.map(role => (
                  <span 
                    key={role.id} 
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Informacion de cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p>{user?.id}</p>
              </div>
             
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}