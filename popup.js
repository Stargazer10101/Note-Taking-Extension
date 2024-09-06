document.addEventListener('DOMContentLoaded', function() {
    var toggleSwitch = document.getElementById('toggleSwitch');
    
    chrome.storage.sync.get('isEnabled', function(data) {
      toggleSwitch.checked = data.isEnabled;
    });
  
    toggleSwitch.addEventListener('change', function() {
      let isEnabled = this.checked;
      chrome.storage.sync.set({isEnabled: isEnabled});
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleExtension", isEnabled: isEnabled});
      });
    });
  });