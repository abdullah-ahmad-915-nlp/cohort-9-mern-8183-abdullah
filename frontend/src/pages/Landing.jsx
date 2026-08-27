import { Link } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';
import '../styles/Landing.css';

function Landing() {
    return (
        <div className="landing">
            <div className="landing-content">
                <NotebookPen size={40} className="landing-icon" aria-hidden="true" />
                <h1>My Notes App</h1>
                <p>Create, edit and manage your notes securely.</p>
                <div className="landing-actions">
                    <Link to="/login" className="btn btn-primary">
                        Login
                    </Link>
                    <Link to="/register" className="btn btn-secondary">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Landing;