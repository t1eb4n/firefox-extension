"use strict";

(function() {
  browser.browserAction.onClicked.addListener(() => browser.sidebarAction.toggle());
})();