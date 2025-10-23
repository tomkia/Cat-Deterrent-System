import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoStream from './components/VideoStream';
import ControlPanel from './components/ControlPanel';
import EspSetupGuide from './components/EspSetupGuide';
import ZoneEditor from './components/ZoneEditor';
import BrokerConfigModal from './components/BrokerConfigModal';
import { ScriptConfig, ZoneConfig, Point } from './types';
import { useMqtt } from './hooks/useMqtt';

// Initial configuration values from the Python script
const INITIAL_CONFIG: ScriptConfig = {
  confidence: 0.55,
  cooldown: 10,
};

interface BrokerConfig {
  host: string;
  port: number;
}

const App: React.FC = () => {
  const [showEspSetup, setShowEspSetup] = useState(false);
  const [isEditingZones, setIsEditingZones] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [brokerConfig, setBrokerConfig] = useState<BrokerConfig | null>(null);
  const [zoneConfig, setZoneConfig] = useState<ZoneConfig>({ activation_areas: [], crop_region: null });

  useEffect(() => {
    // Load broker config from localStorage on initial load
    try {
      const savedConfig = localStorage.getItem('brokerConfig');
      if (savedConfig) {
        setBrokerConfig(JSON.parse(savedConfig));
      } else {
        setShowBrokerModal(true);
      }
    } catch (error) {
      console.error("Failed to load broker config from localStorage", error);
      setShowBrokerModal(true);
    }
  }, []);

  const { status, latestImage, detectionStatus, sendScriptConfig, sendServoCommand, sendZoneConfig } = useMqtt(brokerConfig?.host ?? null, brokerConfig?.port ?? null);

  const handleSaveBrokerConfig = (config: BrokerConfig) => {
    localStorage.setItem('brokerConfig', JSON.stringify(config));
    setBrokerConfig(config);
    setShowBrokerModal(false);
    window.location.reload();
  };
  
  const handleLoadConfig = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedConfig = JSON.parse(content);
        
        // Validate and transform the loaded config
        if (parsedConfig.activation_areas && Array.isArray(parsedConfig.activation_areas)) {
          const transformedZones: Point[][] = parsedConfig.activation_areas.map((zone: number[][]) => 
            zone.map((point: number[]) => ({ x: point[0], y: point[1] }))
          );
          
          const newConfig: ZoneConfig = {
            activation_areas: transformedZones,
            crop_region: parsedConfig.crop_region || null,
          };

          setZoneConfig(newConfig);
          // Also send this newly loaded config to the python script immediately
          sendZoneConfig(newConfig);
          // Open the editor to show the loaded zones
          setIsEditingZones(true); 
          alert("Configuration loaded successfully!");
        } else {
            throw new Error("Invalid config format: 'activation_areas' not found or not an array.");
        }
      } catch (error) {
        console.error("Error parsing config file:", error);
        alert(`Failed to load configuration file. Please ensure it's a valid JSON file. Error: ${error}`);
      }
    };
    reader.readAsText(file);
  };
  
  const mainContent = (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isEditingZones ? (
            <ZoneEditor 
              latestImage={latestImage}
              initialZones={zoneConfig.activation_areas}
              cropRegion={zoneConfig.crop_region}
              onSave={(zones) => {
                const newConfig = { ...zoneConfig, activation_areas: zones };
                setZoneConfig(newConfig);
                sendZoneConfig(newConfig);
                setIsEditingZones(false);
              }}
              onCancel={() => setIsEditingZones(false)}
            />
          ) : (
            <VideoStream latestImage={latestImage} detectionStatus={detectionStatus} />
          )}
        </div>
        <div className="lg:col-span-1">
          <ControlPanel
            initialConfig={INITIAL_CONFIG}
            isEditingZones={isEditingZones}
            onConfigChange={sendScriptConfig}
            onServoCommand={sendServoCommand}
            onShowEspSetup={() => setShowEspSetup(true)}
            onToggleZoneEditing={() => setIsEditingZones(!isEditingZones)}
            onShowBrokerConfig={() => setShowBrokerModal(true)}
            onLoadConfig={handleLoadConfig}
          />
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <Header mqttStatus={status} />
      
      <main className="container mx-auto mt-6">
        {brokerConfig ? mainContent : <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-xl">Please configure your MQTT broker connection to begin.</div>}
      </main>

      {showBrokerModal && <BrokerConfigModal currentConfig={brokerConfig} onSave={handleSaveBrokerConfig} onClose={() => setShowBrokerModal(false)} />}
      {showEspSetup && <EspSetupGuide onClose={() => setShowEspSetup(false)} />}

      <footer className="text-center text-gray-500 mt-8 text-sm">
        <p>Cat Detector Companion App | UI by Gemini</p>
      </footer>
    </div>
  );
};

export default App;