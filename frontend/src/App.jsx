import { useState, useEffect } from 'react'; 
import { QRCodeSVG } from 'qrcode.react';
import './App.css';


function App() {
  // Authentication State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  // Payment Verification State
  const [bankCode, setBankCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // --- 1. Fetch History from Database ---
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  // Load history automatically when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchTransactions();
    }
  }, [isLoggedIn]);

  // --- 2. Handle Login / Signup ---
  const handleAuth = async () => {
    const endpoint = isSignUp ? 'signup' : 'signin';
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        if (isSignUp) {
          alert("Account Created! Please Sign In.");
          setIsSignUp(false);
        } else {
          setIsLoggedIn(true);
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Backend error: Is your server running?");
    }
  };

  // --- 3. Handle Payment Verification ---
  const handleVerify = async () => {
    if (bankCode.length < 5) return alert("Please enter a valid bank code!");

    try {
      const response = await fetch('http://localhost:5000/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode })
      });

      if (response.ok) {
        setVerificationStatus('SUCCESS');
        setBankCode(''); // Clear input
        fetchTransactions(); // Refresh the list
      } else {
        setVerificationStatus('FAILED');
      }
    } catch (err) {
      alert("Error saving transaction");
    }
  };

  // --- DASHBOARD UI ---
  if (isLoggedIn) {
    return (
      <div className="epvs-container">
        <div className="banking-card">
          <div className="header">
            <h2 className="flex items-center gap-2">🏦 EPVS Dashboard</h2>
            <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>
          
          <div className="dashboard-grid">
            {/* Left Side: QR Code */}
            <div className="qr-section">
              <h3 className="text-gray-600 mb-4">Customer Scan Area</h3>
              <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '15px', display: 'inline-block', border: '2px solid #eee' }}>
                <QRCodeSVG value="ACC:1000123456789" size={180} />
              </div>
              <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Acc: 1000123456789 (CBE)</p>
            </div>

            {/* Right Side: Verification Input */}
            <div className="verify-section">
              <h3>Verify New Payment</h3>
              <input 
                className="bank-input" 
                placeholder="Enter Bank Confirmation Code"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
              />
              <button className="verify-btn" onClick={handleVerify}>Verify & Save</button>
              
              {verificationStatus && (
                <div style={{ 
                  marginTop: '15px', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold',
                  backgroundColor: verificationStatus === 'SUCCESS' ? '#d4edda' : '#f8d7da',
                  color: verificationStatus === 'SUCCESS' ? '#155724' : '#721c24'
                }}>
                  {verificationStatus === 'SUCCESS' ? '✅ VERIFIED: 500 ETB' : '❌ INVALID CODE'}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Side: History Table */}
          <div style={{ padding: '0 40px 40px 40px' }}>
            <h3 style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '15px', color: '#333' }}>Recent Verification History</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#888', fontSize: '14px' }}>
                    <th style={{ padding: '10px' }}>Bank Reference</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '14px' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.bank_code}</td>
                      <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold' }}>500.00 ETB</td>
                      <td style={{ padding: '10px', color: '#999' }}>
                        {new Date(t.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No payments verified yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIN / SIGNUP UI ---
  return (
    <div className="epvs-container">
      <div className="auth-card">
        <h1 style={{ color: '#0052cc', marginBottom: '10px' }}>🇪🇹 EPVS</h1>
        <h2>{isSignUp ? 'Create Employee Account' : 'Employee Sign In'}</h2>
        <input className="bank-input" type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
        <input className="bank-input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="verify-btn" style={{ background: '#0052cc' }} onClick={handleAuth}>
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <p className="toggle-text" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}

export default App;
