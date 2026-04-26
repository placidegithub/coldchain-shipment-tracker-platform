// Dashboard.jsx - Enhanced with real-time data fetching and improved UI
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x640e88bAf48B4Ad473b6404F405Df158F3fee660";
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/LlO5U390LUPfc3ovvoF6m";
const ABI = ["function shipmentTemperatures(uint256) public view returns (uint256)"];

const Dashboard = () => {
  const [temp, setTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchBlockchainData = async () => {
    try {
      setError(null);
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const currentTemp = await contract.shipmentTemperatures(1);
      setTemp(Number(currentTemp));
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch temperature data. Please check your connection.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (t) => {
    if (t === null) return { label: "LOADING", color: "#9CA3AF", bg: "#F3F4F6", icon: "⏳", message: "Fetching latest data..." };
    if (t > 39) return { label: "CRITICAL BREACH", color: "#EF4444", bg: "#FEE2E2", icon: "🚨", message: "Immediate Action Required: Temperature exceeds safety limits. Data reverted at contract level." };
    if (t > 25) return { label: "MODERATE WARNING", color: "#F59E0B", bg: "#FEF3C7", icon: "⚠️", message: "Warning: Temperature approaching V2 threshold. Review sensor calibration." };
    return { label: "OPTIMAL", color: "#10B981", bg: "#D1FAE5", icon: "✅", message: "Optimal cold chain maintained. All parameters within safe range." };
  };

  const status = getStatus(temp);
  const safeTemp = temp !== null ? temp : 0;

  const getTemperatureColor = () => {
    if (temp === null) return "#9CA3AF";
    if (temp > 39) return "#EF4444";
    if (temp > 25) return "#F59E0B";
    return "#10B981";
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    return lastUpdated.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div>
      <div className="page-title">
        📦 Live Shipment Tracking
      </div>
      
      <div className="grid-2">
        {/* Temperature Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌡️ Current Temperature</span>
            <span className="badge-success">Real-time</span>
          </div>
          <div className="temp-display" style={{ color: getTemperatureColor() }}>
            {isLoading ? '---' : `${safeTemp}°C`}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ 
              height: '8px', 
              background: '#E5E7EB', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${Math.min(100, (safeTemp / 50) * 100)}%`, 
                height: '100%', 
                background: `linear-gradient(90deg, ${getTemperatureColor()}, ${getTemperatureColor()})`,
                borderRadius: '4px'
              }} />
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.75rem' }}>
            Blockchain recorded value (Shipment ID #1)
          </p>
          {lastUpdated && (
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
              Last updated: {formatLastUpdated()}
              <span style={{ marginLeft: '0.5rem' }}>🔄 Auto-refresh every 10s</span>
            </p>
          )}
        </div>

        {/* Status Card */}
        <div className="card" style={{ borderLeft: `4px solid ${status.color}` }}>
          <div className="card-header">
            <span className="card-title">🔔 Network Status</span>
            {temp !== null && temp > 25 && (
              <span className="badge-warning">Action Required</span>
            )}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: status.bg,
            padding: '0.5rem 1.25rem',
            borderRadius: '2rem',
            color: status.color,
            fontWeight: 700,
            marginTop: '0.5rem'
          }}>
            <span style={{ fontSize: '1.1rem' }}>{status.icon}</span>
            <span>{status.label}</span>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5 }}>
            {status.message}
          </p>
          {temp !== null && temp > 25 && (
            <button 
              className="btn-secondary" 
              style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={() => window.location.href = '/audit'}
            >
              View Security Audit →
            </button>
          )}
        </div>
      </div>

      {/* Threshold Legend */}
      <div className="legend-container">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#10B981' }}></span>
          <span>0-25°C: Optimal</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#F59E0B' }}></span>
          <span>26-39°C: Moderate Warning</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#EF4444' }}></span>
          <span>&gt;39°C: Critical Breach</span>
        </div>
      </div>

      {/* Security Info Section */}
      <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #F0FDF4, #FFFFFF)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ 
            fontSize: '2rem',
            background: '#D1FAE5',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1rem'
          }}>
            🔒
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#065F46' }}>Immutable Record Protection</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5 }}>
              The smart contract implements <code>require(temp ≤ 25, "Temperature exceeds safety threshold!")</code>. 
              Blockchain immutability ensures that once data is recorded or rejected, it cannot be tampered with 
              by any party including drivers or logistics operators.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert-error" style={{ marginTop: '1rem' }}>
          <span>⚠️ </span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;