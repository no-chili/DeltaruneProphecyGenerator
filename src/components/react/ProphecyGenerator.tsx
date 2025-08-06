"use client";

import React, { useCallback, useEffect, useState } from "react";
import { panelPresets } from "./data/panelPresets";
import { useProphecyAssets } from "./hooks/useProphecyAssets";
import { ProphecyCanvas } from "./ProphecyCanvas";
import { ProphecyControls } from "./ProphecyControls";

interface ProphecyGeneratorProps {
  className?: string;
}

export const ProphecyGenerator: React.FC<ProphecyGeneratorProps> = ({
  className = "",
}) => {
  // State
  const [text, setText] = useState("Your prophecy here");
  const [style, setStyle] = useState<"default" | "susie" | "final">("default");
  const [imageScale, setImageScale] = useState(1);
  const [imageYOffset, setImageYOffset] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [fontYOffset, setFontYOffset] = useState(0);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [customFont, setCustomFont] = useState<string>("ProphecyType");

  // Animation state
  const [ghostStarted, setGhostStarted] = useState(true);

  // Custom hooks
  const { assets, loadAssets } = useProphecyAssets(style);

  // Utility functions
  const getRandomPanel = useCallback(() => {
    const panelNames = Object.keys(panelPresets);
    const randomIndex = Math.floor(Math.random() * panelNames.length);
    return panelNames[randomIndex];
  }, []);

  const tryStartGhost = useCallback(() => {
    if (maskImage) {
      setGhostStarted(true);
    }
  }, [maskImage]);

  // Event handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setMaskImage(img);
      tryStartGhost();
    };
    img.src = URL.createObjectURL(file);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value || "Your prophecy here";
    setText(newText);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = event.target.value as "default" | "susie" | "final";
    setStyle(newStyle);
  };

  const handleImageScaleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImageScale(parseFloat(event.target.value));
  };

  const handleImageYOffsetChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImageYOffset(parseInt(event.target.value));
  };

  const handleFontScaleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFontScale(parseFloat(event.target.value));
  };

  const handleFontYOffsetChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFontYOffset(parseInt(event.target.value));
  };

  // Initialize with random panel
  const initializeRandomPanel = useCallback(() => {
    const randomPanelName = getRandomPanel();
    const randomPanel = panelPresets[randomPanelName];

    setStyle(randomPanel.style);
    setText(randomPanel.text);
    if (randomPanel.yOffset !== undefined) {
      setImageYOffset(randomPanel.yOffset);
    }

    // Load the corresponding image
    const defaultImg = new Image();
    defaultImg.onload = () => {
      setMaskImage(defaultImg);
      setGhostStarted(true); // Start ghost effect for default image
    };
    defaultImg.onerror = () => {
      console.error(
        `Failed to load image: /assets/base-panels/${randomPanelName}.png`
      );
      defaultImg.src = "/assets/base-panels/heroes-1.png";
    };
    defaultImg.src = `/assets/base-panels/${randomPanelName}.png`;
  }, [getRandomPanel]);

  useEffect(() => {
    initializeRandomPanel();
  }, [initializeRandomPanel]);

  // Load assets when style changes
  useEffect(() => {
    loadAssets();
  }, [style, loadAssets]);

  return (
    <div
      className={`min-h-screen sm:h-screen bg-gray-900 text-white flex flex-col sm:flex-row sm:overflow-hidden ${className}`}
    >
      {/* Generated Content */}
      <div className="sm:flex-1 flex items-center justify-center p-4 sm:p-8 order-1 sm:order-1">
        <div className="relative w-full max-w-sm sm:max-w-lg aspect-square">
          <ProphecyCanvas
            text={text}
            customFont={customFont}
            fontScale={fontScale}
            fontYOffset={fontYOffset}
            assets={assets}
            maskImage={maskImage}
            imageScale={imageScale}
            imageYOffset={imageYOffset}
            ghostStarted={ghostStarted}
            style={style}
          />
        </div>
      </div>

      {/* Controls and Instructions */}
      <div className="w-full sm:w-96 bg-gray-900 sm:border-l border-gray-700 flex flex-col sm:h-full order-2 sm:order-2">
        <ProphecyControls
          text={text}
          style={style}
          imageScale={imageScale}
          imageYOffset={imageYOffset}
          fontScale={fontScale}
          fontYOffset={fontYOffset}
          customFont={customFont}
          onTextChange={handleTextChange}
          onStyleChange={handleStyleChange}
          onImageUpload={handleImageUpload}
          onImageScaleChange={handleImageScaleChange}
          onImageYOffsetChange={handleImageYOffsetChange}
          onFontScaleChange={handleFontScaleChange}
          onFontYOffsetChange={handleFontYOffsetChange}
        />
      </div>
    </div>
  );
};
