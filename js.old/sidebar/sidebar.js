(function() {
  /**
   * refresh button
   */
  const refreshElement = document.createElement('div');
  refreshElement.id = 'refreshButton';
  refreshElement.onclick = async () => {
    await browser.runtime.reload();
    window.location.reload(true);
  };

  document.body.appendChild(refreshElement);
})();