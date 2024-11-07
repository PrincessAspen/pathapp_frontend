import {Form} from 'react-router-dom';
import {z} from 'zod';
import supabase from '../supabase';

const RegistrationSchema = z.object({
    email: z.string().email('invalid-email').transform(email => email.toLowerCase()),
    password: z.string().min(8, 'password-too-short'),
});

export const action = async ({request}) => {
    const formData = await request.formData();
    const result = await RegistrationSchema.safeParseAsync({
        email: formData.get('username'),
        password: formData.get('password'),
    });
    
    if (!result.success) {
        console.error(result.error);
        return null
    }

    const { email, password } = result.data;

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })

    console.log( data, error )
    return null
}

const Registration = () => {
    return (
        <div>
          <Form action="/registration" method="POST">
            <label>
              Enter your username
              <input name="username" type="email" placeholder="bingusbongusbungus" autoComplete="email" required/>
            </label>
            <label>
              Choose a secure password
              <input name="password" type="password" placeholder="SuperSecurePassword321" autoComplete="password" required/>
            </label>
            <button type="submit">Register</button>
          </Form>
        </div>
      );
};

export default Registration;