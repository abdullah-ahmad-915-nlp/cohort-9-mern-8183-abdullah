import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const navigate = useNavigate();

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
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <LogIn size={28} className="auth-icon" aria-hidden="true" />
                    <h1>Noteverse</h1>
                    <p className="auth-subtitle">Welcome Back</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <Mail size={16} className="input-icon" aria-hidden="true" />
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={handleChangeEmail}
                                required
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                title="Enter a valid email address (e.g. name@example.com)"
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={16} className="input-icon" aria-hidden="true" />
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={handleChangePassword}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div>
                        {error && <span role="alert" className="auth-error">{error}</span>}
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;