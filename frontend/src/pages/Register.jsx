import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    const navigate = useNavigate();

    function handleChangeName(e) {
        setName(e.target.value);
    }

    function handleChangeEmail(e) {
        setEmail(e.target.value);
    }

    function handleChangePassword(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/login');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>My Notes App</h1>
            <p>Create Your Account</p>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Enter name"
                        value={name}
                        onChange={handleChangeName}
                        required
                        minLength={3}
                        maxLength={20}
                    />
                    <span>Must be 3-20 characters (both inclusive)</span>
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={handleChangeEmail}
                        required
                    />
                    <span>Must be unique</span>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={handleChangePassword}
                        required
                        minLength={6}
                    />
                    <span>Minimum 6 characters</span>
                </div>
                <div>
                    {error && <span role="alert">{error}</span>}
                </div>
                <div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>                    
                </div>
            </form>
            <p>
                Already have an account?
                <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;