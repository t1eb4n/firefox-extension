(async function() {
  const dataTypes = ['cookies', 'indexedDB', 'localStorage'];
  const dataTypesObject = {};
  dataTypes.forEach(dataType => dataTypesObject[dataType] = true);

  const tabElements = {};
  const windowInfo = await browser.windows.getCurrent({populate: true});
  
  const containers = {
    't1eb4n-personal': {
      name: 't1eb4n-personal',
      color: 'yellow',
      icon: 'fingerprint'
    },
    't1eb4n-work-boomtown': {
      name: 't1eb4n-work-boomtown',
      color: 'purple',
      icon: 'briefcase'
    },
    't1eb4n-private': {
      name: 't1eb4n-private',
      color: 'red',
      icon: 'fence'
    }
  };
  const availableContainerIds = [];
  const isPrivate = (url) => {
    if(url.includes('about:')) return true;

    return false;
  };

  for(const containerName of Object.keys(containers)) {
    let identity = (await browser.contextualIdentities.query({name: containerName}))[0];
    if(undefined === identity) {
      identity = await browser.contextualIdentities.create(containers[containerName]);
    }

    containers[containerName] = identity;
    availableContainerIds.push(identity.cookieStoreId);
  }

  const defaultContainer = containers[Object.keys(containers)[0]];

  document.getElementById('addTab').onclick = () => browser.tabs.create({cookieStoreId: defaultContainer.cookieStoreId});

  const addTab = async (tab) => {
    if(!availableContainerIds.includes(tab.cookieStoreId) && !isPrivate(tab.url)) {
      try {
        await browser.tabs.create({
          cookieStoreId: defaultContainer.cookieStoreId,
          url: tab.url,
          index: tab.index
        });
        await browser.tabs.remove(tab.id);
        return;
      } catch(error) { console.log(error); }
    }

    const tabDiv = document.getElementById('tabTemplate').cloneNode(true);
    tabDiv.removeAttribute('id');
    document.getElementById('tabs').appendChild(tabDiv);

    let container = Object.values(containers).find(entry => entry.cookieStoreId === tab.cookieStoreId);
    container ||= {iconUrl: 'chrome://branding/content/icon32.png', colorCode: '#ffffff'};

    tabDiv.querySelector('img.tabFavIcon').src = tab.favIconUrl || 'chrome://branding/content/icon32.png';
    tabDiv.querySelector('i.tabIdentity').style = `mask: url("${container.iconUrl}") no-repeat 50% 50%; background-color: ${container.colorCode}; mask-size: cover;`;
    tabDiv.querySelector('span.tabTitle').innerText = tab.title;
    tabDiv.querySelector('i.tabCloseIcon').addEventListener('click', (event) => event.stopPropagation() || browser.tabs.remove(tab.id));

    tabDiv.ondrag = () => console.log('ondrag');
    tabDiv.ondragstart = () => console.log('ondragstart');

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
  windowInfo.tabs.forEach(tab => addTab(tab));

  browser.tabs.onCreated.addListener((tab) => addTab(tab));
  browser.tabs.onDetached.addListener((tabId) => tabElements[tabId].removeElement());
  browser.tabs.onRemoved.addListener(async (tabId) => {
    tabElements[tabId].removeElement();

    const cookieStoreId = (await browser.contextualIdentities.query({name: 't1eb4n-private'}))[0].cookieStoreId;
    const tabs          = await browser.tabs.query({cookieStoreId})
    if(tabs.length === 0) {
      // wipe session
      await browser.browsingData.remove({cookieStoreId}, {cookies: true, localStorage: true});
      console.log('done');
      /**
       * Still need to delete the tab history here.
       * Unfortunately it seems you can just forget the tab.
       * To clear history all url history for the tabs would have to be remembered and the removal would effect all history
       * just just for the private context.
       */
    }
  });

  browser.tabs.onActivated.addListener((tabInfo) => {
    if(!tabElements[tabInfo.tabId].className.includes('active')) tabElements[tabInfo.tabId].className += ' active';
    tabElements[tabInfo.previousTabId].className = tabElements[tabInfo.previousTabId].className.replace(' active', '');
  });

  browser.tabs.onUpdated.addListener(async (tabId, updateInfo, tab) => {
    if(undefined !== updateInfo.url && !availableContainerIds.includes(tab.cookieStoreId) && !isPrivate(updateInfo.url)) {
      try {
        await browser.tabs.create({
          cookieStoreId: defaultContainer.cookieStoreId,
          url: updateInfo.url,
          index: tab.index
        });
        await browser.tabs.remove(tabId);
        return;
      } catch(error) { console.log(error); }
    }

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
  });
})();