"use strict";

(function() {
  /** Make links open in a new tab **/
  document.querySelectorAll('.titlelink').forEach(elem => {
    /** Open in new tab **/
    elem.target = '_blank';

    const url = new URL(elem.href);

    /** Add favicons **/
    const favicon   = document.createElement('img');
    favicon.style   = 'height: 16px; width: 16px; margin-right: 5px; float: left;';
    favicon.src     = `${url.origin}/favicon.ico`;
    favicon.onerror = () => favicon.src = webext.runtime.getURL('imgs/icon.512.png');

    elem.prepend(favicon);
  });
})();