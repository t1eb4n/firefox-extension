"use strict";

(function() {
  /** Make links open in a new tab **/
  Array.from(document.getElementsByClassName('titlelink')).forEach(elem => elem.target = '_blank');
})();