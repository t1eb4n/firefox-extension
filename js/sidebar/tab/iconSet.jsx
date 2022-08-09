import React from "react";

export default class TabIconSet extends React.Component {
  render() {
    let identityStyle = {
      background: 'url("chrome://branding/content/icon32.png")',
      backgroundSize: 'contain'
    };
    if(this.props.ci !== undefined) {
      identityStyle = {
        mask: `url("${this.props.ci.iconUrl}") no-repeat 50% 50%`,
        backgroundColor: this.props.ci.colorCode,
        maskSize: 'cover'
      };
    }

    return <div className="tabIcons">
      <i className="tabIdentity" style={identityStyle} />
      <i className="fi fi-close-a tabCloseIcon" onClick={this.props.closeEvent} />
    </div>;
  }
}