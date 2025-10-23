
import React from 'react';

interface VideoStreamProps {
  latestImage: string | null;
  detectionStatus: string;
}

const VideoStream: React.FC<VideoStreamProps> = ({ latestImage, detectionStatus }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-4 flex flex-col">
      <div className="aspect-video bg-black rounded-lg w-full flex items-center justify-center overflow-hidden relative">
        {latestImage ? (
          <img
            src={`data:image/jpeg;base64,${latestImage}`}
            alt="Live Stream"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a2 2 0 01.45 2.12l-2.4 7A2 2 0 0115.5 21H8.5a2 2 0 01-2-2v-7a2 2 0 012-2h4M10 3v4M14 3v4M6 8h12M4 21h16" />
            </svg>
            <p>Waiting for video stream...</p>
          </div>
        )}
      </div>
      <div className="mt-4 bg-gray-900/50 rounded-lg p-3 text-center">
        <p className="text-sm font-mono text-cyan-300 truncate" title={detectionStatus}>
          Status: {detectionStatus}
        </p>
      </div>
    </div>
  );
};

export default VideoStream;
