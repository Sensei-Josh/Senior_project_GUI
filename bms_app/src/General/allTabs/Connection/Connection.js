import React, { useState, useEffect } from "react";

const Connection = () => {
  const [comPorts, setComPorts] = useState(["COM1", "COM2", "COM3", "COM4"]); // List of available COM ports
  const [selectedComPort, setSelectedComPort] = useState("COM4"); // Default selected COM port
  const [currentComPort, setCurrentComPort] = useState("COM4"); // Current COM port on the server

  useEffect(() => {
    // Fetch the current COM port from the server on component mount
    fetch("http://localhost:8000/currentcomport")
      .then(response => response.text())
      .then(data => setCurrentComPort(data))
      .catch(error => console.error('Error fetching current COM port:', error));
  }, []); // Empty dependency array to run the effect once on mount

  const handleSelectChange = (e) => {
    setSelectedComPort(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Assuming your API endpoint for setting the COM port is /setcomport
    fetch(`http://localhost:8000/setcomport?port=${selectedComPort}`, {
      method: 'GET',
    })
      .then(response => response.text())
      .then(data => {
        setCurrentComPort(data);
      })
      .catch(error => console.error('Error setting COM port:', error));
  };

  return (
    <div className="Connect">
      <p>Second Tab!! Hurray!!</p>
      {/* Second tab content will go here */}
      <form onSubmit={handleSubmit}>
        <label>
          Select COM Port:
          <select value={selectedComPort} onChange={handleSelectChange}>
            {comPorts.map(port => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
        </label>
        <button type="submit">Set COM Port</button>
      </form>

      <p>Current COM Port: {currentComPort}</p>
    </div>
  );
};

export default Connection;
