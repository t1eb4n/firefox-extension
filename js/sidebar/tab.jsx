import React from "react";
import TabFavIcon from "./tab/favicon";
import TabTitle from "./tab/title";
import TabIconSet from "./tab/iconSet";
import ciContainer from "../contextual-identities";

export default class Tab extends React.Component {
  onClick = async () => {
    await browser.tabs.update(this.props.tab.id, {active: true});
  }

  onClickClose = async (event) => {
    event.stopPropagation();
    await browser.tabs.remove(this.props.tab.id);
  }

  render() {
    const tab       = this.props.tab;
    const className = ['tab', 'lineItem', tab.active ? 'active' : ''].join(' ');

    return <div className={className} onClick={this.onClick}>
      <TabFavIcon url={tab.favIconUrl} loading={tab.status === 'loading'} />
      <TabTitle title={tab.title} loading={tab.status === 'loading'} />
      <TabIconSet closeEvent={this.onClickClose} ci={ciContainer.getContextByCookieStoreID(tab.cookieStoreId)} />
    </div>
  }
}