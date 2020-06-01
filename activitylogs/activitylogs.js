import Load from '../lib/Load.js';
import Save from '../lib/Save.js';

const activityLogs = [];
const loadedLogs = [];

const eam = {
  async getExistingLogs() {
    const {existingLogs} = await browser.runtime.sendMessage({
      eam_existingLogs: true,
    });
    return existingLogs;
  },
  async loadFile(file) {
    const load = new Load(file);
    const loadedJSONLogs = await load.loadJSONLogs();
    loadedLogs.push(...loadedJSONLogs);
  },
  saveLogs(logs) {
    const save = new Save(logs);
    save.saveAsJSON();
  }
}

browser.runtime.onMessage.addListener(({eam_updateLogs}) => {
  if(eam_updateLogs) {
    activityLogs.push(eam_updateLogs);
    console.log('logs updated ', activityLogs);
  }
});

async function init() {
  const loadLogBtn = document.getElementById('loadLogBtn');
  const logInputFile = document.getElementById('logInputFile');
  const saveLogBtn = document.getElementById('saveLogBtn');
  const showActivityLog = document.getElementById('showActivityLog');
  const showLoadedLog = document.getElementById('showLoadedLog');

  // Existing logs captured in the background
  const existingLogs = await eam.getExistingLogs();
  console.log('log at init ', existingLogs);

  if(existingLogs.length) {
    activityLogs.push(...existingLogs);
  }

  saveLogBtn.addEventListener('click', () => {
    eam.saveLogs(activityLogs);
  });

  loadLogBtn.addEventListener('click', () => {
    if(logInputFile.files.length > 0) {
      eam.loadFile(logInputFile.files[0]);
      logInputFile.value = '';
    } else {
      alert('no file selected');
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
