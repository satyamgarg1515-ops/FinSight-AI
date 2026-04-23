import { useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, LogOut, Moon, Sun, User, Users, ShieldAlert, LineChart, Network } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <ArrowLeftRight size={20} /> },
    { name: 'User Balances', path: '/user-balances', icon: <Users size={20} /> },
    { name: 'Split Groups', path: '/groups', icon: <Network size={20} /> },
    { name: 'AI Insights', path: '/insights', icon: <LineChart size={20} /> },
  ];

  if (user && user.role === 'Admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: <ShieldAlert size={20} /> });
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>FinsightAI</h1>
        </div>
        
        <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '12px',
                background: location.pathname === item.path ? 'var(--primary-color)' : 'transparent',
                color: location.pathname === item.path ? 'white' : 'var(--text-main)',
                fontWeight: location.pathname === item.path ? '600' : '500',
                transition: 'all 0.2s',
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0 1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <User size={16} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: '0.875rem' }}>{user.username}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost w-full justify-between items-center" onClick={handleLogout}>
            <span>Log out</span>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
