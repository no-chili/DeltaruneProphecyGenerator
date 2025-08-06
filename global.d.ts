export {};

declare global {
  interface Window {
    dataLayer: any[]; // 或用更具体的类型替代 any
  }
}
