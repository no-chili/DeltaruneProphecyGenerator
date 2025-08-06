import GIF from "gif.js";
import React, { useCallback, useEffect, useRef } from "react";

interface ProphecyCanvasProps {
  text: string;
  customFont: string;
  fontScale: number;
  fontYOffset: number;
  assets: {
    placeholder: HTMLImageElement | null;
    placeholderRed: HTMLImageElement | null;
    backgroundTile: HTMLImageElement | null;
    backgroundTileRed: HTMLImageElement | null;
  };
  maskImage: HTMLImageElement | null;
  imageScale: number;
  imageYOffset: number;
  ghostStarted: boolean;
  style: "default" | "susie" | "final";
}

export const ProphecyCanvas: React.FC<ProphecyCanvasProps> = ({
  text,
  customFont,
  fontScale,
  fontYOffset,
  assets,
  maskImage,
  imageScale,
  imageYOffset,
  ghostStarted,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Animation state
  const scrollOffsetRef = useRef(0);
  const backgroundScrollOffsetRef = useRef(0);
  const ghostAnimationTimeRef = useRef(0);
  const floatOffsetRef = useRef(0);

  const canvasSize = 512;

  // Ghost animation function with pause effect
  const getGhostOffset = useCallback((time: number, multiplier: number = 1) => {
    // Create a smoother animation cycle: out -> back -> pause -> out (opposite) -> back -> pause
    const cycleDuration = 8.0; // Total cycle duration in seconds (increased to accommodate two pauses)
    const pauseDuration = 2.0; // Pause duration in seconds
    const moveDuration = (cycleDuration - pauseDuration * 2) / 2; // Time for each movement phase

    const cycleTime = time % cycleDuration;

    // Calculate which part of the cycle we're in
    if (cycleTime < moveDuration) {
      // First movement: going out from center and back
      const progress = cycleTime / moveDuration;
      // Use a smoother curve that goes from 0 to max to 0
      return Math.sin(progress * Math.PI) * 6 * multiplier;
    } else if (cycleTime < moveDuration + pauseDuration) {
      // First pause at center
      return 0;
    } else if (cycleTime < moveDuration * 2 + pauseDuration) {
      // Second movement: going out in opposite direction and back
      const progress =
        (cycleTime - moveDuration - pauseDuration) / moveDuration;
      // Use a smoother curve that goes from 0 to -max to 0
      return -Math.sin(progress * Math.PI) * 6 * multiplier;
    } else {
      // Second pause at center
      return 0;
    }
  }, []);

  // Download functions
  const downloadPNG = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "prophecy.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // Create result canvas with texture scrolling
  const createResultCanvas = useCallback(
    (placeholderTexture: HTMLImageElement, size: number) => {
      if (!maskImage || !placeholderTexture) return null;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return null;
      tempCtx.imageSmoothingEnabled = false;

      const offset = scrollOffsetRef.current % placeholderTexture.width;

      // Draw scrolling texture
      for (
        let y = -offset;
        y < size + placeholderTexture.height;
        y += placeholderTexture.height
      ) {
        for (
          let x = -offset;
          x < size + placeholderTexture.width;
          x += placeholderTexture.width
        ) {
          tempCtx.drawImage(placeholderTexture, x, y);
        }
      }

      // Create mask from image
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = maskCanvas.height = size;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) return null;
      maskCtx.clearRect(0, 0, size, size);
      maskCtx.imageSmoothingEnabled = false;

      // Calculate image position and size
      const scale = Math.min(size / maskImage.width, size / maskImage.height);
      const dw = maskImage.width * scale;
      const dh = maskImage.height * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;

      maskCtx.drawImage(maskImage, dx, dy, dw, dh);

      // Apply mask using pixel manipulation
      const maskData = maskCtx.getImageData(0, 0, size, size);
      const texData = tempCtx.getImageData(0, 0, size, size);
      const result = tempCtx.createImageData(size, size);

      for (let i = 0; i < maskData.data.length; i += 4) {
        const r = maskData.data[i];
        const g = maskData.data[i + 1];
        const b = maskData.data[i + 2];
        const a = maskData.data[i + 3];
        const brightness = (r + g + b) / 3;

        if (brightness > 200 && a > 0) {
          result.data[i] = texData.data[i];
          result.data[i + 1] = texData.data[i + 1];
          result.data[i + 2] = texData.data[i + 2];
          result.data[i + 3] = 255;
        } else {
          result.data[i + 3] = 0;
        }
      }

      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = resultCanvas.height = size;
      const resultCtx = resultCanvas.getContext("2d");
      if (resultCtx) {
        resultCtx.putImageData(result, 0, 0);
      }
      return resultCanvas;
    },
    [maskImage]
  );

  // Download GIF function
  const downloadGIF = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create GIF instance
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvasSize,
      height: canvasSize,
      workerScript: "/gif.worker.js",
    });

    // Capture 80 frames but only use even frames (40 frames total) for more dramatic changes
    const totalFrames = 80;
    const frameCount = 40; // Only use even frames
    const frameDelay = 50; // 50ms between frames (20 FPS) - faster animation
    let currentFrame = 0;

    // Store original animation state
    const originalScrollOffset = scrollOffsetRef.current;
    const originalBackgroundScrollOffset = backgroundScrollOffsetRef.current;
    const originalGhostAnimationTime = ghostAnimationTimeRef.current;
    const originalFloatOffset = floatOffsetRef.current;

    // Create a temporary draw function for GIF generation
    const drawFrame = () => {
      if (!canvas || !ctx) return;

      // Clear canvas and fill with black background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.imageSmoothingEnabled = false;

      // Draw background
      if (assets.backgroundTile) {
        const transparencyPulse =
          Math.sin(ghostAnimationTimeRef.current * 2.4) * 0.4 + 0.3; // Increased frequency and range

        const scale = imageScale;
        const baseSize = Math.max(canvasSize / 2, 256);
        const scaledW = baseSize * scale;
        const scaledH = baseSize * scale;
        const scaledTileWidth = assets.backgroundTile.width * scale;
        const scaledTileHeight = assets.backgroundTile.height * scale;
        const offset =
          (backgroundScrollOffsetRef.current * scale) % scaledTileWidth;

        // Create a temporary canvas for background with mask
        const bgCanvas = document.createElement("canvas");
        bgCanvas.width = bgCanvas.height = canvasSize;
        const bgCtx = bgCanvas.getContext("2d");
        if (bgCtx) {
          bgCtx.imageSmoothingEnabled = false;

          // Draw background tiles to temp canvas
          for (
            let y = -offset;
            y < canvasSize + scaledTileHeight;
            y += scaledTileHeight
          ) {
            for (
              let x = -offset;
              x < canvasSize + scaledTileWidth;
              x += scaledTileWidth
            ) {
              bgCtx.drawImage(
                assets.backgroundTile,
                x,
                y,
                scaledTileWidth,
                scaledTileHeight
              );
            }
          }

          // Create circular mask with radial blur
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = maskCanvas.height = canvasSize;
          const maskCtx = maskCanvas.getContext("2d");
          if (maskCtx) {
            const mainImageX = (canvasSize - scaledW) / 2;
            const mainImageY =
              (canvasSize - scaledH) / 2 +
              canvasSize / 12 -
              imageYOffset +
              floatOffsetRef.current;
            const circleCenterX = mainImageX + scaledW / 2;
            const circleCenterY = mainImageY + scaledH / 2;
            const circleRadius = Math.max(scaledW, scaledH) * 0.8;

            const radialGradient = maskCtx.createRadialGradient(
              circleCenterX,
              circleCenterY,
              0,
              circleCenterX,
              circleCenterY,
              circleRadius
            );

            radialGradient.addColorStop(0, "rgba(255,255,255,1)");
            radialGradient.addColorStop(0.25, "rgba(255,255,255,1)");
            radialGradient.addColorStop(0.45, "rgba(255,255,255,0.9)");
            radialGradient.addColorStop(0.65, "rgba(255,255,255,0.5)");
            radialGradient.addColorStop(0.85, "rgba(255,255,255,0.1)");
            radialGradient.addColorStop(1, "rgba(255,255,255,0)");

            maskCtx.fillStyle = radialGradient;
            maskCtx.fillRect(0, 0, canvasSize, canvasSize);

            bgCtx.globalCompositeOperation = "destination-in";
            bgCtx.drawImage(maskCanvas, 0, 0);
          }

          ctx.save();
          ctx.globalAlpha = transparencyPulse;
          ctx.drawImage(bgCanvas, 0, 0);
          ctx.restore();
        }
      }

      // Draw panel
      if (maskImage && assets.placeholder) {
        const resultCanvas = createResultCanvas(assets.placeholder, 256);
        if (resultCanvas) {
          const baseSize = Math.max(canvasSize / 2, 256);
          const scaledW = baseSize * imageScale * 1.2;
          const scaledH = baseSize * imageScale * 1.2;
          const scaledX = (canvasSize - scaledW) / 2;
          const scaledY =
            (canvasSize - scaledH) / 2 +
            canvasSize / 12 -
            imageYOffset +
            floatOffsetRef.current;

          ctx.drawImage(
            resultCanvas,
            0,
            0,
            resultCanvas.width,
            resultCanvas.height,
            scaledX,
            scaledY,
            scaledW,
            scaledH
          );
        }
      }

      // Draw text
      if (text && assets.placeholder) {
        const formattedText = text.replace(/\\n/g, "\n");
        const lines = formattedText.split("\n");

        ctx.font = `${32 * fontScale}px "${customFont}", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textY = canvasSize * 0.22 + (32 * fontScale) / 2 + fontYOffset;

        lines.forEach((line, index) => {
          const y = textY + index * (32 * fontScale * 1.2);

          const textCanvas = document.createElement("canvas");
          const textCtx = textCanvas.getContext("2d");
          if (!textCtx) return;

          textCanvas.width = canvasSize;
          textCanvas.height = canvasSize;

          const placeholder = assets.placeholder;
          if (!placeholder) return;

          const offset = (scrollOffsetRef.current * 0.5) % placeholder.width;
          textCtx.save();
          textCtx.translate(-offset, -offset);

          for (
            let y = -offset;
            y < canvasSize + placeholder.height;
            y += placeholder.height
          ) {
            for (
              let x = -offset;
              x < canvasSize + placeholder.width;
              x += placeholder.width
            ) {
              textCtx.drawImage(placeholder, x, y);
            }
          }
          textCtx.restore();

          textCtx.font = `${32 * fontScale}px "${customFont}", serif`;
          textCtx.textAlign = "center";
          textCtx.textBaseline = "middle";

          textCtx.globalCompositeOperation = "destination-in";
          textCtx.fillStyle = "black";
          textCtx.fillText(line, canvasSize / 2, y);

          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(textCanvas, 0, 0);
          ctx.restore();
        });
      }
    };

    const captureFrame = () => {
      if (currentFrame >= frameCount) {
        gif.render();
        return;
      }

      // Calculate the actual frame number (even frames only: 0, 2, 4, 6, ...)
      const actualFrameNumber = currentFrame * 2;
      const timeProgress = actualFrameNumber / totalFrames;

      // Increase animation range for more dramatic effects
      scrollOffsetRef.current = originalScrollOffset + timeProgress * 512; // Doubled from 256
      backgroundScrollOffsetRef.current =
        originalBackgroundScrollOffset + timeProgress * 512; // Doubled from 256
      ghostAnimationTimeRef.current =
        originalGhostAnimationTime + timeProgress * 4; // Doubled from 2
      floatOffsetRef.current = Math.sin(timeProgress * Math.PI * 4) * 15; // Increased amplitude and frequency

      drawFrame();

      setTimeout(() => {
        gif.addFrame(canvas, { delay: frameDelay });
        currentFrame++;
        captureFrame();
      }, 50);
    };

    gif.on("finished", (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "prophecy.gif";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });

    captureFrame();
  }, [
    assets,
    maskImage,
    imageScale,
    imageYOffset,
    text,
    customFont,
    fontScale,
    fontYOffset,
    createResultCanvas,
  ]);

  // Draw text with scrolling background
  const drawText = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!text || !assets.placeholder) return;

      const formattedText = text.replace(/\\n/g, "\n");
      const lines = formattedText.split("\n");

      // Set font
      ctx.font = `${32 * fontScale}px "${customFont}", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate text position - place text in upper part of canvas with Y offset
      const textY = canvasSize * 0.22 + (32 * fontScale) / 2 + fontYOffset;

      // Draw text with texture effect
      lines.forEach((line, index) => {
        const y = textY + index * (32 * fontScale * 1.2);

        // Create a temporary canvas for text with texture
        const textCanvas = document.createElement("canvas");
        const textCtx = textCanvas.getContext("2d");
        if (!textCtx) return;

        // Set canvas size to match main canvas
        textCanvas.width = canvasSize;
        textCanvas.height = canvasSize;

        // Draw scrolling texture background
        const placeholder = assets.placeholder;
        if (!placeholder) return;

        const offset = (scrollOffsetRef.current * 0.5) % placeholder.width;
        textCtx.save();
        textCtx.translate(-offset, -offset);

        // Fill the text area with texture pattern
        for (
          let y = -offset;
          y < canvasSize + placeholder.height;
          y += placeholder.height
        ) {
          for (
            let x = -offset;
            x < canvasSize + placeholder.width;
            x += placeholder.width
          ) {
            textCtx.drawImage(placeholder, x, y);
          }
        }
        textCtx.restore();

        // Set text properties
        textCtx.font = `${32 * fontScale}px "${customFont}", serif`;
        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";

        // Create text mask
        textCtx.globalCompositeOperation = "destination-in";
        textCtx.fillStyle = "black";
        textCtx.fillText(line, canvasSize / 2, y);

        // Draw the text with texture to main canvas
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(textCanvas, 0, 0);
        ctx.restore();
      });
    },
    [text, customFont, fontScale, fontYOffset, assets.placeholder]
  );

  // Main drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas and fill with black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.imageSmoothingEnabled = false;

    // Update scroll offsets
    scrollOffsetRef.current = (scrollOffsetRef.current + 0.3) % 256;
    backgroundScrollOffsetRef.current =
      (backgroundScrollOffsetRef.current + 0.2) % 256;
    ghostAnimationTimeRef.current = performance.now() / 1000;

    // Update float offset
    const t = performance.now() / 1000;
    floatOffsetRef.current = Math.sin(t * 1.5) * 10;

    // Draw background
    if (assets.backgroundTile) {
      // Add transparency animation for background only with longer duration and larger range
      const transparencyPulse =
        Math.sin(ghostAnimationTimeRef.current * 1.2) * 0.25 + 0.35;

      const scale = imageScale;
      const baseSize = Math.max(canvasSize / 2, 256);
      const scaledW = baseSize * scale;
      const scaledH = baseSize * scale;
      const imageX = (canvasSize - scaledW) / 2;
      const imageY =
        (canvasSize - scaledH) / 2 +
        canvasSize / 2.5 -
        imageYOffset +
        floatOffsetRef.current;
      const scaledTileWidth = assets.backgroundTile.width * scale;
      const scaledTileHeight = assets.backgroundTile.height * scale;
      const offset =
        (backgroundScrollOffsetRef.current * scale) % scaledTileWidth;

      // Create a temporary canvas for background with mask
      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = bgCanvas.height = canvasSize;
      const bgCtx = bgCanvas.getContext("2d");
      if (bgCtx) {
        bgCtx.imageSmoothingEnabled = false;

        // Draw background tiles to temp canvas
        for (
          let y = -offset;
          y < canvasSize + scaledTileHeight;
          y += scaledTileHeight
        ) {
          for (
            let x = -offset;
            x < canvasSize + scaledTileWidth;
            x += scaledTileWidth
          ) {
            bgCtx.drawImage(
              assets.backgroundTile,
              x,
              y,
              scaledTileWidth,
              scaledTileHeight
            );
          }
        }

        // Create circular mask with radial blur
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = maskCanvas.height = canvasSize;
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          // Calculate circle center and radius based on main image position
          const mainImageX = (canvasSize - scaledW) / 2;
          const mainImageY =
            (canvasSize - scaledH) / 2 +
            canvasSize / 12 -
            imageYOffset +
            floatOffsetRef.current;
          const circleCenterX = mainImageX + scaledW / 2;
          const circleCenterY = mainImageY + scaledH / 2;
          const circleRadius = Math.max(scaledW, scaledH) * 0.8; // Slightly larger than main image

          // Create radial gradient for smooth edge blur
          const radialGradient = maskCtx.createRadialGradient(
            circleCenterX,
            circleCenterY,
            0,
            circleCenterX,
            circleCenterY,
            circleRadius
          );

          // Smooth transition from center to edge with even stronger blur
          radialGradient.addColorStop(0, "rgba(255,255,255,1)"); // Solid white in center
          radialGradient.addColorStop(0.25, "rgba(255,255,255,1)"); // Solid white until 25%
          radialGradient.addColorStop(0.45, "rgba(255,255,255,0.9)"); // Start fading at 45%
          radialGradient.addColorStop(0.65, "rgba(255,255,255,0.5)"); // More fading at 65%
          radialGradient.addColorStop(0.85, "rgba(255,255,255,0.1)"); // Heavy fading at 85%
          radialGradient.addColorStop(1, "rgba(255,255,255,0)"); // Transparent at edge

          maskCtx.fillStyle = radialGradient;
          maskCtx.fillRect(0, 0, canvasSize, canvasSize);

          // Apply mask to background
          bgCtx.globalCompositeOperation = "destination-in";
          bgCtx.drawImage(maskCanvas, 0, 0);
        }

        // Draw masked background to main canvas with transparency
        ctx.save();
        ctx.globalAlpha = transparencyPulse;
        ctx.drawImage(bgCanvas, 0, 0);
        ctx.restore();
      }
    }

    // Draw panel
    if (maskImage && assets.placeholder) {
      const resultCanvas = createResultCanvas(assets.placeholder, 256);
      if (resultCanvas) {
        // Calculate base size to make image larger (at least 1/2 of canvas)
        const baseSize = Math.max(canvasSize / 2, 256);
        const scaledW = baseSize * imageScale * 1.2;
        const scaledH = baseSize * imageScale * 1.2;
        const scaledX = (canvasSize - scaledW) / 2;
        const scaledY =
          (canvasSize - scaledH) / 2 +
          canvasSize / 12 -
          imageYOffset +
          floatOffsetRef.current;

        ctx.drawImage(
          resultCanvas,
          0,
          0,
          resultCanvas.width,
          resultCanvas.height,
          scaledX,
          scaledY,
          scaledW,
          scaledH
        );
      }
    }

    // Draw ghost icons if started
    if (ghostStarted && maskImage && assets.placeholder) {
      const t = ghostAnimationTimeRef.current;
      const offset1 = getGhostOffset(t, 1);
      const offset2 = getGhostOffset(t, 2);

      const resultCanvas = createResultCanvas(assets.placeholder, 256);
      if (resultCanvas) {
        const baseSize = Math.max(canvasSize / 2, 256);
        const scaledW = baseSize * imageScale * 1.2;
        const scaledH = baseSize * imageScale * 1.2;
        const scaledX = (canvasSize - scaledW) / 2;
        const scaledY =
          (canvasSize - scaledH) / 2 +
          canvasSize / 12 -
          imageYOffset +
          floatOffsetRef.current;

        // Draw first ghost icon with floating effect
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.translate(offset1, offset1);
        ctx.drawImage(
          resultCanvas,
          0,
          0,
          resultCanvas.width,
          resultCanvas.height,
          scaledX,
          scaledY,
          scaledW,
          scaledH
        );
        ctx.restore();

        // Draw second ghost icon with floating effect
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.translate(offset2, offset2);
        ctx.drawImage(
          resultCanvas,
          0,
          0,
          resultCanvas.width,
          resultCanvas.height,
          scaledX,
          scaledY,
          scaledW,
          scaledH
        );
        ctx.restore();
      }
    }

    // Draw red elements for final style
    if (
      style === "final" &&
      assets.placeholderRed &&
      assets.backgroundTileRed
    ) {
      const pulseOpacity =
        Math.sin(ghostAnimationTimeRef.current * Math.PI) * 0.5 + 0.5;

      // Draw red background
      if (assets.backgroundTileRed) {
        // Add transparency animation for red background only with longer duration and larger range
        const redTransparencyPulse =
          Math.sin(ghostAnimationTimeRef.current * 1.4) * 0.25 + 0.35;

        const scale = imageScale;
        const baseSize = Math.max(canvasSize / 2, 256);
        const scaledW = baseSize * scale;
        const scaledH = baseSize * scale;
        const imageX = (canvasSize - scaledW) / 2;
        const imageY =
          (canvasSize - scaledH) / 2 +
          canvasSize / 2.5 -
          imageYOffset +
          floatOffsetRef.current;
        const scaledTileWidth = assets.backgroundTileRed.width * scale;
        const scaledTileHeight = assets.backgroundTileRed.height * scale;
        const offset =
          (backgroundScrollOffsetRef.current * scale) % scaledTileWidth;

        // Create a temporary canvas for red background with mask
        const redBgCanvas = document.createElement("canvas");
        redBgCanvas.width = redBgCanvas.height = canvasSize;
        const redBgCtx = redBgCanvas.getContext("2d");
        if (redBgCtx) {
          redBgCtx.imageSmoothingEnabled = false;

          // Draw red background tiles to temp canvas
          for (
            let y = -offset;
            y < canvasSize + scaledTileHeight;
            y += scaledTileHeight
          ) {
            for (
              let x = -offset;
              x < canvasSize + scaledTileWidth;
              x += scaledTileWidth
            ) {
              redBgCtx.drawImage(
                assets.backgroundTileRed,
                x,
                y,
                scaledTileWidth,
                scaledTileHeight
              );
            }
          }

          // Create circular mask with radial blur for red background
          const redMaskCanvas = document.createElement("canvas");
          redMaskCanvas.width = redMaskCanvas.height = canvasSize;
          const redMaskCtx = redMaskCanvas.getContext("2d");
          if (redMaskCtx) {
            // Calculate circle center and radius based on main image position
            const mainImageX = (canvasSize - scaledW) / 2;
            const mainImageY =
              (canvasSize - scaledH) / 2 +
              canvasSize / 12 -
              imageYOffset +
              floatOffsetRef.current;
            const circleCenterX = mainImageX + scaledW / 2;
            const circleCenterY = mainImageY + scaledH / 2;
            const circleRadius = Math.max(scaledW, scaledH) * 0.8; // Slightly larger than main image

            // Create radial gradient for smooth edge blur
            const redRadialGradient = redMaskCtx.createRadialGradient(
              circleCenterX,
              circleCenterY,
              0,
              circleCenterX,
              circleCenterY,
              circleRadius
            );

            // Smooth transition from center to edge with even stronger blur
            redRadialGradient.addColorStop(0, "rgba(255,255,255,1)"); // Solid white in center
            redRadialGradient.addColorStop(0.25, "rgba(255,255,255,1)"); // Solid white until 25%
            redRadialGradient.addColorStop(0.45, "rgba(255,255,255,0.9)"); // Start fading at 45%
            redRadialGradient.addColorStop(0.65, "rgba(255,255,255,0.5)"); // More fading at 65%
            redRadialGradient.addColorStop(0.85, "rgba(255,255,255,0.1)"); // Heavy fading at 85%
            redRadialGradient.addColorStop(1, "rgba(255,255,255,0)"); // Transparent at edge

            redMaskCtx.fillStyle = redRadialGradient;
            redMaskCtx.fillRect(0, 0, canvasSize, canvasSize);

            // Apply mask to red background
            redBgCtx.globalCompositeOperation = "destination-in";
            redBgCtx.drawImage(redMaskCanvas, 0, 0);
          }

          // Draw masked red background to main canvas with transparency and blur
          ctx.save();
          ctx.globalAlpha = pulseOpacity * redTransparencyPulse;
          ctx.filter = "blur(1.5px)";
          ctx.drawImage(redBgCanvas, 0, 0);
          ctx.restore();
        }
      }

      // Draw red panel
      if (maskImage && assets.placeholderRed) {
        const resultCanvasRed = createResultCanvas(assets.placeholderRed, 256);
        if (resultCanvasRed) {
          ctx.save();
          ctx.globalAlpha = pulseOpacity;

          const baseSize = Math.max(canvasSize / 2, 256);
          const scaledW = baseSize * imageScale * 1.2;
          const scaledH = baseSize * imageScale * 1.2;
          const scaledX = (canvasSize - scaledW) / 2;
          const scaledY =
            (canvasSize - scaledH) / 2 +
            canvasSize / 12 -
            imageYOffset +
            floatOffsetRef.current;

          ctx.drawImage(
            resultCanvasRed,
            0,
            0,
            resultCanvasRed.width,
            resultCanvasRed.height,
            scaledX,
            scaledY,
            scaledW,
            scaledH
          );
          ctx.restore();
        }
      }

      // Draw red ghost icons
      if (ghostStarted && maskImage && assets.placeholderRed) {
        const t = ghostAnimationTimeRef.current;
        const offset1 = getGhostOffset(t, 1);
        const offset2 = getGhostOffset(t, 2);

        const resultCanvasRed = createResultCanvas(assets.placeholderRed, 256);
        if (resultCanvasRed) {
          const baseSize = Math.max(canvasSize / 2, 256);
          const scaledW = baseSize * imageScale * 1.2;
          const scaledH = baseSize * imageScale * 1.2;
          const scaledX = (canvasSize - scaledW) / 2;
          const scaledY =
            (canvasSize - scaledH) / 2 +
            canvasSize / 12 -
            imageYOffset +
            floatOffsetRef.current;

          // Draw first red ghost icon
          ctx.save();
          ctx.globalAlpha = pulseOpacity * 0.2;
          ctx.translate(offset1, offset1);
          ctx.drawImage(
            resultCanvasRed,
            0,
            0,
            resultCanvasRed.width,
            resultCanvasRed.height,
            scaledX,
            scaledY,
            scaledW,
            scaledH
          );
          ctx.restore();

          // Draw second red ghost icon
          ctx.save();
          ctx.globalAlpha = pulseOpacity * 0.4;
          ctx.translate(offset2, offset2);
          ctx.drawImage(
            resultCanvasRed,
            0,
            0,
            resultCanvasRed.width,
            resultCanvasRed.height,
            scaledX,
            scaledY,
            scaledW,
            scaledH
          );
          ctx.restore();
        }
      }
    }

    // Draw text
    drawText(ctx);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [
    assets,
    maskImage,
    imageScale,
    imageYOffset,
    ghostStarted,
    style,
    createResultCanvas,
    drawText,
    getGhostOffset,
  ]);

  // Start animation
  useEffect(() => {
    if (maskImage) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, maskImage]);

  return (
    <div className="relative w-full max-w-[512px]">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="w-full max-w-[512px] h-auto image-rendering-pixelated"
        style={{
          imageRendering: "pixelated",
        }}
      />

      {/* Download buttons */}
      <div className="flex gap-2 mt-4 justify-center">
        <button onClick={downloadPNG} className="download-btn">
          Download PNG
        </button>
        <button onClick={downloadGIF} className="download-btn">
          Download GIF
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @font-face {
            font-family: 'ProphecyType';
            src: url('/assets/fonts/PROPHECYTYPE.ttf') format('truetype');
            font-display: swap;
          }

          @font-face {
            font-family: 'DTMSans';
            src: url('/assets/fonts/DTM-Sans.otf') format('opentype');
            font-display: swap;
          }

          .image-rendering-pixelated {
            image-rendering: pixelated;
            -moz-image-rendering: crisp-edges;
            -webkit-image-rendering: -webkit-optimize-contrast;
          }

          .download-btn {
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
            outline: none;
          }

          .download-btn:hover {
            background-color: #222;
            border-color: #fff;
          }

          .download-btn:active {
            background-color: #111;
          }

          .download-btn:focus {
            outline: none;
            border-color: #fff;
            box-shadow: 0 0 5px white;
          }
        `,
        }}
      />
    </div>
  );
};
