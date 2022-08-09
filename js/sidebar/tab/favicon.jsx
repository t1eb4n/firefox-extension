import React from 'react';

export default class TabFavIcon extends React.Component {
  static DEFAULT_FAVICON_URL = 'chrome://branding/content/icon32.png';
  static DEFAULT_LOADING_URL = '../imgs/loading.gif';

  render() {
    let imgSrc = this.props.url || TabFavIcon.DEFAULT_FAVICON_URL;
    if(this.props.loading) {
      imgSrc = TabFavIcon.DEFAULT_LOADING_URL;
    }

    return <img className="tabFavIcon" src={imgSrc} />
  }
}