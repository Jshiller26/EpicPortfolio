'use client';

import React, { useState, useRef, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import { Circle, Square, MinusCircle, Trash2, Download, Upload, RotateCcw } from 'lucide-react';

export default function Paint() {
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(3);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const canvasRef = useRef<CanvasDraw | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const colors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#00ffff", "#ff00ff", "#c0c0c0", "#808080", 
    "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"
  ];

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setCanvasWidth(container.clientWidth);
        setCanvasHeight(container.clientHeight - 80);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.getDataURL();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'paint-drawing.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !canvasRef.current) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) return;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image centered and scaled to fit
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          // Clear and load the new canvas
          canvasRef.current?.clear();
          canvasRef.current?.loadSaveData(JSON.stringify({
            lines: [],
            width: canvasWidth,
            height: canvasHeight
          }));
          
          const dataUrl = canvas.toDataURL();
          const backgroundImg = new Image();
          backgroundImg.src = dataUrl;
          backgroundImg.onload = () => {
            const drawingCanvas = canvasRef.current?.canvas.drawing;
            const ctx = drawingCanvas?.getContext('2d');
            if (ctx) {
              ctx.drawImage(backgroundImg, 0, 0);
            }
          };
        }
      };
      
      img.src = event.target.result as string;
    };
    
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset the input
  };

  return (
    <div className="flex flex-col h-full bg-gray-100" ref={containerRef}>
      <div className="p-2 border-b flex items-center bg-gray-200">
        <div className="flex space-x-2 mr-4">
          <button 
            onClick={handleUndo} 
            className="p-2 bg-white rounded hover:bg-gray-100"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={handleClear} 
            className="p-2 bg-white rounded hover:bg-gray-100"
            title="Clear canvas"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={handleSave} 
            className="p-2 bg-white rounded hover:bg-gray-100"
            title="Save drawing"
          >
            <Download size={16} />
          </button>
          <label 
            className="p-2 bg-white rounded hover:bg-gray-100 cursor-pointer"
            title="Load image"
          >
            <Upload size={16} />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleLoad}
            />
          </label>
        </div>
        
        <div className="border-l pl-2 mr-4 flex items-center">
          <span className="mr-2 text-sm">Brush size:</span>
          <button 
            onClick={() => setBrushRadius(Math.max(1, brushRadius - 1))}
            className="p-1 bg-white rounded hover:bg-gray-100 mr-1"
            title="Decrease brush size"
          >
            <MinusCircle size={16} />
          </button>
          <span className="text-sm mx-1">{brushRadius}</span>
          <button 
            onClick={() => setBrushRadius(Math.min(20, brushRadius + 1))}
            className="p-1 bg-white rounded hover:bg-gray-100 ml-1"
            title="Increase brush size"
          >
            <Circle size={16} />
          </button>
        </div>
        
        <div className="flex flex-wrap">
          {colors.map((color) => (
            <div
              key={color}
              className={`w-6 h-6 m-1 rounded-full cursor-pointer border ${
                brushColor === color ? 'border-black' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setBrushColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 bg-white overflow-hidden">
        <CanvasDraw
          ref={canvasRef}
          brushColor={brushColor}
          brushRadius={brushRadius}
          lazyRadius={0}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          hideGrid
          backgroundColor="#ffffff"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
