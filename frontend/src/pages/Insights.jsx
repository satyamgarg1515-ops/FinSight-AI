import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BrainCircuit, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57'];

const Insights = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/transactions', config);
        setTransactions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  // Process data for charts
  const { categoryData, monthlyData, insightsText } = useMemo(() => {
    if (transactions.length === 0) return { categoryData: [], monthlyData: [], insightsText: [] };

    let totalSpent = 0;
    const catMap = {};
    const monthMap = {};

    transactions.forEach(tx => {
      // Only care about money going OUT for category spending analysis
      if (tx.sender?._id === user._id) {
        totalSpent += tx.amount;
        const cat = tx.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + tx.amount;

        const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthMap[month] = (monthMap[month] || 0) + tx.amount;
      }
    });

    const cData = Object.keys(catMap).map(key => ({ name: key, value: catMap[key] }));
    cData.sort((a,b) => b.value - a.value);

    // Formulate basic AI Insights
    const texts = [];
    if (cData.length > 0) {
      const topCat = cData[0];
      const percentage = Math.round((topCat.value / totalSpent) * 100);
      texts.push(`You spend most heavily on ${topCat.name}, representing ${percentage}% of your total outgoing funds.`);
    }
    
    if (totalSpent > 10000) {
      texts.push("High volume spending detected. Consider reviewing subscriptions and redundant expenses.");
    }

    const mData = Object.keys(monthMap).map(key => ({ name: key, amount: monthMap[key] })).reverse(); // Assuming descending fetch

    return { categoryData: cData, monthlyData: mData, insightsText: texts };
  }, [transactions, user]);

  if (loading) return <div>Analyzing Data...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BrainCircuit size={32} /> Graphical AI Insights
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Text Insights */}
          <div className="glass-card">
            <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} /> Smart Analysis</h3>
            {insightsText.length === 0 ? <p className="text-muted">Not enough data to analyze yet.</p> : (
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {insightsText.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Category Pie */}
          <div className="glass-card" style={{ height: '350px' }}>
            <h3 className="font-bold mb-2">Spending by Category</h3>
            {categoryData.length === 0 ? <p className="text-muted">No outgoing transactions to chart.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Timeline Graph */}
        <div className="glass-card" style={{ height: '500px' }}>
            <h3 className="font-bold mb-4">Monthly Expenditure (Outflow)</h3>
            {monthlyData.length === 0 ? <p className="text-muted">No data available.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="var(--text-color)" />
                  <YAxis stroke="var(--text-color)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
                  <Bar dataKey="amount" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

      </div>
    </div>
  );
};

export default Insights;
