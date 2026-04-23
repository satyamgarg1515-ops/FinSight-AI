import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Trash2, Ban } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [globalTx, setGlobalTx] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchAdminData = async () => {
    try {
      const [uRes, txRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/transactions', config)
      ]);
      setUsers(uRes.data);
      setGlobalTx(txRes.data);
    } catch (err) {
      console.error(err);
      alert('Admin fetch error: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/toggle-block`, {}, config);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle block');
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("CRITICAL: Delete User permanently? This deletes all their associated records.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShieldAlert size={32} className="text-danger" /> Admin Control Center
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'users' ? 'var(--bg-main)' : undefined }} onClick={() => setActiveTab('users')}>
          Manage Users
        </button>
        <button className={`btn ${activeTab === 'tx' ? 'btn-primary' : ''}`} style={{ background: activeTab !== 'tx' ? 'var(--bg-main)' : undefined }} onClick={() => setActiveTab('tx')}>
          Global Oversight (Transactions)
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="glass-card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      background: u.status === 'Active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      color: u.status === 'Active' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {u.role !== 'Admin' && (
                      <>
                        <button className="btn" style={{ padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }} onClick={() => handleToggleBlock(u._id)}>
                          <Ban size={14} /> {u.status === 'Active' ? 'Block' : 'Unblock'}
                        </button>
                        <button className="btn" style={{ padding: '0.3rem 0.5rem', background: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.2rem' }} onClick={() => handleDeleteUser(u._id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tx' && (
        <div className="glass-card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Amount</th>
                <th>Note</th>
                <th>System State</th>
              </tr>
            </thead>
            <tbody>
              {globalTx.map(tx => (
                <tr key={tx._id} style={{ opacity: tx.isDeleted ? 0.5 : 1 }}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="font-medium text-danger">{tx.sender?.username}</td>
                  <td className="font-medium text-success">{tx.receiver?.username}</td>
                  <td className="font-bold">₹{tx.amount}</td>
                  <td>{tx.note || '-'}</td>
                  <td>{tx.isDeleted ? 'DELETED' : 'ACTIVE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
