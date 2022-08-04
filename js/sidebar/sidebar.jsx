import React from 'react';
import ReactDOM from 'react-dom/client';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabs: [],
    };

  }

  tabClick = (event) => {
    const id = +event.target.parentElement.dataset.id;

    if (!isNaN(id)) {
      browser.tabs.update(id, {active: true});
    }
  }

  tabCloseClick = (event) => {
    event.stopPropagation();

    const id = +event.target.parentElement.dataset.id;

    if (!isNaN(id)) {
      browser.tabs.remove(id);
    }
  }

  async componentDidMount() {
    const deletedTabs = [];
    const windowInfo = await browser.windows.getCurrent({populate: true});
    const loadTabInfo = async () => {
      const tabs = await browser.tabs.query({windowId: windowInfo.id})
      this.setState({ tabs: tabs.filter(tab => !deletedTabs.includes(tab.id)) });
    };

    /** Load tabs initially **/
    await loadTabInfo();

    browser.tabs.onRemoved.addListener(tabId => {
      // Sadly, onActivated/onUpdate will be called right after this,
      // and loadTabInfo will (even async!) will include the tab that's being removed right now (?!!?!?)
      // So we have to track that ID separately so loadTabInfo knows what to exclude.
      // This would break if IDs were recycled :/
      deletedTabs.push(tabId);
      loadTabInfo();
    });

    browser.tabs.onCreated.addListener(loadTabInfo);
    browser.tabs.onDetached.addListener(loadTabInfo);
    browser.tabs.onActivated.addListener(loadTabInfo);
    browser.tabs.onUpdated.addListener(loadTabInfo);
  }

  render() {
    return <div>
      <h2 id="tabsHeader" className="sidebarSectionHeader">Tabs</h2>
      <div id="tabs">{this.state.tabs.map(tab =>
      <div key={tab.id} data-id={tab.id} className={['tab', tab.active ? 'active' : ''].join(' ')} onClick={this.tabClick}>
          <img className="tabFavIcon" src={tab.status === 'loading' ?  '../imgs/loading.gif' : (tab.favIconUrl || 'chrome://branding/content/icon32.png')} />
          <span className="tabTitle">{tab.status === 'loading' ? 'Loading...' : tab.title}</span>
          <img className="tabCloseIcon" src="../imgs/close.png" onClick={this.tabCloseClick}/>
        </div>
      )}</div>

      <hr width="100" />

      <h2 className="sidebarSectionHeader">Bookmarks: </h2>
      <div id="bookmarks"></div>

      <div id="templates">
      </div>

    </div>;
  }
}

(function() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<Sidebar/>);

  /**
   * refresh button
   */
  const refreshElement = document.createElement('div');
  refreshElement.id = 'refreshButton';
  refreshElement.onclick = () => window.location.reload(true);

  document.body.appendChild(refreshElement);
})();
