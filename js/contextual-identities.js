import webext from './shim';
import TabManager from './tab-manager';

class ContextualIdentities {
  constructor() {
    this.identities = {};
  }

  async addIdentity(name, color, icon, isDefault = false, isPrivate = false) {
    let identity = await webext.contextualIdentities.query({name});

    if(identity.length === 0) {
      identity = await webext.contextualIdentities.create({name, color, icon});
    }

    identity[0].isDefault = isDefault;
    identity[0].isPrivate = isPrivate;
    this.identities[name] = identity[0];
  }

  getDefaultContext() {
    return this.identities[
      Object.keys(this.identities).find(name => this.identities[name].isDefault)
    ];
  }

  getContextByCookieStoreID(cookieStoreId) {
    return this.identities[
      Object.keys(this.identities).find(name => this.identities[name].cookieStoreId === cookieStoreId)
    ];
  }

  getPrivateContexts() {
    return Object.values(this.identities).filter(identity => identity.isPrivate === true);
  }
}

const ciContainer = new ContextualIdentities();

/**
 * Any tab without a context, that isn't private automatically becomes a personal tab
 */
ciContainer.addIdentity('t1eb4n-personal', 'yellow', 'fingerprint', true);
webext.tabs.onUpdated.addListener(async (tabId, updateInfo, tab) => {
  const defaultCookieId = ciContainer.getDefaultContext().cookieStoreId;
  const currentContainer = ciContainer.getContextByCookieStoreID(tab.cookieStoreId);

  if(currentContainer === undefined && updateInfo.url !== undefined && updateInfo.url.indexOf('about:') !== 0) {
    try {
      await webext.tabs.create({
        cookieStoreId: defaultCookieId,
        url: updateInfo.url,
        index: tab.index
      });
      await webext.tabs.remove(tabId);
    } catch {}
  }
});


ciContainer.addIdentity('t1eb4n-work-boomtown', 'purple', 'briefcase');

/**
 * Private acts differently as it deletes cookies / local storage when no tabs are left.
 */
const privateListeners = {};

webext.tabs.onUpdated.addListener((tabId, updateInfo, tab) => {
  const currentContainer = ciContainer.getContextByCookieStoreID(tab.cookieStoreId);
  const cookieStoreId    = currentContainer.cookieStoreId;

  if(!currentContainer.isPrivate) {
    return;
  }

  privateListeners[cookieStoreId]          ||= {};
  privateListeners[cookieStoreId].tabs     ||= new Set();
  privateListeners[cookieStoreId].listener ||= async (removedTabId) => {
    if(privateListeners[cookieStoreId].tabs.has(removedTabId)) {
      privateListeners[cookieStoreId].tabs.delete(removedTabId);
    }

    if(privateListeners[cookieStoreId].tabs.size === 0) {
      await webext.browsingData.remove({cookieStoreId}, {cookies: true, localStorage: true});
      webext.tabs.onRemoved.removeListener(privateListeners[cookieStoreId].listener);
      delete privateListeners[cookieStoreId];
    }
  }

  privateListeners[cookieStoreId].tabs.add(tabId);

  if(!webext.tabs.onRemoved.hasListener(privateListeners[cookieStoreId].listener)) {
    webext.tabs.onRemoved.addListener(privateListeners[cookieStoreId].listener);
  }
});

ciContainer.addIdentity('t1eb4n-private', 'red', 'fence', false, true);

export default ciContainer;