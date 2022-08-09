/**
 * Automatic switch articles to reader view
 * 
 * @todo - This may need a black / white list settings options
 */
(function() {
  const tabInfo = {};

  browser.tabs.onRemoved.addListener((tabId) => delete tabInfo[tabId]);
  browser.tabs.onDetached.addListener((tabId) => delete tabInfo[tabId]);

  browser.tabs.onCreated.addListener((tab) => {
    tabInfo[tab.id] = {
      /** true === disabled **/
      autoReaderView: true,
      currentUrl: tab.url
    };
  });

  browser.tabs.onUpdated.addListener(async (tabId, updateInfo, tab) => {
    if(0 === tab.url.indexOf('about:reader?url=')) {
      tabInfo[tabId].autoReaderView = true;
    }

    if(tabInfo[tabId].currentUrl !== tab.url && -1 === tab.url.indexOf('about:reader?url=')) {
      tabInfo[tabId].currentUrl = tab.url;
      /** true === disabled */
      tabInfo[tabId].autoReaderView = true;
    }

    if(undefined !== updateInfo.isArticle && true === updateInfo.isArticle && false === tabInfo[tabId].autoReaderView) {
      await browser.tabs.toggleReaderMode(tabId);
      tabInfo[tabId].autoReaderView = true;
    }
  });
})();