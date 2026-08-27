import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Register.css';

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
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <UserPlus size={28} className="auth-icon" aria-hidden="true" />
                    <h1>My Notes App</h1>
                    <p className="auth-subtitle">Create Your Account</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <div className="input-with-icon">
                            <User size={16} className="input-icon" aria-hidden="true" />
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
                        </div>
                        <span className="field-hint">Must be 3-20 characters (both inclusive)</span>
                    </div>
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
                            />
                        </div>
                        <span className="field-hint">Must be unique</span>
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
                        <span className="field-hint">Minimum 6 characters</span>
                    </div>
                    <div>
                        {error && <span role="alert" className="auth-error">{error}</span>}
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;