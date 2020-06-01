export default class Load {
  constructor(logFile) {
    this._logFile = logFile;
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result)
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async loadJSONLogs() {
    const logStr = await this.readFile(this._logFile);
    return JSON.parse(logStr);
  }
}
