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
    return { label: "OPTIMAL", color: "#A855F7", bg: "#F3E8FF", icon: "✅", message: "Optimal cold chain maintained. All parameters within safe range." };
  };

  const status = getStatus(temp);
  const safeTemp = temp !== null ? temp : 0;

  const getTemperatureColor = () => {
    if (temp === null) return "#9CA3AF";
    if (temp > 39) return "#EF4444";
    if (temp > 25) return "#F59E0B";
    return "#A855F7";
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
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-kicker">Cold Chain Intelligence</p>
          <div className="page-title dashboard-title">
            📦 Live Shipment Tracking
          </div>
          <p className="dashboard-subtitle">
            A polished real-time view of shipment temperature, chain status, and safety threshold signals.
          </p>
        </div>

        <div className="dashboard-metrics">
          <div className="dashboard-metric metric-temp">
            <span className="dashboard-metric-label">Current Temperature</span>
            <strong style={{ color: getTemperatureColor() }}>{isLoading ? '---' : `${safeTemp}°C`}</strong>
          </div>
          <div className="dashboard-metric metric-status">
            <span className="dashboard-metric-label">Status</span>
            <strong>{status.label}</strong>
          </div>
          <div className="dashboard-metric metric-update">
            <span className="dashboard-metric-label">Last Updated</span>
            <strong>{lastUpdated ? formatLastUpdated() : 'Waiting...'}</strong>
          </div>
        </div>
      </div>

      <div className="grid-2 dashboard-grid">
        <div className="card dashboard-card dashboard-card-temperature">
          <div className="card-header">
            <span className="card-title">🌡️ Current Temperature</span>
            <span className="badge-success">Real-time</span>
          </div>
          <div className="temp-display dashboard-temp-display" style={{ color: getTemperatureColor() }}>
            {isLoading ? '---' : `${safeTemp}°C`}
          </div>
          <div className="dashboard-progress-shell">
            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill"
                style={{
                  width: `${Math.min(100, (safeTemp / 50) * 100)}%`,
                  background: `linear-gradient(90deg, ${getTemperatureColor()}, #8B5CF6)`
                }}
              />
            </div>
          </div>
          <p className="dashboard-caption">
            Blockchain recorded value for Shipment ID #1.
          </p>
          {lastUpdated && (
            <p className="dashboard-meta">
              Last updated: {formatLastUpdated()}
              <span className="dashboard-refresh">🔄 Auto-refresh every 10s</span>
            </p>
          )}
        </div>

        <div className="card dashboard-card dashboard-card-status" style={{ borderLeft: `4px solid ${status.color}` }}>
          <div className="card-header">
            <span className="card-title">🔔 Network Status</span>
            {temp !== null && temp > 25 && (
              <span className="badge-warning">Action Required</span>
            )}
          </div>
          <div className="dashboard-status-pill" style={{ background: status.bg, color: status.color }}>
            <span className="dashboard-status-icon">{status.icon}</span>
            <span>{status.label}</span>
          </div>
          <p className="dashboard-status-copy">
            {status.message}
          </p>
          {temp !== null && temp > 25 && (
            <button 
              className="btn-secondary dashboard-audit-btn"
              onClick={() => window.location.href = '/audit'}
            >
              View Security Audit →
            </button>
          )}
        </div>
      </div>

      <div className="legend-container dashboard-legend">
        <div className="legend-item dashboard-legend-item">
          <span className="legend-dot" style={{ background: 'linear-gradient(135deg, #A855F7, #D946EF)' }}></span>
          <span>0-25°C: Optimal</span>
        </div>
        <div className="legend-item dashboard-legend-item">
          <span className="legend-dot" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}></span>
          <span>26-39°C: Moderate Warning</span>
        </div>
        <div className="legend-item dashboard-legend-item">
          <span className="legend-dot" style={{ background: 'linear-gradient(135deg, #EF4444, #EC4899)' }}></span>
          <span>&gt;39°C: Critical Breach</span>
        </div>
      </div>

      <div className="card dashboard-info-card" style={{ marginTop: '1.5rem' }}>
        <div className="dashboard-info-layout">
          <div className="dashboard-info-icon">
            🔒
          </div>
          <div className="dashboard-info-copy">
            <h3>Immutable Record Protection</h3>
            <p>
              The smart contract implements <code>require(temp ≤ 25, "Temperature exceeds safety threshold!")</code>. 
              Blockchain immutability ensures that once data is recorded or rejected, it cannot be tampered with 
              by any party including drivers or logistics operators.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-error dashboard-error" style={{ marginTop: '1rem' }}>
          <span>⚠️ </span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;