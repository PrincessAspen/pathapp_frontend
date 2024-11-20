import {Form, useActionData, Navigate} from 'react-router-dom';
import {z} from 'zod';
import supabase from '../supabase';

const LoginSchema = z.object({
    email: z.string().email('invalid-email').transform(email => email.toLowerCase()),
    password: z.string().min(8, 'password-too-short'),
});

export const action = async ({request}) => {
    const formData = await request.formData();
    const result = await LoginSchema.safeParseAsync({
        email: formData.get('username'),
        password: formData.get('password'),
    });
    
    if (!result.success) {
        console.error(result.error);
        return null
    }

    const { email, password } = result.data;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if(error) {
        console.error( error );
    }
    return data;
}

const Login = () => {
    const data = useActionData();
    
    if (data) {
        return <Navigate to='/' replace />
    }

    return (
        <div className="bg-artsy">
            <Form action="/login" method="POST">
                <label>
                    Email Address
                    <input name="username" type="email" placeholder="bingusbongusbungus" autoComplete="email" required/>
                </label>
                <label>
                    Password 
                    <input name="password" type="password" placeholder="PasswordPassword123" autoComplete="password" required/>
                </label>
                <button type="submit">Log in</button>
            </Form>
        </div>
    );
};

export default Login;