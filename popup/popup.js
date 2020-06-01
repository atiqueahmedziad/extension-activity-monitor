async function getAllExtensions() {
  let extensions = await browser.management.getAll();
  return extensions.filter(extension => extension.type !== 'theme');
}

async function isExtsBeingMonitored() {
  const isExtsBeingMonitored = await browser.runtime.sendMessage({
    eam_getMonitoringStatus: true,
  });
  return isExtsBeingMonitored;
}

async function sendExtensions(extensions) {
  await browser.runtime.sendMessage({
    eam_extensions: extensions
  });
  window.close();
}

async function init() {
  const extensions = await getAllExtensions();
  const startMonitorBtn = document.getElementById('startMonitorBtn');
  startMonitorBtn.addEventListener('click', () => {
    sendExtensions(extensions);
  });
}

window.addEventListener('load', init);
