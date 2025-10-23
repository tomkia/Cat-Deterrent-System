import React, { useState, useEffect, useRef } from 'react';
import { ScriptConfig } from '../types';

interface ControlPanelProps {
  initialConfig: ScriptConfig;
  isEditingZones: boolean;
  onConfigChange: (config: Partial<ScriptConfig>) => void;
  onServoCommand: (command: 'activate' | 'deactivate') => void;
  onShowEspSetup: () => void;
  onToggleZoneEditing: () => void;
  onShowBrokerConfig: () => void;
  onLoadConfig: (file: File) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    initialConfig, 
    isEditingZones,
    onConfigChange, 
    onServoCommand, 
    onShowEspSetup,
    onToggleZoneEditing,
    onShowBrokerConfig,
    onLoadConfig,
}) => {
  const [confidence, setConfidence] = useState(initialConfig.confidence);
  const [cooldown, setCooldown] = useState(initialConfig.cooldown);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConfidence(initialConfig.confidence);
    setCooldown(initialConfig.cooldown);
  }, [initialConfig]);

  const handleUpdateSettings = () => {
    onConfigChange({ confidence, cooldown });
  };
  
  const handleFileLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLoadConfig(file);
    }
  };


  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-4 border-b border-gray-700 pb-2">Detection Settings</h2>
        <div className="space-y-3">
           <button
            onClick={onToggleZoneEditing}
            className={`w-full font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 ${
              isEditingZones
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isEditingZones ? 'Finish Zone Editing' : 'Draw New Zones'}
          </button>
          <button
            onClick={handleFileLoadClick}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Load Zones from File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".json"
          />
          <div>
            <label htmlFor="confidence" className="block text-sm font-medium text-gray-300 mb-1">
              Confidence Threshold: <span className="font-bold text-white">{confidence.toFixed(2)}</span>
            </label>
            <input
              id="confidence"
              type="range"
              min="0.1"
              max="0.95"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="cooldown" className="block text-sm font-medium text-gray-300 mb-1">
              Activation Cooldown (seconds): <span className="font-bold text-white">{cooldown}s</span>
            </label>
            <input
              id="cooldown"
              type="range"
              min="1"
              max="60"
              step="1"
              value={cooldown}
              onChange={(e) => setCooldown(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <button
            onClick={handleUpdateSettings}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Update Script Settings
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-4 border-b border-gray-700 pb-2">Manual Servo Control</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => onServoCommand('activate')}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Activate
          </button>
          <button
            onClick={() => onServoCommand('deactivate')}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Deactivate
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-4 border-b border-gray-700 pb-2">Device & Connection</h2>
         <div className="space-y-3">
          <button
            onClick={onShowBrokerConfig}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Connection Settings
          </button>
          <button
            onClick={onShowEspSetup}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            ESP32 Wi-Fi Setup Guide
          </button>
         </div>
      </div>
    </div>
  );
};

export default ControlPanel;