import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [bankCode, setBankCode] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  const fetchTransactions = async () => {
    const res = await fetch('http://localhost:5000/transactions');
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => { if (isLoggedIn) fetchTransactions(); }, [isLoggedIn]);

  const handleAuth = async () => {
    const endpoint = isSignUp ? 'signup' : 'signin';
    const res = await fetch(`http://localhost:5000/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      if (isSignUp) setIsSignUp(false);
      else setIsLoggedIn(true);
    } else { alert("Auth Failed"); }
  };

  const handleVerify = async () => {
    await fetch('http://localhost:5000/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankCode })
    });
    setBankCode('');
    fetchTransactions();
  };

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
              <h3 style={{marginBottom:'15px'}}>Customer Scan Area</h3>
              <div style={{padding:'20px', background:'white', borderRadius:'15px', display:'inline-block'}}>
                <QRCodeSVG value="ACC:1000123456789" size={150} />
              </div>
              <p style={{marginTop:'10px', fontSize:'14px'}}>Acc: 1000123456789 (CBE)</p>
            </div>
            <div>
              <h3>Verify New Payment</h3>
              <input className="bank-input" placeholder="Bank Code" value={bankCode} onChange={(e)=>setBankCode(e.target.value)} />
              <button className="verify-btn" onClick={handleVerify}>Verify & Save</button>
            </div>
          </div>
          <div style={{padding:'0 30px 30px'}}>
            <div className="total-banner text-xl">TOTAL VERIFIED: {totalETB.toLocaleString()} ETB</div>
            <table className="history-table">
              <thead><tr><th>Code</th><th>Amount</th><th>Time</th></tr></thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.bank_code}</td>
                    <td style={{color:'#28a745', fontWeight:'bold'}}>500 ETB</td>
                    <td>{new Date(t.verified_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="epvs-container">
      <div className="banking-card" style={{maxWidth:'400px', padding:'40px', textAlign:'center'}}>
        <h1 style={{color:'#0052cc', marginBottom:'10px'}}>🇪🇹 EPVS</h1>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <input className="bank-input" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input className="bank-input" type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="verify-btn" style={{background:'#0052cc'}} onClick={handleAuth}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        <p style={{marginTop:'15px', cursor:'pointer', color:'#0052cc'}} onClick={()=>setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Have account? Sign In' : 'New? Sign Up'}
        </p>
      </div>
    </div>
  );
}

export default App;
