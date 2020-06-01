export default class Save {
  constructor(logs){
    this._logs = logs;
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;

    function clickHandler() {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.removeEventListener('click', clickHandler);
      }, 100);
    };

    anchor.addEventListener('click', clickHandler, false);
    anchor.click();
  }

  saveAsJSON() {
    const blob = new Blob([JSON.stringify(this._logs)], {type: 'application/json'});
    this.downloadFile(blob, 'activitylogs.json');
  }
}
