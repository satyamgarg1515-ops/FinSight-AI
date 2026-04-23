import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Moon, Sun } from 'lucide-react';

const Dashboard = ({ toggleTheme, theme }) => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/analytics/dashboard', config);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  const chartData = [
    { name: 'Given', amount: analytics?.totalGiven || 0 },
    { name: 'Received', amount: analytics?.totalReceived || 0 },
  ];
  
  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted">Welcome back, {user.username}</p>
        </div>
        <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div className="text-muted mb-2 font-medium">Total Given</div>
          <div className="text-3xl font-bold text-danger">₹{analytics?.totalGiven || 0}</div>
        </div>
        <div className="glass-card">
          <div className="text-muted mb-2 font-medium">Total Received</div>
          <div className="text-3xl font-bold text-success">₹{analytics?.totalReceived || 0}</div>
        </div>
        <div className="glass-card">
          <div className="text-muted mb-2 font-medium">Net Balance</div>
          <div className={`text-3xl font-bold ${(analytics?.totalReceived - analytics?.totalGiven) >= 0 ? 'text-success' : 'text-danger'}`}>
             ₹{Math.abs(analytics?.totalReceived - analytics?.totalGiven) || 0}
             <span style={{ fontSize: '1rem', marginLeft: '0.5rem', fontWeight: '500' }}>
               {(analytics?.totalReceived - analytics?.totalGiven) >= 0 ? '(Owed to you overall)' : '(You owe overall)'}
             </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Bar Chart */}
        <div className="glass-card">
          <h3 className="font-bold mb-4">Given vs Received Overview</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Balances PIE representation placeholder or something similar... */}
        <div className="glass-card">
          <h3 className="font-bold mb-4">User-wise Balances</h3>
          {Object.keys(analytics?.userBalances || {}).length === 0 ? (
             <p className="text-muted">No interactions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {Object.entries(analytics.userBalances).map(([userId, balance]) => (
                  <div key={userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                    <span className="font-medium">User ID: {userId.substring(0,6)}...</span>
                    <span className={`font-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                       {balance > 0 ? `You owe ₹${balance}` : `Owes you ₹${Math.abs(balance)}`}
                    </span>
                  </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
