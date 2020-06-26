import {
  getMonitorStatus,
  startMonitor,
  stopMonitor,
  openActivityLogPage,
} from '../lib/ext-listen.js';

export default class Popup {
  constructor() {
    this.startMonitorAllBtn = document.getElementById('startMonitorBtn');
    this.stopMonitorAllBtn = document.getElementById('stopMonitorBtn');
    this.openActivityLogBtn = document.getElementById('actLogPage');
    this.monitorStatusText = document.getElementById('monitorStatus');
    this.errorMsgText = document.getElementById('errorText');
  }

  renderErrorMsg(message) {
    this.errorMsgText.textContent = message;
    this.errorMsgText.style.display = 'block';
  }

  renderMonitorStartedUI() {
    this.startMonitorAllBtn.setAttribute('disabled', true);
    this.stopMonitorAllBtn.removeAttribute('disabled');

    this.monitorStatusText.textContent = 'Extensions are being monitored';
    this.monitorStatusText.classList.add('success');
    this.monitorStatusText.classList.remove('failure');
  }

  renderMonitorStoppedUI() {
    this.startMonitorAllBtn.removeAttribute('disabled');
    this.stopMonitorAllBtn.setAttribute('disabled', true);

    this.monitorStatusText.textContent = 'No extensions are being monitored';
    this.monitorStatusText.classList.add('failure');
    this.monitorStatusText.classList.remove('success');
  }

  async render() {
    const isMonitorStarted = await getMonitorStatus();
    isMonitorStarted
      ? this.renderMonitorStartedUI()
      : this.renderMonitorStoppedUI();
  }

  handleViewActivityLog() {
    openActivityLogPage();
    window.close();
  }

  async handleEvent(event) {
    try {
      if (event.type === 'click') {
        switch (event.target) {
          case this.startMonitorAllBtn:
            await this.handleMonitor(startMonitor);
            break;
          case this.stopMonitorAllBtn:
            await this.handleMonitor(stopMonitor);
            break;
          case this.openActivityLogBtn:
            this.handleViewActivityLog();
            break;
          default:
            throw new Error(
              'wrong event target id found: ' + JSON.stringify(event.target.id)
            );
        }
      } else {
        throw new Error(
          'wrong event type found: ' + JSON.stringify(event.type)
        );
      }
    } catch (error) {
      this.renderErrorMsg(error.message);
    }
  }

  async handleMonitor(monitorFunc) {
    try {
      await monitorFunc();
      this.render();
    } catch (error) {
      this.renderErrorMsg(error.message);
    }
  }

  async init() {
    await this.render();
    this.startMonitorAllBtn.addEventListener('click', this);
    this.stopMonitorAllBtn.addEventListener('click', this);
    this.openActivityLogBtn.addEventListener('click', this);
  }
}
