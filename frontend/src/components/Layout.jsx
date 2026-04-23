// Layout.jsx - Enhanced with white/green theme, better sidebar, and wallet integration
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, account, onConnect }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', description: 'Live temperature monitoring' },
    { path: '/sensor', label: 'Sensor Control', icon: '🌡️', description: 'Submit temperature readings' },
    { path: '/audit', label: 'Audit & Security', icon: '🛡️', description: 'Security reports & analysis' }
  ];

  const getWalletDisplay = () => {
    if (account === 'Not Connected') {
      return (
        <>
          <span className="wallet-icon">🔌</span>
          <span>Connect Wallet</span>
        </>
      );
    }
    return (
      <>
        <span className="wallet-icon connected">✅</span>
        <span className="wallet-address">{account.slice(0, 6)}...{account.slice(-4)}</span>
        <span className="wallet-badge">Connected</span>
      </>
    );
  };

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">❄️</div>
          <div className="logo-content">
            <h1 className="logo-text">COLDCHAIN PRO</h1>
            <span className="logo-subtitle">Immutable Cold Logistics</span>
          </div>
        </div>

        <div className="header-controls">
          <div className="network-indicator">
            <span className="network-dot"></span>
            <span className="network-name">Sepolia Testnet</span>
            <span className="network-status">Live</span>
          </div>
          
          <button 
            className={`wallet-connect-btn ${account !== 'Not Connected' ? 'connected' : ''}`}
            onClick={onConnect}
          >
            {getWalletDisplay()}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="layout-body">
        {/* Sidebar Navigation */}
        <aside className="sidebar-nav">
          <div className="sidebar-header">
            <span className="sidebar-title">Navigation</span>
          </div>
          
          <nav className="nav-menu">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-icon-wrapper">
                    <span className="nav-icon">{item.icon}</span>
                    {isActive && <span className="nav-active-indicator"></span>}
                  </div>
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="system-status">
              <span className="status-dot"></span>
              <span>System Operational</span>
            </div>
            <div className="version-info">
              <span>v2.0.0</span>
              <span>Enterprise</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content-area">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-section">
          <span className="footer-icon">🔒</span>
          <span>Blockchain Secured</span>
        </div>
        <div className="footer-section">
          <span className="footer-icon">⚡</span>
          <span>Real-time Monitoring</span>
        </div>
        <div className="footer-section">
          <span className="footer-icon">📊</span>
          <span>24/7 Cold Chain Analytics</span>
        </div>
        <div className="footer-section">
          <span className="footer-icon">🛡️</span>
          <span>Audited Smart Contract</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;