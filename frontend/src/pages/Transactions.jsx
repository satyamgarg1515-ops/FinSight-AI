import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchData = async () => {
    try {
      const [txRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions', config),
        axios.get('http://localhost:5000/api/users', config)
      ]);
      setTransactions(txRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/transactions', { receiver: receiverId, amount: Number(amount), note }, config);
      setReceiverId('');
      setAmount('');
      setNote('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, config);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Transactions</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* ADD TRANSACTION FORM */}
        <div className="glass-card">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} /> Add New Transaction</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="input-group">
              <label className="input-label">Receiver</label>
              <select className="form-control" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} required>
                <option value="">Select a user</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input type="number" className="form-control" placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
            </div>

            <div className="input-group">
              <label className="input-label">Note (Optional)</label>
              <input type="text" className="form-control" placeholder="Dinner, movie, etc." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            
            <button type="submit" className="btn btn-primary w-full">Record Transaction</button>
          </form>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="glass-card">
          <h3 className="font-bold mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-muted">No transactions found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.map(tx => {
                 const isSender = tx.sender._id === user._id;
                 return (
                  <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: `4px solid ${isSender ? 'var(--danger)' : 'var(--success)'}` }}>
                    <div>
                      <div className="font-bold">
                        {isSender ? `To: ${tx.receiver.username}` : `From: ${tx.sender.username}`}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {format(new Date(tx.date), 'MMM dd, yyyy hh:mm a')} {tx.note && `• ${tx.note}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className={`font-bold text-xl ${isSender ? 'text-danger' : 'text-success'}`}>
                        {isSender ? '-' : '+'}₹{tx.amount}
                      </div>
                      {isSender && (
                        <button onClick={() => handleDelete(tx._id)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Transactions;
