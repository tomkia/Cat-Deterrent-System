
import React from 'react';
import { MqttStatus } from '../types';

interface StatusIndicatorProps {
  status: MqttStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    [MqttStatus.Connected]: { color: 'bg-green-500', text: 'Connected' },
    [MqttStatus.Connecting]: { color: 'bg-yellow-500', text: 'Connecting' },
    [MqttStatus.Disconnected]: { color: 'bg-gray-500', text: 'Disconnected' },
    [MqttStatus.Error]: { color: 'bg-red-500', text: 'Error' },
  };

  const { color, text } = statusConfig[status];

  return (
    <div className="flex items-center space-x-2">
      <span className={`h-3 w-3 rounded-full ${color} animate-pulse`}></span>
      <span className="text-sm font-medium text-gray-300">{text}</span>
    </div>
  );
};


interface HeaderProps {
    mqttStatus: MqttStatus;
}

const Header: React.FC<HeaderProps> = ({ mqttStatus }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg rounded-b-xl sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-cyan-400">
          <span role="img" aria-label="cat icon" className="mr-2">🐾</span>
          Cat Detector Companion
        </h1>
        <StatusIndicator status={mqttStatus} />
      </div>
    </header>
  );
};

export default Header;
