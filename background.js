const activityLogs = [];

const extensionMonitor = {
  extensionMapList: new Map([]),
  isMonitorRunning: false,
  async isExtensionPageOpen() {
    const tab = await browser.tabs.query({
      url: ['moz-extension://*/activitylogs/activitylogs.html']
    });
    if(tab.length) return true;
    return false;
  },
  async sendLogs(details) {
    let isExtPageOpen = await this.isExtensionPageOpen();
    if(isExtPageOpen) {
      browser.runtime.sendMessage({
        eam_updateLogs: details
      });
    }
  },
  logListener() {
    const detailFunc = details => {
      console.log(details);
      activityLogs.push(details);
      this.sendLogs(details);
    }
    return detailFunc;
  },
  setExtensions(extensionsArray) {
    extensionsArray.forEach(extension => {
      this.extensionMapList.set(extension.id, this.logListener());
    });
    this.startMonitor();
  },
  startMonitor() {
    this.extensionMapList.forEach((listener, extensionId) => {
      browser.activityLog.onExtensionActivity.addListener(listener, extensionId);
    });
    this.isMonitorRunning = true;
  },
  stopMonitor() {
    this.extensionMapList.forEach((listener, extensionId) => {
      browser.activityLog.onExtensionActivity.removeListener(listener, extensionId);
    });
    this.isMonitorRunning = false;
  },
  isExtMonitoring(extensionsMap) {
    extensionsMap.forEach((listener, extensionId) => {
      console.log(browser.activityLog.onExtensionActivity.hasListener(listener, extensionId));
    });
  },
}

function extensionMonitorInit(extenssions) {
  if(!extensionMonitor.isMonitorRunning) {
    extensionMonitor.setExtensions(extenssions);
  }
  browser.tabs.create({
    url:`${browser.runtime.getURL('activitylogs/activitylogs.html')}`,
  });
}

function messageHandler(message, sender, sendResponse) {
  const {
    eam_extensions,
    eam_stopMonitor,
    eam_existingLogs,
    eam_getMonitoringStatus
  } = message;

  if(eam_getMonitoringStatus) {
    // TODO: send monitoring status to popup/activitylogs.
  }

  if (Array.isArray(eam_extensions)) {
    extensionMonitorInit(eam_extensions);
  }

  if(eam_stopMonitor) {
    console.log('stop');
    extensionMonitor.isMonitoring();
  }

  if(eam_existingLogs) {
    sendResponse({
      existingLogs: activityLogs,
    });
  }
}

browser.runtime.onMessage.addListener(messageHandler);
