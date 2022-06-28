(function() {
  /**
   * refresh button
   */
  const refreshElement = document.createElement('div');
  refreshElement.id = 'refreshButton';
  refreshElement.onclick = () => window.location.reload(true);

  document.body.appendChild(refreshElement);
})();