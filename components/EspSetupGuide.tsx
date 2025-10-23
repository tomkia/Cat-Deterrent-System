import React from 'react';

interface EspSetupGuideProps {
  onClose: () => void;
}

const EspSetupGuide: React.FC<EspSetupGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">ESP32 Setup Guide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-gray-300 space-y-4">
          <p>
            To connect your ESP32 servo controller to your network, you'll need to use its one-time setup mode.
          </p>
          <ol className="list-decimal list-inside space-y-3 bg-gray-900/50 p-4 rounded-lg">
            <li>
              <strong>Power On:</strong> Connect your ESP32 to a power source. It will automatically create its own Wi-Fi network for configuration.
            </li>
            <li>
              <strong>Connect Your Phone/PC:</strong> On your phone or computer, look for a Wi-Fi network named <code className="bg-gray-700 px-2 py-1 rounded text-cyan-300">CatDetectorSetup</code> and connect to it (password: <code className="bg-gray-700 px-2 py-1 rounded text-cyan-300">password</code>).
            </li>
            <li>
              <strong>Captive Portal:</strong> A login or configuration page should open automatically. If it doesn't, open a web browser and navigate to <code className="bg-gray-700 px-2 py-1 rounded text-cyan-300">http://192.168.4.1</code>.
            </li>
            <li>
              <strong>Enter Credentials:</strong> On the setup page, enter your home Wi-Fi network name (SSID), password, and the IP address of your MQTT Broker.
            </li>
            <li>
              <strong>Save & Reboot:</strong> Click 'Save'. The ESP32 will save the settings, reboot, and automatically connect to your home network and the MQTT broker.
            </li>
          </ol>
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> This process only needs to be done once, or if you change your Wi-Fi password or MQTT broker address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EspSetupGuide;