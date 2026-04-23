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
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Other');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      let receiptUrl = null;
      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        const uploadConfig = { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } };
        const { data } = await axios.post('http://localhost:5000/api/upload', formData, uploadConfig);
        receiptUrl = data.imageUrl;
        setUploading(false);
      }

      await axios.post('http://localhost:5000/api/transactions', { 
        receiver: receiverId, amount: Number(amount), date: date || undefined, note, category, receiptUrl 
      }, config);
      
      setReceiverId('');
      setAmount('');
      setDate('');
      setNote('');
      setCategory('Other');
      setFile(null);
      fetchData();
    } catch (error) {
      setUploading(false);
      alert(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction from the database? This action cannot be fully undone after 10 seconds.")) return;
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
                  <option key={u._id} value={u._id}>{u.username}</option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input type="number" className="form-control" placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Date (Mandatory)</label>
              <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label">Note (Optional)</label>
              <input type="text" className="form-control" placeholder="Dinner, movie, etc." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="input-group">
               <label className="input-label">Receipt (Optional Image)</label>
               <input type="file" className="form-control" onChange={handleFileChange} accept="image/png, image/jpeg" />
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={uploading}>
              {uploading ? 'Uploading Receipt...' : 'Record Transaction'}
            </button>
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
                 const isSender = tx.sender?._id === user._id;
                 return (
                  <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: `4px solid ${isSender ? 'var(--danger)' : 'var(--success)'}` }}>
                    <div>
                      <div className="font-bold">
                        {isSender ? `To: ${tx.receiver?.username || 'Deleted User'}` : `From: ${tx.sender?.username || 'Deleted User'}`}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {format(new Date(tx.date), 'MMM dd, yyyy hh:mm a')} {tx.note && `• ${tx.note}`}
                        {tx.category && <span style={{ marginLeft: '10px', padding: '0.2rem 0.4rem', background: 'var(--border-color)', borderRadius: '4px' }}>{tx.category}</span>}
                        {tx.receiptUrl && <a href={`http://localhost:5000${tx.receiptUrl}`} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: 'var(--primary)', textDecoration: 'underline' }}>Receipt</a>}
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
