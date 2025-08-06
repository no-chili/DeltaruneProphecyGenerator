export interface PanelPreset {
  text: string;
  style: "default" | "susie" | "final";
  yOffset?: number;
}

export const panelPresets: Record<string, PanelPreset> = {
  roots: {
    text: "Roots",
    style: "default",
    yOffset: 38,
  },
  gallery: {
    text: "Gallery",
    style: "default",
    yOffset: 20,
  },
  "initial-1": {
    text: "The prophecy, which whispers \n among the shadows.",
    style: "default",
    yOffset: 16,
  },
  "initial-2": {
    text: "The legend of this world. \n < Deltarune. >",
    style: "default",
    yOffset: 52,
  },
  "main-1": {
    text: "A world basked in purest light. \n Beneath it grew eternal night.",
    style: "default",
  },
  "main-2": {
    text: "If fountains freed, the roaring cries. \n And titans shape from darkened eyes.",
    style: "default",
    yOffset: 20,
  },
  "main-3": {
    text: "The light and dark, both burning dire. \n A countdown to the earth's expire.",
    style: "default",
    yOffset: 32,
  },
  "heroes-1": {
    text: "But lo, on hopes and dreams they send. \n Three heroes at the world's end.",
    style: "default",
  },
  "heroes-4": {
    text: "The first hero. \n The cage, with human soul and parts.",
    style: "susie",
    yOffset: 36,
  },
  "heroes-2": {
    text: "The second hero. \n The girl, with hope crossed on her heart.",
    style: "susie",
    yOffset: 25,
  },
  "heroes-3": {
    text: "The third hero. \n The prince, alone in deepest dark.",
    style: "susie",
    yOffset: 54,
  },
  "rude-buster": {
    text: "And last, was the girl. \n At last, was the girl.",
    style: "susie",
  },
  "joke-1": {
    text: "Jockington grows the beard.",
    style: "default",
  },
  "joke-2": {
    text: 'The pointy-headed will say \n "Toothpaste," and then "Boy."',
    style: "default",
    yOffset: 45,
  },
  "boss-1": {
    text: "The queen's chariot \n cannot be stopped.",
    style: "default",
    yOffset: 65,
  },
  "boss-2": {
    text: "Cleaved red by blade.",
    style: "susie",
    yOffset: 42,
  },
  "boss-3": {
    text: "The flower man, \n trapped in asylum.",
    style: "default",
    yOffset: 22,
  },
  knight: {
    text: "The knight which makes \n with blackened knife.",
    style: "default",
    yOffset: 20,
  },
  "heaven-hell-1": {
    text: "They'll hear the ring of heaven's call.",
    style: "default",
    yOffset: 20,
  },
  "heaven-hell-2": {
    text: "They'll see the tail of hell take crawl.",
    style: "default",
    yOffset: 32,
  },
  end: {
    text: "The final tragedy unveils.",
    style: "final",
    yOffset: 55,
  },
  hammer: {
    text: "Axe carved by the \n tortoise's grand hammer.",
    style: "default",
  },
};
