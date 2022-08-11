import React from 'react';
import { ReactSortable } from "react-sortablejs";
import Tab from './tab';
import TabManager from '../tab-manager';

export default class TabContainer extends React.Component {
  constructor(props) {
    super(props);

    this.tabManager = new TabManager();

    this.state = {
      tabs: this.tabManager.tabs
    };
  }

  async componentDidMount() {
    this.tabManager.onUpdate((tabs) => this.setState({tabs}));
  }

  render() {
    return <div>
      <h2 id="tabsHeader" className="sidebarSectionHeader">
        Tabs
        <i id="addTab" className="fi fi-plus-a" onClick={() => this.tabManager.createTab()} />
      </h2>
      <ReactSortable id="tabs" list={this.state.tabs} setList={(newState) => this.tabManager.setTabs(newState, true)}>
        {this.state.tabs.map(tab => <Tab key={tab.id} tab={tab} />)}
      </ReactSortable>
    </div>
    ;
  }
}