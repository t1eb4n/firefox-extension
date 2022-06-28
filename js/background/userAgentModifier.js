(function() {
  console.log('here');

  browser.webRequest.onBeforeSendHeaders.addListener((request) => {
    console.log(request);
  }, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);
})();