(async function() {
  const tabElements = {};
  const windowInfo = await browser.windows.getCurrent({populate: true});

  const addTab = (tab) => {
    const tabDiv = document.createElement('div');
    document.getElementById('tabs').appendChild(tabDiv);

    const favIcon = document.createElement('img');
    favIcon.src = tab.favIconUrl || 'chrome://branding/content/icon32.png';
    favIcon.className = 'tabFavIcon';

    const title = document.createElement('span');
    title.className = 'tabTitle';
    title.innerText = tab.title;

    const closeIcon = document.createElement('img');
    closeIcon.src   = '../imgs/close.png';
    closeIcon.className = 'closeIcon';
    closeIcon.addEventListener('click', () => browser.tabs.remove(tab.id));

    tabDiv.dataset.tabId = tab.id;
    tabDiv.className = 'tab';
    if(tab.active) {
      tabDiv.className += ' active';
    }

    tabDiv.addEventListener('click', () => browser.tabs.update(tab.id, {active: true}));
    tabDiv.append(favIcon);
    tabDiv.append(title);
    tabDiv.append(closeIcon);

    tabDiv.removeElement = () => {
      tabDiv.remove();
      delete tabElements[tab.id];
    }

    tabElements[tab.id] = tabDiv;
  };

  /** Load tabs initally **/
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