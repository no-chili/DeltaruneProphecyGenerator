import { SITE_EMAIL, SITE_NAME } from "@/var";
import React from "react";

interface ProphecyControlsProps {
  text: string;
  style: "default" | "susie" | "final";
  imageScale: number;
  imageYOffset: number;
  fontScale: number;
  fontYOffset: number;
  customFont: string;
  onTextChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onStyleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageScaleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageYOffsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFontScaleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFontYOffsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProphecyControls: React.FC<ProphecyControlsProps> = ({
  text,
  style,
  imageScale,
  imageYOffset,
  fontScale,
  fontYOffset,
  customFont,
  onTextChange,
  onStyleChange,
  onImageUpload,
  onImageScaleChange,
  onImageYOffsetChange,
  onFontScaleChange,
  onFontYOffsetChange,
}) => {
  return (
    <div className="sm:flex-1 sm:overflow-y-auto p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold mb-2">{SITE_NAME}</h1>
          <p className="text-sm text-gray-400">
            Create your own prophecy panels
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="imgInput"
              className="custom-file-upload cursor-pointer block text-center"
            >
              Upload Monochrome Image
            </label>
            <input
              type="file"
              id="imgInput"
              accept="image/*"
              className="hidden"
              onChange={onImageUpload}
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              If your image isn't monochrome, you can make it so{" "}
              <a href="/monochrome" className="text-blue-400 hover:underline">
                here
              </a>
              .
            </p>
          </div>

          <div>
            <label
              htmlFor="textInput"
              className="block text-sm font-medium mb-2"
            >
              Prophecy Text
            </label>
            <textarea
              id="textInput"
              value={text}
              onChange={onTextChange}
              placeholder="Enter prophecy text"
              rows={2}
              className="text-input w-full resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="styleSelect"
              className="block text-sm font-medium mb-2"
            >
              Style
            </label>
            <select
              id="styleSelect"
              value={style}
              onChange={onStyleChange}
              className="style-select w-full"
            >
              <option value="default">Default</option>
              <option value="susie">Susie's Dark World</option>
              <option value="final">The Final Prophecy</option>
            </select>
          </div>
        </div>

        {/* Image Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Image Controls</h3>

          <div>
            <label htmlFor="imgScale" className="block text-sm mb-2">
              Image Scale: {imageScale.toFixed(2)}×
            </label>
            <input
              type="range"
              id="imgScale"
              min="0.1"
              max="3"
              value={imageScale}
              step="0.01"
              onChange={onImageScaleChange}
              className="slider w-full"
            />
          </div>

          <div>
            <label htmlFor="imgYOffset" className="block text-sm mb-2">
              Image Y Offset: {imageYOffset}px
            </label>
            <input
              type="range"
              id="imgYOffset"
              min="-100"
              max="100"
              value={imageYOffset}
              onChange={onImageYOffsetChange}
              className="slider w-full"
            />
          </div>
        </div>

        {/* Text Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Text Controls</h3>

          <div>
            <label htmlFor="fontScale" className="block text-sm mb-2">
              Font Scale: {fontScale.toFixed(2)}×
            </label>
            <input
              type="range"
              id="fontScale"
              min="0.5"
              max="2"
              step="0.05"
              value={fontScale}
              onChange={onFontScaleChange}
              className="slider w-full"
            />
          </div>

          <div>
            <label htmlFor="fontYOffset" className="block text-sm mb-2">
              Font Y Offset: {fontYOffset}px
            </label>
            <input
              type="range"
              id="fontYOffset"
              min="-100"
              max="100"
              value={fontYOffset}
              onChange={onFontYOffsetChange}
              className="slider w-full"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            How to Create Your Deltarune Prophecy Panel
          </h3>
          <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
            <p>
              1. <strong>Upload Symbol:</strong> Choose a monochrome (black &
              white) symbol to represent your prophecy
            </p>
            <p>
              2. <strong>Enter Text:</strong> Type your prophecy message. You
              can use line breaks by pressing enter.
            </p>
            <p>
              3. <strong>Select Style:</strong> Pick from Classic Prophecy, Dark
              World, or Final Prophecy themes
            </p>
            <p>
              4. <strong>Adjust Settings:</strong> Fine-tune symbol scale and
              position for perfect placement
            </p>
            <p>
              5. <strong>Export:</strong> Download your creation as PNG or
              animated GIF
            </p>
            <p>
              Need to convert your symbol to monochrome? Use our{" "}
              <a href="/monochrome" className="text-blue-400 hover:underline">
                monochrome converter
              </a>{" "}
              to prepare your symbol.
            </p>
            <p className="text-gray-400">
              💡 For best results, use high-contrast black and white symbols.
              Our generator works beautifully with silhouettes, symbols, and
              monochrome artwork to create professional-quality prophecy panels.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Frequently Asked Questions</h3>
          <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
            <p>
              <strong>Q: What is Deltarune Prophecy Generator?</strong>
              <br />
              A: A tool to create prophecy panels inspired by Deltarune's
              mysterious prophecy sequences. Upload images, add text, and
              generate professional-looking prophecy panels.
            </p>
            <p>
              <strong>Q: Why isn't my symbol displaying correctly?</strong>
              <br />
              A: Make sure you're uploading a white-only or black and white
              symbol. Colored symbols may not display properly.
            </p>
            <p>
              <strong>Q: How do I adjust text position?</strong>
              <br />
              A: Use the "Font Y Offset" slider in the "Text Controls" section
              to move the text up or down.
            </p>
            <p>
              <strong>Q: Can I adjust the symbol size?</strong>
              <br />
              A: Yes, use the "Image Scale" slider in the "Image Controls"
              section to adjust the symbol size.
            </p>
            <p>
              <strong>Q: What file formats are supported?</strong>
              <br />
              A: Common file formats like PNG, JPG, GIF, etc. are supported.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-700">
          <div className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="text-gray-400 text-sm">
                <div className="flex items-center mb-3">
                  <img
                    src="/logo.png"
                    alt="Deltarune Prophecy"
                    className="h-6 w-6 mr-2"
                  />
                  <span className="text-lg font-bold text-white">
                    {SITE_NAME}
                  </span>
                </div>
                <div className="text-xs">
                  © 2025 Deltarune Prophecy. All rights reserved.
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white text-xs cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white text-xs cursor-pointer"
                >
                  Terms of Service
                </a>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="text-gray-400 hover:text-white text-xs cursor-pointer"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-file-upload {
            display: inline-block;
            font-family: 'DTMSans', sans-serif;
            background-color: black;
            color: white;
            border: 2px solid white;
            padding: 5px 10px;
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

          .custom-file-upload.small {
            padding: 3px 6px;
            font-size: 12px;
            margin-top: 4px;
          }

          .text-input {
            font-family: 'DTMSans', sans-serif;
            background-color: black;
            color: white;
            border: 2px solid white;
            padding: 5px 10px;
            outline: none;
            border-radius: 0px;
            box-sizing: border-box;
          }

          .text-input:focus {
            outline: none;
            border-color: #fff;
            box-shadow: 0 0 5px white;
          }

          textarea.text-input {
            min-height: 60px;
            line-height: 1.4;
          }

          .style-select {
            font-family: 'DTMSans', sans-serif;
            background-color: black;
            color: white;
            border: 2px solid white;
            padding: 5px 10px;
            border-radius: 0;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            text-align: center;
          }

          .style-select:hover {
            background-color: #222;
            border-color: #fff;
          }

          .style-select:focus {
            outline: none;
            border-color: #fff;
            box-shadow: 0 0 5px white;
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

          .preview-box {
            width: 96px;
            height: 96px;
            border: 2px solid white;
            background-color: #111;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 36px;
            margin-bottom: 8px;
            image-rendering: pixelated;
            object-fit: contain;
            overflow: hidden;
          }

          .file-label {
            font-family: 'DTMSans', sans-serif;
            font-size: 12px;
            margin-bottom: 4px;
            color: white;
          }
        `,
        }}
      />
    </div>
  );
};
