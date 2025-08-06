"use client";

import { Button } from "@/components/ui/button";
import React, { useCallback, useRef, useState } from "react";

interface MonochromeToolProps {
  className?: string;
}

export const MonochromeTool: React.FC<MonochromeToolProps> = ({
  className = "",
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [invert, setInvert] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate brightness
      const brightness = (r + g + b) / 3;

      // Apply threshold
      const value = brightness > threshold ? 255 : 0;

      // Apply inversion if needed
      const finalValue = invert ? 255 - value : value;

      data[i] = finalValue; // Red
      data[i + 1] = finalValue; // Green
      data[i + 2] = finalValue; // Blue
      // Alpha stays the same
    }

    // Put processed image data back
    ctx.putImageData(imageData, 0, 0);
  }, [image, threshold, invert]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleExport = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = "monochrome-image.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleReturnHome = () => {
    window.location.href = "/";
  };

  // Process image when parameters change
  React.useEffect(() => {
    if (image) {
      processImage();
    }
  }, [image, threshold, invert, processImage]);

  return (
    <div className={`bg-black text-white p-8 font-dtm ${className}`}>
      {/* Return to Homepage Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={handleReturnHome}
          className="custom-file-upload text-sm"
        >
          ← Back to Home
        </Button>
      </div>

      <div className="max-w-4xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 font-dtm">Monochrome Tool</h1>
          <p className="text-gray-400 font-dtm">
            Convert images to black and white for use in the prophecy generator
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 font-dtm">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="custom-file-upload cursor-pointer block text-center"
              >
                Choose Image
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 font-dtm">
                Threshold: {threshold}
              </label>
              <input
                type="range"
                min="0"
                max="255"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="slider w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="invert"
                checked={invert}
                onChange={(e) => setInvert(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="invert" className="text-sm font-dtm">
                Invert Colors
              </label>
            </div>

            <Button
              onClick={handleExport}
              disabled={!image}
              className="w-full custom-file-upload"
            >
              Export PNG
            </Button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-96 border-2 border-white"
            />
          </div>
        </div>

        {/* Detailed Explanation Section */}
        <div className="mt-12 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium font-dtm">
              Why Use Monochrome Images?
            </h3>
            <div className="text-sm text-gray-300 space-y-2 leading-relaxed font-dtm">
              <p>
                <strong>Prophecy Generator Requirements:</strong> Our Deltarune
                Prophecy Generator is specifically designed to work with
                monochrome images. While color images will be automatically
                converted to grayscale, pre-converting to black and white
                ensures optimal results and perfect visual integration with the
                game's aesthetic.
              </p>
              <p>
                <strong>Better Processing Performance:</strong> Monochrome
                images process faster and more accurately in the prophecy
                generator. By adjusting the threshold, you can precisely control
                which parts become black or white, creating the perfect visual
                effect for your prophecies.
              </p>
              <p>
                <strong>Creative Tips:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 font-dtm">
                <li>Choose images with high contrast for best results</li>
                <li>Adjust threshold until you get clear outlines</li>
                <li>
                  Use the invert option to swap black and white relationships
                </li>
                <li>Export and use directly in the prophecy generator</li>
              </ul>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 font-dtm">
            <p>
              Upload an image and adjust the threshold to create a black and
              white version. Use the invert option to swap black and white.
              Export the result and use it in the prophecy generator.
            </p>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .font-dtm {
            font-family: 'DTMSans', sans-serif;
          }

          .custom-file-upload {
            display: inline-block;
            font-family: 'DTMSans', sans-serif;
            background-color: black;
            color: white;
            border: 2px solid white;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 0px;
            user-select: none;
            text-align: center;
            transition: all 0.2s ease;
          }

          .custom-file-upload:hover {
            background-color: #222;
            border-color: #fff;
          }

          .custom-file-upload:active {
            background-color: #111;
          }

          .slider {
            -webkit-appearance: none;
            appearance: none;
            height: 10px;
            background: transparent;
            margin: 0;
            border-radius: 0px;
            cursor: pointer;
          }

          .slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 0px;
          }

          .slider::-moz-range-track {
            width: 100%;
            height: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 0px;
          }

          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 15px;
            height: 15px;
            background: white;
            border: 0px;
            margin-top: -2px;
            cursor: pointer;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
          }

          .slider::-moz-range-thumb {
            width: 15px;
            height: 15px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
          }
        `,
        }}
      />
    </div>
  );
};
