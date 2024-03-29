import React from 'react';
import TabFavIcon from './tab/favicon';
import TabTitle from './tab/title';
import TabIconSet from './tab/iconSet';
import ciContainer from '../contextual-identities';
import webext from '../shim';

export default class Tab extends React.Component {
  onClick = async () => {
    if(this.props.tab.active) return;
    await webext.tabs.update(this.props.tab.id, {active: true});
  }

  onClickClose = async (event) => {
    event.stopPropagation();
    await webext.tabs.remove(this.props.tab.id);
  }

  render() {
    const tab       = this.props.tab;
    const ci        = ciContainer.getContextByCookieStoreID(tab.cookieStoreId);
    let color = '';
    if(ci !== undefined) {
      color = ci.color;
    }
    const className = ['tab', 'lineItem', color, tab.active ? 'active' : ''].join(' ');

    return <div className={className} onClick={this.onClick}>
      <TabFavIcon url={tab.favIconUrl} loading={tab.status === 'loading'} />
      <TabTitle title={tab.title} loading={tab.status === 'loading'} />
      <TabIconSet closeEvent={this.onClickClose} ci={ci} />
    </div>
  }
}