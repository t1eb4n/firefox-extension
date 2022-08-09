class ContextualIdentities {
  constructor() {
    this.identities = {};
  }

  async addIdentity(name, color, icon, isDefault = false, isPrivate = false) {
    let identity = await browser.contextualIdentities.query({name});

    if(identity.length === 0) {
      identity = await browser.contextualIdentities.create({name, color, icon});
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
browser.tabs.onUpdated.addListener(async (tabId, updateInfo, tab) => {
  const defaultCookieId = ciContainer.getDefaultContext().cookieStoreId;
  const currentContainer = ciContainer.getContextByCookieStoreID(tab.cookieStoreId);

  if(currentContainer === undefined && updateInfo.url !== undefined && updateInfo.url.indexOf('about:') !== 0) {
    try {
      await browser.tabs.create({
        cookieStoreId: defaultCookieId,
        url: updateInfo.url,
        index: tab.index
      });
      await browser.tabs.remove(tabId);
    } catch {}
  }
});


ciContainer.addIdentity('t1eb4n-work-boomtown', 'purple', 'briefcase');

/**
 * Private acts differently as it deletes cookies / local storage when no tabs are left.
 * 
 * Currently this deletes all private contexts cookies and local storage for every private context every time a tab gets
 * closed. Ideally, there would be a listener for each of the private contexts that gets attached / removed when they
 * are needed. This can happen in the future.
 */
ciContainer.addIdentity('t1eb4n-private', 'red', 'fence', false, true);
browser.tabs.onRemoved.addListener((tabId) => {
  ciContainer.getPrivateContexts().forEach(async context => {
    const tabs = await browser.tabs.query({cookieStoreId: context.cookieStoreId});

    if(tabs.length === 0) {
      await browser.browsingData.remove({cookieStoreId: context.cookieStoreId}, {cookies: true, localStorage: true});
    }
  });
});

export default ciContainer;