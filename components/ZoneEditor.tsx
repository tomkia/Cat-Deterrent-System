import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Point, Zone, CropRegion } from '../types';

interface ZoneEditorProps {
  latestImage: string | null;
  initialZones: Zone[];
  cropRegion: CropRegion | null;
  onSave: (zones: Zone[]) => void;
  onCancel: () => void;
}

const ZoneEditor: React.FC<ZoneEditorProps> = ({ latestImage, initialZones, cropRegion, onSave, onCancel }) => {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    setZones(initialZones);
  }, [initialZones]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    if (!ctx || !canvas || !image) return;

    // Ensure canvas is the same size as the displayed image
    canvas.width = image.clientWidth;
    canvas.height = image.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = image.clientWidth / image.naturalWidth;
    const scaleY = image.clientHeight / image.naturalHeight;
    
    // Draw Crop Region if it exists
    if (cropRegion) {
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)'; // Orange for crop region
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(
            cropRegion.x * scaleX,
            cropRegion.y * scaleY,
            cropRegion.w * scaleX,
            cropRegion.h * scaleY
        );
        ctx.setLineDash([]); // Reset line dash
    }
    
    // Style for completed zones
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    
    zones.forEach(zone => {
      if (zone.length === 0) return;
      ctx.beginPath();
      const firstPoint = zone[0];
      ctx.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);
      for (let i = 1; i < zone.length; i++) {
        const point = zone[i];
        ctx.lineTo(point.x * scaleX, point.y * scaleY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Style for the zone currently being drawn
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 2;
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x * scaleX, currentPoints[0].y * scaleY);
      for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x * scaleX, currentPoints[i].y * scaleY);
      }
      ctx.stroke();
    }
  }, [zones, currentPoints, cropRegion]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || image.naturalWidth === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentPoints(prev => [...prev, { x: Math.round(x), y: Math.round(y) }]);
  };

  const handleFinishZone = () => {
    if (currentPoints.length < 3) {
        alert("A zone must have at least 3 points.");
        return;
    };
    setZones(prev => [...prev, currentPoints]);
    setCurrentPoints([]);
  };

  const handleUndo = () => {
    setCurrentPoints(prev => prev.slice(0, -1));
  };
  
  const handleClearAll = () => {
    setZones([]);
    setCurrentPoints([]);
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-4 flex flex-col">
      <div className="aspect-video bg-black rounded-lg w-full flex items-center justify-center overflow-hidden relative">
        {latestImage ? (
          <>
            <img
              ref={imageRef}
              src={`data:image/jpeg;base64,${latestImage}`}
              alt="Live Stream"
              className="w-full h-full object-contain"
              onLoad={draw} // Redraw when new image loads
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </>
        ) : (
          <div className="text-gray-400">Waiting for video stream...</div>
        )}
      </div>
      <div className="mt-4 bg-gray-900/50 rounded-lg p-3">
        <p className="text-center text-sm font-mono text-yellow-300 mb-3">
            Click on the image to add points for a new detection zone.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            <button onClick={handleFinishZone} disabled={currentPoints.length < 3} className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition">Finish Zone</button>
            <button onClick={handleUndo} disabled={currentPoints.length === 0} className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition">Undo Point</button>
            <button onClick={handleClearAll} disabled={zones.length === 0 && currentPoints.length === 0} className="bg-red-600 hover:bg-red-500 disabled:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition">Clear All</button>
            <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition">Cancel</button>
            <button onClick={() => onSave(zones)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-3 rounded-lg transition sm:col-span-1">Save Zones</button>
        </div>
      </div>
    </div>
  );
};

export default ZoneEditor;