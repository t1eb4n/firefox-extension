import React from "react";
import ReactDOM from 'react-dom/client';
import TabContainer from "./sidebar/tab-container";

class Sidebar extends React.Component {
  render() {
    return <div>
        <TabContainer />
      </div>
    ;
  }
}

(function() {
  const root = ReactDOM.createRoot(document.body);
  root.render(<Sidebar/>);

  /**
   * refresh button
   */
  const refreshElement = document.createElement('div');
  refreshElement.id = 'refreshButton';
  refreshElement.onclick = () => window.location.reload();

  document.body.appendChild(refreshElement);
})();