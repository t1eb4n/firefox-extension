(async function() {
  const tabElements = {};
  const windowInfo = await browser.windows.getCurrent({populate: true});

  const addTab = (tab) => {
    const tabDiv = document.getElementById('tabTemplate').cloneNode(true);
    tabDiv.id = '';
    document.getElementById('tabs').appendChild(tabDiv);

    tabDiv.querySelector('img.tabFavIcon').src = tab.favIconUrl || 'chrome://branding/content/icon32.png';
    tabDiv.querySelector('span.tabTitle').innerText = tab.title;
    tabDiv.querySelector('img.tabCloseIcon').addEventListener('click', (event) => event.stopPropagation() || browser.tabs.remove(tab.id));

    tabDiv.dataset.tabId = tab.id;
    if(tab.active) {
      tabDiv.className += ' active';
    }

    tabDiv.addEventListener('click', () => browser.tabs.update(tab.id, {active: true}));

    tabDiv.removeElement = () => {
      tabDiv.remove();
      delete tabElements[tab.id];
    }

    tabElements[tab.id] = tabDiv;
  };

  /** Load tabs initially **/
  (await browser.tabs.query({windowId: windowInfo.id})).forEach(tab => addTab(tab));

  browser.tabs.onCreated.addListener((tab) => addTab(tab));

  browser.tabs.onRemoved.addListener((tabId) => tabElements[tabId].removeElement());
  browser.tabs.onDetached.addListener((tabId) => tabElements[tabId].removeElement());

  browser.tabs.onActivated.addListener((tabInfo) => {
    tabElements[tabInfo.tabId].className = 'tab active';
    tabElements[tabInfo.previousTabId].className = 'tab';
  });

  browser.tabs.onUpdated.addListener((tabId, updateInfo, tab) => {
    tabElement = tabElements[tabId];

    if(updateInfo.status === 'loading') {
      tabElement.querySelector('.tabFavIcon').src = '../imgs/loading.gif';
      tabElement.querySelector('.tabTitle').innerText = 'Loading...';
      return;
    }

    if(undefined !== updateInfo.title) tabElement.querySelector('.tabTitle').innerText =  tab.title;
    if(undefined !== updateInfo.favIconUrl) tabElement.querySelector('.tabFavIcon').src = tab.favIconUrl || 'chrome://branding/content/icon32.png';

    if(updateInfo.status === 'complete') {
      tabElement.querySelector('.tabFavIcon').src = tab.favIconUrl || 'chrome://branding/content/icon32.png';
      tabElement.querySelector('.tabTitle').innerText = tab.title;
      return;
    }

    //console.log(updateInfo);
  });
})();