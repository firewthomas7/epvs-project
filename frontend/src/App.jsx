import { useState, useEffect } from 'react'; // <--- This imports the Hooks!
import { QRCodeSVG } from 'qrcode.react';
import './App.css';

function App() {
  // 🧠 THESE ARE THE HOOKS (Your App's Memory)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [bankCode, setBankCode] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 🌙 Toggle Dark/Light Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  // 📥 Fetch List from Database
  const fetchTransactions = async () => {
    const res = await fetch('http://localhost:5000/transactions');
    const data = await res.json();
    setTransactions(data);
  };

  // 🔄 Load data automatically when logging in
  useEffect(() => { if (isLoggedIn) fetchTransactions(); }, [isLoggedIn]);

  // 🔑 Handle Sign Up & Sign In
  const handleAuth = async () => {
    const endpoint = isSignUp ? 'signup' : 'signin';
    const res = await fetch(`http://localhost:5000/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      if (isSignUp) { alert("Success! Now Sign In"); setIsSignUp(false); }
      else setIsLoggedIn(true);
    } else { alert("Error: Check your backend & DB"); }
  };

  // ✅ Verify & Save to DB
  const handleVerify = async () => {
    if (!bankCode) return alert("Enter a code!");
    await fetch('http://localhost:5000/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankCode })
    });
    setBankCode('');
    fetchTransactions();
  };

  // 🗑️ Delete from DB
  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      await fetch(`http://localhost:5000/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    }
  };

  // 🔍 Search Filter Logic
  const filteredData = transactions.filter(t => 
    t.bank_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- DASHBOARD VIEW ---
  if (isLoggedIn) {
    const totalETB = transactions.length * 500;
    return (
      <div className="epvs-container">
        <div className="banking-card">
          <div className="header">
            <h2>🏦 EPVS Dashboard</h2>
            <div style={{display:'flex', gap:'10px'}}>
              <button className="logout-btn" onClick={toggleDarkMode}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
              <button className="logout-btn" onClick={() => setIsLoggedIn(false)} style={{background:'#e74c3c'}}>Logout</button>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div style={{textAlign:'center'}}>
              <h3 style={{marginBottom:'15px'}}>Scan to Pay</h3>
              <div style={{padding:'20px', background:'white', borderRadius:'15px', display:'inline-block'}}>
                <QRCodeSVG value="ACC:1000123456789" size={150} />
              </div>
              <p style={{marginTop:'10px', fontSize:'14px', opacity: 0.7}}>Acc: 1000123456789 (CBE)</p>
            </div>
            <div>
              <h3>Verify Confirmation Code</h3>
              <input className="bank-input" placeholder="Enter Bank Code" value={bankCode} onChange={(e)=>setBankCode(e.target.value)} />
              <button className="verify-btn" onClick={handleVerify}>Verify & Save</button>
            </div>
          </div>

          <div style={{padding:'0 30px 30px'}}>
            <div className="total-banner">TOTAL SALES: {totalETB.toLocaleString()} ETB</div>
            
            <input 
              className="bank-input" 
              placeholder="🔍 Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{marginBottom: '15px'}}
            />

            <table className="history-table">
              <thead><tr><th>Reference</th><th>Amount</th><th>Action</th></tr></thead>
              <tbody>
                {filteredData.map(t => (
                  <tr key={t.id}>
                    <td>{t.bank_code}</td>
                    <td style={{color:'#28a745', fontWeight:'bold'}}>500 ETB</td>
                    <td><button onClick={() => handleDelete(t.id)} style={{color:'#e74c3c', border:'none', background:'none', cursor:'pointer'}}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIN VIEW ---
  return (
    <div className="epvs-container">
      <div className="banking-card" style={{maxWidth:'400px', padding:'40px', textAlign:'center'}}>
        <h1 style={{color:'#0052cc', marginBottom:'20px'}}>🇪🇹 EPVS</h1>
        <input className="bank-input" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input className="bank-input" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="verify-btn" style={{background:'#0052cc'}} onClick={handleAuth}>{isSignUp ? 'Create Account' : 'Sign In'}</button>
        <p style={{marginTop:'20px', cursor:'pointer', color:'#0052cc'}} onClick={()=>setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign In' : 'New Employee? Sign Up'}
        </p>
      </div>
    </div>
  );
}

export default App;
