import React from 'react';
import ReactDOM from 'react-dom/client';
import TabContainer from './sidebar/tab-container';
import webext from './shim';

class Sidebar extends React.Component {
  async refresh() {
    await webext.runtime.reload();
    window.location.reload();
  }

  render() {
    return (
      <div>
        <TabContainer />
        <div id="refreshButton" onClick={this.refresh} />
      </div>
    );
  }
}

(function () {
  const root = ReactDOM.createRoot(document.getElementById('sidebar-container') || document.body);
  root.render(<Sidebar />);
})();
