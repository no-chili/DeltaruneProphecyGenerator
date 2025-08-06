import { useCallback, useEffect, useState } from "react";

interface ProphecyAssets {
  placeholder: HTMLImageElement | null;
  placeholderRed: HTMLImageElement | null;
  backgroundTile: HTMLImageElement | null;
  backgroundTileRed: HTMLImageElement | null;
}

export const useProphecyAssets = (style: "default" | "susie" | "final") => {
  const [assets, setAssets] = useState<ProphecyAssets>({
    placeholder: null,
    placeholderRed: null,
    backgroundTile: null,
    backgroundTileRed: null,
  });

  const getAssetPath = useCallback(
    (name: string) => {
      let suffix = "";
      if (style === "susie") suffix = "-susie";
      else if (style === "final") suffix = "-final";
      return `/assets/depth/${name}${suffix}.png`;
    },
    [style]
  );

  const getRedAssetPath = useCallback((name: string) => {
    return `/assets/depth/${name}-final-red.png`;
  }, []);

  const loadImageFromFile = useCallback(
    (path: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = path;
      });
    },
    []
  );

  const loadAssets = useCallback(async () => {
    const isFinalStyle = style === "final";

    try {
      const promises = [
        loadImageFromFile(getAssetPath("depth-blue")),
        loadImageFromFile(getAssetPath("depth-text")),
        loadImageFromFile(getAssetPath("depth-darker-new")),
      ];

      // Load red textures if final style
      if (isFinalStyle) {
        promises.push(
          loadImageFromFile(getRedAssetPath("depth-blue")),
          loadImageFromFile(getRedAssetPath("depth-text")),
          loadImageFromFile(getRedAssetPath("depth-darker-new"))
        );
      }

      const results = await Promise.all(promises);
      const [tile, textBG, bgTile, redTile, redTextBG, redBgTile] = results;

      setAssets({
        placeholder: tile,
        backgroundTile: bgTile,
        placeholderRed: isFinalStyle ? redTile : null,
        backgroundTileRed: isFinalStyle ? redBgTile : null,
      });

      // Handle text background for regular style
      const textContainerRef = document.querySelector(
        "#textContainer"
      ) as HTMLDivElement;
      if (textContainerRef) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(textBG, 0, 0, 256, 256);
          textContainerRef.style.backgroundImage = `url(${canvas.toDataURL()})`;
        }
      }

      // Handle red text background for final style
      if (isFinalStyle && redTextBG) {
        const textContainerRedRef = document.querySelector(
          "#textContainerRed"
        ) as HTMLDivElement;
        if (textContainerRedRef) {
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(redTextBG, 0, 0, 256, 256);
            textContainerRedRef.style.backgroundImage = `url(${canvas.toDataURL()})`;
          }
        }
      }

      // Show/hide red elements based on final style
      const redElements = [
        "#textContainerRed",
        "#ghostIconRed",
        "#ghostIcon2Red",
        "#panelRed",
        "#backgroundRed",
      ];
      redElements.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element && element instanceof HTMLElement) {
          element.style.display = isFinalStyle ? "block" : "none";
        }
      });

      // Update body classes for theme
      document.body.classList.toggle("susie-theme", style === "susie");
      document.body.classList.toggle("final-theme", style === "final");
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  }, [style, getAssetPath, getRedAssetPath, loadImageFromFile]);

  // Update theme classes when style changes
  useEffect(() => {
    document.body.classList.remove("susie-theme", "final-theme");
    if (style === "susie") {
      document.body.classList.add("susie-theme");
    } else if (style === "final") {
      document.body.classList.add("final-theme");
    }
  }, [style]);

  return { assets, loadAssets };
};
