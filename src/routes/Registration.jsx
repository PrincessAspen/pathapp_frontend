import { Form } from 'react-router-dom';
import { z } from 'zod';
import supabase from '../supabase';

const RegistrationSchema = z.object({
  email: z.string().email('invalid-email').transform(email => email.toLowerCase()),
  password: z.string().min(8, 'password-too-short'),
});

export const action = async ({ request }) => {
  const formData = await request.formData();
  const result = await RegistrationSchema.safeParseAsync({
    email: formData.get('username'),
    password: formData.get('password'),
  });

  if (!result.success) {
    console.error(result.error);
    return null;
  }

  const { email, password } = result.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log(data, error);
  return null;
};

const Registration = () => {
  return (
    <div className="container bg-artsy flex justify-center">
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md pb-24">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Register</h1>
        
        <Form action="/registration" method="POST">
          <div className="mb-6">
            <label htmlFor="username" className="block text-lg font-semibold text-gray-700 mb-2">
              Enter your email
            </label>
            <input 
              name="username" 
              type="email" 
              id="username" 
              placeholder="your.email@example.com" 
              autoComplete="email" 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-2">
              Choose a secure password
            </label>
            <input 
              name="password" 
              type="password" 
              id="password" 
              placeholder="SuperSecurePassword321" 
              autoComplete="password" 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="text-center">
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
            >
              Register
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Registration;
