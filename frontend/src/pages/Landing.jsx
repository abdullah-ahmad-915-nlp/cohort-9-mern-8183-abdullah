import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div>
            <h1>My Notes App</h1>
            <p>Create, edit and manage your notes securely.</p>
            <Link to="/login">
                <button>Login</button>
            </Link>
            <Link to="/register">
                <button>Register</button>
            </Link>
        </div>
    );
}

export default Landing;