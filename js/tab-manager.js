import webext from './shim';
import ci from './contextual-identities';

export default class TabManager {
  constructor() {
    this.tabs              = [];
    this.updateListeners   = [];
    this.stateUpdatePaused = false;

    this.reloadTabsFromBrowser();
    webext.tabs.onRemoved.addListener(this.reloadTabsFromBrowser.bind(this));
    webext.tabs.onCreated.addListener(this.reloadTabsFromBrowser.bind(this));
    webext.tabs.onDetached.addListener(this.reloadTabsFromBrowser.bind(this));
    webext.tabs.onActivated.addListener(this.reloadTabsFromBrowser.bind(this));
    webext.tabs.onUpdated.addListener(this.reloadTabsFromBrowser.bind(this));
  }

  async reloadTabsFromBrowser() {
    const windowInfo = await webext.windows.getCurrent({populate: true});

    return this.setTabs(windowInfo.tabs);
  }

  async createTab(cookieStoreId = null) {
    if(null === cookieStoreId) {
      const currentTabActiveTab = this.tabs.filter(tab => tab.active === true)[0];
      cookieStoreId = (currentTabActiveTab.cookieStoreId !== 'firefox-default') ?
        currentTabActiveTab.cookieStoreId : 
        ci.getDefaultContext().cookieStoreId;
    }

    await webext.tabs.create({
      cookieStoreId
    });
    this.reloadTabsFromBrowser();
  }

  async setTabs(newTabs, compare = false) {
    if(compare && !this.tabsChanged(newTabs)) {
      return this;
    }

    this.stateUpdatePaused = true;
    for(let index = 0; index <= newTabs.length - 1; index++) {
      if(newTabs[index].index !== index) {
        await browser.tabs.move(newTabs[index].id, {index});
        newTabs[index].index = index;
      }
    }
    this.tabs = newTabs;

    this.stateUpdatePaused = false;
    return this.fireUpdate();
  }

  onUpdate(callback) {
    this.updateListeners.push(callback);
    return this;
  }

  fireUpdate() {
    if(this.stateUpdatePaused === true) return this;

    console.log('Firing update event.');

    this.updateListeners.forEach(listener => setTimeout(() => listener(this.tabs), 0));
    return this;
  }

  tabsChanged(newTabs) {
    let changed = false;

    newTabs.forEach((tab, index) => {
      if(this.tabs[index].id !== tab.id) {
        changed = true;
      }
    });

    this.tabs.forEach((tab, index) => {
      if(newTabs[index].id !== tab.id) {
        changed = true;
      }
    });

    return changed;
  }
}