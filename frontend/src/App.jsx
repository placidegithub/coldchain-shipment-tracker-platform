import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const PROXY_ADDRESS = "0x33F4a2E02975Fe83516d122F4DA807f71836aAA8";
const ABI = [
  "function updateStatus(uint256 _shipmentId, uint256 _currentTemp) public",
  "function shipmentTemperatures(uint256) public view returns (uint256)",
  "function temperatureThreshold() public view returns (uint256)"
];

function App() {
  const [currentTemp, setCurrentTemp] = useState('Loading...');
  const [inputTemp, setInputTemp] = useState(20);
  const [status, setStatus] = useState('Disconnected');

  // Fetch data on load
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/43BB0KpCnJSqwnBmX4EkO");
      const contract = new ethers.Contract(PROXY_ADDRESS, ABI, provider);
      const temp = await contract.shipmentTemperatures(1);
      setCurrentTemp(temp.toString());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  async function handleUpdate() {
    if (!window.ethereum) return alert("Install MetaMask!");
    
    try {
      setStatus('Waiting for Wallet...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PROXY_ADDRESS, ABI, signer);

      const tx = await contract.updateStatus(1, inputTemp);
      setStatus('Mining Transaction...');
      await tx.wait();
      
      setStatus('Success!');
      fetchData(); // Refresh display
    } catch (err) {
      setStatus('Reverted: ' + (err.reason || "Check Console"));
      console.error(err);
    }
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>🌡️ Vaccine Cold Chain Monitor</h1>
      
      <div style={{ border: '2px solid #444', padding: '20px', borderRadius: '15px', display: 'inline-block' }}>
        <h3>Current On-Chain Temp: <span style={{ color: Number(currentTemp) > 25 ? '#ff4d4d' : '#4dff88' }}>{currentTemp}°C</span></h3>
        <p>System Status: <strong>{status}</strong></p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <input 
          type="number" 
          value={inputTemp} 
          onChange={(e) => setInputTemp(e.target.value)} 
          style={{ padding: '10px', borderRadius: '5px', border: 'none', width: '80px' }}
        />
        <button onClick={handleUpdate} style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          Push to Blockchain
        </button>
      </div>
    </div>
  );
}

export default App;