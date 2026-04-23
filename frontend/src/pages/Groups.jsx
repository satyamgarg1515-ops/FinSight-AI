import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, SplitSquareHorizontal } from 'lucide-react';

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // New Group Form
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // Split Expense Form
  const [targetGroupId, setTargetGroupId] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [splitNote, setSplitNote] = useState('');
  const [loading, setLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchBaseData = async () => {
    try {
      const [uRes, gRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/groups', config)
      ]);
      setUsers(uRes.data);
      setGroups(gRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  const handleMemberToggle = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/groups', { name: groupName, members: selectedMembers }, config);
      setGroupName('');
      setSelectedMembers([]);
      fetchBaseData();
      alert('Group Created!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating group');
    }
  };

  const handleSplitExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`http://localhost:5000/api/groups/${targetGroupId}/split`, { 
        totalAmount: Number(splitAmount), 
        note: splitNote 
      }, config);
      
      alert(data.message);
      setSplitAmount('');
      setSplitNote('');
      setTargetGroupId('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error splitting expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Users size={32} /> Group Splitting
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Create Group Panel */}
        <div className="glass-card">
          <h3 className="font-bold mb-4">1. Create a New Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="input-group">
              <label className="input-label">Group Name</label>
              <input type="text" className="form-control" placeholder="Goa Trip 2026" required value={groupName} onChange={e => setGroupName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label mb-2">Select Members</label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
                {users.map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="checkbox" id={u._id} checked={selectedMembers.includes(u._id)} onChange={() => handleMemberToggle(u._id)} />
                    <label htmlFor={u._id}>{u.username}</label>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" disabled={selectedMembers.length === 0}>Establish Group</button>
          </form>
        </div>

        {/* Split Expense Panel */}
        <div className="glass-card">
          <h3 className="font-bold mb-4 flex items-center gap-2"><SplitSquareHorizontal size={18}/> 2. Record Group Expense</h3>
          <p className="text-muted mb-4 text-sm">You paid the full bill. Automatically split the math perfectly among all group members simultaneously.</p>
          
          <form onSubmit={handleSplitExpense}>
            <div className="input-group">
              <label className="input-label">Select Group</label>
              <select className="form-control" required value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)}>
                <option value="">-- Choose Target Group --</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name} ({g.members.length} members)</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Total Amount You Paid (₹)</label>
              <input type="number" required className="form-control" min="0.01" step="0.01" value={splitAmount} onChange={e => setSplitAmount(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Reason / Item</label>
              <input type="text" className="form-control" placeholder="Dinner Bill" value={splitNote} onChange={e => setSplitNote(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>{loading ? 'Splitting...' : 'Split & Distribute Letgers'}</button>
          </form>
        </div>

        {/* My Groups Listing */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="font-bold mb-4">My Enrolled Groups</h3>
          {groups.length === 0 ? <p className="text-muted">You are not in any groups.</p> : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
               {groups.map(g => (
                 <div key={g._id} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                   <div className="font-bold mb-1">{g.name}</div>
                   <div className="text-muted text-sm mb-2">Created by: {g.createdBy?.username}</div>
                   <div>
                     <span className="text-xs font-semibold uppercase text-primary">Members ({g.members.length}): </span>
                     <span className="text-sm">{g.members.map(m=>m.username).join(', ')}</span>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Groups;
