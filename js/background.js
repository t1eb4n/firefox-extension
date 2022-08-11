"use strict";

(function() {
  browser.browserAction.onClicked.addListener(() => browser.sidebarAction.toggle());

  browser.commands.onCommand.addListener((command) => {
    if (command === 'new-tab') console.log('opening new tab');
  });
})();