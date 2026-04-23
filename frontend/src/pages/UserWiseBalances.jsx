import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Download, FileSpreadsheet, Handshake } from 'lucide-react';

const UserWiseBalances = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  
  const [netBalanceInfo, setNetBalanceInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // Search Filters
  const [searchDate, setSearchDate] = useState('');
  const [searchRemark, setSearchRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, [user]);

  const handleCalculate = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const [balanceRes, allTxRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/analytics/net-balance/${selectedUser}`, config),
        axios.get('http://localhost:5000/api/transactions', config)
      ]);
      
      setNetBalanceInfo(balanceRes.data);
      
      // Filter global transactions locally to only include the specific user pair
      const pairTx = allTxRes.data.filter(tx => 
        (tx.sender._id === user._id && tx.receiver._id === selectedUser) ||
        (tx.receiver._id === user._id && tx.sender._id === selectedUser)
      );
      
      setTransactions(pairTx);
      setFilteredTransactions(pairTx);
    } catch (error) {
      console.error('Error calculating balance', error);
      alert('Failed to calculate. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    let result = transactions;

    if (searchDate) {
      result = result.filter(tx => {
        const txDateStr = new Date(tx.date).toISOString().split('T')[0];
        return txDateStr === searchDate;
      });
    }

    if (searchRemark) {
      result = result.filter(tx => 
        tx.note?.toLowerCase().includes(searchRemark.toLowerCase())
      );
    }

    setFilteredTransactions(result);
  }, [searchDate, searchRemark, transactions]);

  const handleExport = (formatType) => {
    window.open(`http://localhost:5000/api/exports/transactions/${formatType}?target=${selectedUser || 'all'}&token=${user.token}`, '_blank');
  };

  const handleSettleAll = async () => {
    if (!netBalanceInfo || netBalanceInfo.netBalance === 0) {
      return alert("Balances are already settled!");
    }
    
    // Suggest clearing transaction
    const amountToSettle = Math.abs(netBalanceInfo.netBalance);
    const receiver = netBalanceInfo.netBalance > 0 ? selectedUser : user._id; // If I owe them, they receive. Wait netBalance logic.
    // In our backend: totalGiven - totalReceived.
    // If netBalance > 0 (I gave more), they owe me. So I should be the receiver of the settlement.
    // Simple alert UI for the Smart Settlement logic
    alert(`Smart Settlement: The system suggests a one-time transaction of ₹${amountToSettle} to square up. (Action simulation)`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-3xl font-bold">User-Wise Balances</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleExport('pdf')}>
            <Download size={16} /> PDF
          </button>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleExport('excel')}>
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Target User Selector */}
      <div className="glass-card mb-6" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div className="flex-grow">
          <label className="input-label">Select User to Calculate Balance With</label>
          <select className="form-control" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            <option value="">-- Choose User --</option>
             {users.map(u => (
               <option key={u._id} value={u._id}>{u.username}</option>
             ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleCalculate} disabled={!selectedUser || loading}>
          Calculate
        </button>
      </div>

      {loading && <div>Fetching data...</div>}

      {netBalanceInfo && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <div className="text-muted mb-2 font-medium">You Gave Them</div>
              <div className="text-2xl font-bold text-danger">₹{netBalanceInfo.totalGiven}</div>
            </div>
            <div className="glass-card">
              <div className="text-muted mb-2 font-medium">You Received</div>
              <div className="text-2xl font-bold text-success">₹{netBalanceInfo.totalReceived}</div>
            </div>
            <div className="glass-card">
              <div className="text-muted mb-2 font-medium">Net Settlement</div>
              <div className={`text-2xl font-bold ${netBalanceInfo.netBalance > 0 ? 'text-success' : 'text-danger'}`}>
                {netBalanceInfo.message}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="font-bold flex items-center gap-2">
                Specific Transaction Ledger
              </h3>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleSettleAll}>
                <Handshake size={16} /> Settle Up Sync
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="flex-grow">
                <input type="date" className="form-control" value={searchDate} onChange={e => setSearchDate(e.target.value)} title="Search by Exact Date" />
              </div>
              <div className="flex-grow">
                <input type="text" className="form-control" placeholder="Search by Remark..." value={searchRemark} onChange={e => setSearchRemark(e.target.value)} />
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <p className="text-muted">No transactions found matching your criteria.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTransactions.map(tx => {
                   const isSender = tx.sender?._id === user._id;
                   return (
                    <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: `4px solid ${isSender ? 'var(--danger)' : 'var(--success)'}` }}>
                      <div>
                        <div className="font-bold">
                          {isSender ? `To: ${tx.receiver?.username || 'Deleted'}` : `From: ${tx.sender?.username || 'Deleted'}`}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                          {format(new Date(tx.date), 'MMM dd, yyyy')} • {tx.note || 'No remark'}
                        </div>
                      </div>
                      <div className={`font-bold text-xl ${isSender ? 'text-danger' : 'text-success'}`}>
                        {isSender ? '-' : '+'}₹{tx.amount}
                      </div>
                    </div>
                   );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserWiseBalances;
