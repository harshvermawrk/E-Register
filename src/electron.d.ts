interface Window {
  desktop?: {
    getAppVersion(): Promise<string>;
  };
}
