import React, { useState } from 'react';

interface BrokerConfig {
  host: string;
  port: number;
}

interface BrokerConfigModalProps {
  currentConfig: BrokerConfig | null;
  onSave: (config: BrokerConfig) => void;
  onClose: () => void;
}

const BrokerConfigModal: React.FC<BrokerConfigModalProps> = ({ currentConfig, onSave, onClose }) => {
  const [host, setHost] = useState(currentConfig?.host || 'localhost');
  const [port, setPort] = useState(currentConfig?.port || 9001);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (host && port > 0) {
      onSave({ host, port });
    } else {
      alert("Please enter a valid host and port.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">Connection Settings</h2>
          {currentConfig && (
             <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          )}
        </div>
        <div className="text-gray-300 space-y-4">
            <p className="text-sm bg-gray-900/50 p-3 rounded-lg">
                When running with Docker, use <strong className="text-yellow-400">localhost</strong> for the host and the WebSocket port defined in <code className="bg-gray-700 p-1 rounded">docker-compose.yml</code>.
            </p>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label htmlFor="host" className="block text-sm font-medium text-gray-300 mb-1">
                        Broker Host IP or Address
                    </label>
                    <input
                        id="host"
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="e.g., localhost or 192.168.1.100"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="port" className="block text-sm font-medium text-gray-300 mb-1">
                        WebSocket Port (WS)
                    </label>
                    <input
                        id="port"
                        type="number"
                        value={port}
                        onChange={(e) => setPort(parseInt(e.target.value, 10))}
                        placeholder="e.g., 9001"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                    />
                </div>
                 <div className="text-xs text-gray-400">
                    <p>
                        The Docker setup uses an unsecure WebSocket connection (<code className="bg-gray-700 text-cyan-300 p-1 rounded">ws://</code>). The default port is <code className="bg-gray-700 text-cyan-300 p-1 rounded">9001</code>.
                    </p>
                 </div>
                 <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
                 >
                    Save and Reconnect
                 </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default BrokerConfigModal;
