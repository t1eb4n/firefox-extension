(function() {
  browser.tabs.onCreated.addListener((tab) => browser.tabs.update(tab.id, {muted: true}));
})();