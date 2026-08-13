import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div>
            <h1>My Notes App</h1>
            <p>Create, edit and manage your notes securely.</p>
            <div>
                <Link to="/login" className="button-link">
                    Login
                </Link>
            </div>
            <div>
                <Link to="/register" className="button-link">
                    Register
                </Link>
            </div>
        </div>
    );
}

export default Landing;