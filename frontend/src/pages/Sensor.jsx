// Sensor.jsx - Enhanced with form validation and transaction handling
import React, { useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x33F4a2E02975Fe83516d122F4DA807f71836aAA8";
const ABI = [
  "function updateStatus(uint256 shipmentId, uint256 temp) public",
  "function shipmentTemperatures(uint256) public view returns (uint256)"
];

const Sensor = ({ setAccount }) => {
  const [tempInput, setTempInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('idle'); // idle, pending, success, error

  const validateTemperature = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, message: 'Please enter a valid number' };
    if (num < -50) return { valid: false, message: 'Temperature below -50°C is not realistic' };
    if (num > 100) return { valid: false, message: 'Temperature above 100°C is not realistic' };
    return { valid: true, value: num };
  };

  const getTemperatureAdvice = (value) => {
    const validation = validateTemperature(value);
    if (!validation.valid) return { message: validation.message, type: 'error' };
    const num = validation.value;
    if (num > 25) return { message: '⚠️ This will FAIL - exceeds 25°C safety threshold (good for Tenderly trace)', type: 'warning' };
    if (num > 20) return { message: '✅ Safe range - transaction will succeed', type: 'success' };
    if (num > 0) return { message: '✅ Optimal cold chain temperature', type: 'success' };
    return { message: 'ℹ️ Temperature is within acceptable range', type: 'info' };
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setTxHash('');
    setSuccess(false);
    setTransactionStatus('pending');

    const validation = validateTemperature(tempInput);
    if (!validation.valid) {
      setError(validation.message);
      setTransactionStatus('error');
      return;
    }

    if (!window.ethereum) {
      setError("Please install MetaMask to update the blockchain.");
      setTransactionStatus('error');
      return;
    }

    try {
      setLoading(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.updateStatus(1, tempInput);
      setTxHash(tx.hash);
      setTransactionStatus('pending');
      
      await tx.wait();
      setSuccess(true);
      setTransactionStatus('success');
      setLoading(false);
      setTempInput('');
      
      setTimeout(() => {
        setSuccess(false);
        setTransactionStatus('idle');
      }, 5000);

    } catch (err) {
      setLoading(false);
      console.error(err);
      setTransactionStatus('error');
      
      const tempValue = parseFloat(tempInput);
      if (tempValue > 25) {
        setError(`🚨 Transaction Rejected: Temperature exceeds safety threshold (25°C). 
                  This failed transaction can be traced in Tenderly for forensic debugging. 
                  
                  Error details: ${err.message || 'Contract revert - require condition failed'}`);
      } else {
        setError(`Transaction failed: ${err.message || 'Unknown error occurred'}`);
      }
    }
  };

  const advice = tempInput ? getTemperatureAdvice(tempInput) : null;

  return (
    <div>
      <div className="page-title">
        🌿 Sensor Simulation Control
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📡 Push Manual Temperature Reading</h3>
          <span className="badge-success">IoT Simulator</span>
        </div>
        
        <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Acting as an IoT Sensor, this form sends a signed transaction to the 
          Ethereum Sepolia network to update the immutable shipment log. 
          All transactions are permanently recorded on-chain.
        </p>

        <form onSubmit={handleUpdate}>
          <div className="input-group">
            <label className="input-label">Temperature (°C)</label>
            <input 
              type="number" 
              step="0.1"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              placeholder="e.g. 22.5"
              className="input-field"
              required
              disabled={loading}
              style={{
                borderColor: advice?.type === 'warning' ? '#F59E0B' : advice?.type === 'success' ? '#10B981' : undefined
              }}
            />
            {advice && (
              <p style={{ 
                fontSize: '0.75rem', 
                marginTop: '0.5rem', 
                color: advice.type === 'error' ? '#EF4444' : advice.type === 'warning' ? '#F59E0B' : '#10B981'
              }}>
                {advice.message}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? (
              <>⏳ Processing Transaction...</>
            ) : (
              <>🔗 Update Blockchain</>
            )}
          </button>
        </form>

        {/* Transaction Status */}
        {transactionStatus === 'pending' && !success && !error && (
          <div className="alert-success" style={{ background: '#FEF3C7', borderLeftColor: '#F59E0B' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⏳</span> Transaction submitted. Waiting for confirmation...
            </p>
            {txHash && (
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '0.5rem', display: 'inline-block' }}
              >
                🔍 View on Etherscan →
              </a>
            )}
          </div>
        )}

        {success && (
          <div className="alert-success">
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✅</span> Blockchain Updated Successfully!
            </p>
            {txHash && (
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '0.5rem', display: 'inline-block' }}
              >
                🔍 View Transaction Details →
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="alert-error">
            <p style={{ whiteSpace: 'pre-line', marginBottom: '0.5rem' }}>{error}</p>
            {error.includes('exceeds safety threshold') && (
              <button 
                className="btn-secondary" 
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                onClick={() => window.open('https://dashboard.tenderly.co/', '_blank')}
              >
                🔬 Open Tenderly for Forensic Trace
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guidance Card */}
      <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #F9FAFB, #FFFFFF)' }}>
        <h4 style={{ marginBottom: '1rem', color: '#1F2937', fontSize: '1rem' }}>📘 Submission Guidance</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ 
              background: '#D1FAE5', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span>✅</span>
            </div>
            <div>
              <strong style={{ color: '#065F46' }}>Success Case</strong>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Enter 15-25°C. Transaction will be mined and Dashboard will update automatically within seconds.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ 
              background: '#FEE2E2', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span>❌</span>
            </div>
            <div>
              <strong style={{ color: '#991B1B' }}>Failure Case (Audit Requirement)</strong>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Enter &gt;25°C (e.g., 30). Transaction reverts due to security check — perfect for generating 
                <strong> Tenderly trace</strong> for the Security Audit section (Category 4 fulfillment).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {window.ethereum && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F3F4F6', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
          🔌 MetaMask detected. Network: {window.ethereum.networkVersion === '11155111' ? 'Sepolia ✓' : 'Please switch to Sepolia'}
        </div>
      )}
    </div>
  );
};

export default Sensor;