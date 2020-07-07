import { save } from '../lib/save-load.js';

class Model {
  constructor() {
    this.logs = [];
  }

  addNewLogs(logs) {
    this.logs.push(...logs);
  }
}

class View {
  constructor() {
    this.saveLogBtn = document.getElementById('saveLogBtn');
    this.showLogDetailWrapper = document.querySelector(
      '.show-log-detail-wrapper'
    );
    this.showLogDetails = document.getElementById('showLogDetails');
    this.logTableWrapper = document.querySelector('.log-table');
    this.tableBody = document.querySelector('table tbody');
    this.notice = document.querySelector('.notice');
    this.closeBtn = document.querySelector('.close');
  }

  addTableRows(logs) {
    for (const log of logs) {
      const newRow = this.tableBody.insertRow(-1);
      newRow.insertCell(0).textContent = log.id;
      newRow.insertCell(1).textContent = log.timeStamp;
      newRow.insertCell(2).textContent = log.type;
      newRow.insertCell(3).textContent = log.name;
      newRow.insertCell(4).textContent = log.viewType || 'undefined';
      newRow._log = log;
    }
  }

  setError(errorMessage) {
    if (errorMessage) {
      this.notice.textContent = errorMessage;
      this.notice.classList.add('failure');
    } else {
      this.notice.textContent = '';
      this.notice.classList.remove('failure');
    }
  }

  openDetailSidebar(logDetails) {
    const logString = JSON.stringify(logDetails);
    this.showLogDetails.textContent = logString;
    this.showLogDetailWrapper.removeAttribute('hidden');
    this.logTableWrapper.classList.add('width-60');
  }

  closeDetailSidebar() {
    this.showLogDetailWrapper.setAttribute('hidden', true);
    this.logTableWrapper.classList.remove('width-60');
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.init();
  }

  async init() {
    this.view.saveLogBtn.addEventListener('click', this);
    this.view.closeBtn.addEventListener('click', this);
    this.view.tableBody.addEventListener('click', this);

    browser.runtime.onMessage.addListener((message) => {
      const { requestTo, requestType } = message;

      if (requestTo !== 'activity-log') {
        return;
      }

      if (requestType === 'appendLogs') {
        this.model.addNewLogs([message.log]);
        this.view.addTableRows([message.log]);
      } else {
        throw new Error(`wrong request type found ${requestType}`);
      }
    });

    const existingLogs = await this.getExistingLogs();

    if (existingLogs.length) {
      this.model.addNewLogs(existingLogs);
    }
    this.view.addTableRows(this.model.logs);
  }

  async getExistingLogs() {
    const { existingLogs } = await browser.runtime.sendMessage({
      requestType: 'sendAllLogs',
      requestTo: 'ext-monitor',
    });
    return existingLogs;
  }

  handleEvent(event) {
    if (event.type === 'click') {
      const logDetails = event.target.closest('tr')?._log;

      if (logDetails) {
        this.view.openDetailSidebar(logDetails);
        return;
      }

      switch (event.target) {
        case this.view.saveLogBtn:
          this.saveLogs();
          break;
        case this.view.closeBtn:
          this.view.closeDetailSidebar();
          break;
        default:
          throw new Error(`unexpected click event on ${event.target.tagName}`);
      }
    } else {
      throw new Error(`wrong event type found ${event.type}`);
    }
  }

  async saveLogs() {
    try {
      await save.saveAsJSON(this.model.logs);
      this.view.setError(null);
    } catch (error) {
      this.view.setError(error.message);
    }
  }
}

export default class ActivityLog {
  constructor() {
    new Controller(new Model(), new View());
  }
}
