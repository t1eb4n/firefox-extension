import React from 'react';
import Tab from './tab';
import ciContainer from '../contextual-identities';
import webext from '../shim';

export default class TabContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabs: []
    };
  }

  async componentDidMount() {
    const deletedTabs = [];
    const windowInfo = await webext.windows.getCurrent({populate: true});
    const loadTabInfo = async () => {
      const tabs = await webext.tabs.query({windowId: windowInfo.id})
      this.setState({ tabs: tabs.filter(tab => !deletedTabs.includes(tab.id)) });
    };

    /** Load tabs initially **/
    await loadTabInfo();

    webext.tabs.onRemoved.addListener(tabId => {
      // Sadly, onActivated/onUpdate will be called right after this,
      // and loadTabInfo will (even async!) will include the tab that's being removed right now (?!!?!?)
      // So we have to track that ID separately so loadTabInfo knows what to exclude.
      // This would break if IDs were recycled :/
      deletedTabs.push(tabId);
      loadTabInfo();
    });

    webext.tabs.onCreated.addListener(loadTabInfo);
    webext.tabs.onDetached.addListener(loadTabInfo);
    webext.tabs.onActivated.addListener(loadTabInfo);
    webext.tabs.onUpdated.addListener(loadTabInfo);
  }

  render() {
    return <div>
      <h2 id="tabsHeader" className="sidebarSectionHeader">
        Tabs
        <i id="addTab" className="fi fi-plus-a" onClick={() => webext.tabs.create({cookieStoreId: ciContainer.getDefaultContext().cookieStoreId})} />
      </h2>
      <div id="tabs">
        {this.state.tabs.map(tab => <Tab key={tab.id} tab={tab} />)}
      </div>
    </div>
    ;
  }
}