import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setFormError('Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="GPT-LOVERS"
          src="./src/assets/images/Logo.svg"
          className="mx-auto h-100 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Ingresa a tu cuenta
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      {(formError || error) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {formError || error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            required
            autoComplete="email"
          />
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Contraseña
              </label>
              
            </div>
            <div className="mt-2">
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <div>
            <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
              
            </Button>
          </div>
        </form>
      
      </div>
    </div>
  );
}