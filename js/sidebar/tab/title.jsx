import React from "react";

export default class TabTitle extends React.Component {
  render() {
    return <span className="tabTitle lineContent">
      {this.props.loading ? 'Loading...' : this.props.title}
    </span>;
  }
}