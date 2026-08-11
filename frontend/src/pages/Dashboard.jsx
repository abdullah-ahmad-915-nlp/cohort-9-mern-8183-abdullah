import { useAuth } from '../context/AuthContext.jsx';

function Dashboard() {
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
    }

    return (
        <div>
            <h1>My Notes App</h1>
            <h2>{user?.name}'s dashboard</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;