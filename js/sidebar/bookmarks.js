/**
 * Notes:
 * Turn off bookmark tool bar on new tab screen
 * - Right click title bar > Bookmarks Toolbar > Never show
 */

(async function() {
  const buildBookmarkElement = (bookmark) => {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.className = 'bookmark';
    bookmarkDiv.addEventListener('click', async () => {
      const tab = await browser.tabs.query({active: true});
      browser.tabs.update(tab[0].id, {url: bookmark.url});
    });

    const url = new URL(bookmark.url);

    const favicon = document.createElement('img');
    favicon.className = 'favicon';
    favicon.src = `${url.origin}/favicon.ico`;
    favicon.onerror = () => {
      favicon.onerror = null;

      favicon.src = '../imgs/icon.512.png';
    }

    const bookmarkTitle = document.createElement('span');
    bookmarkTitle.className = 'bookmarkTitle';
    bookmarkTitle.innerText = bookmark.title;

    bookmarkDiv.appendChild(favicon);
    bookmarkDiv.appendChild(bookmarkTitle);

    return bookmarkDiv;
  };

  const bookmarkContainerName = 't1eb4ns_plugin_bookmarks';
  let tmpContainer = await browser.bookmarks.search({title: bookmarkContainerName});
  let bookmarkContainerId = tmpContainer[0]?.id || 0;

  if(0 === bookmarkContainerId) {
    const tmpContainer = await browser.bookmarks.create({parentId: 'unfiled_____', title: bookmarkContainerName});
    bookmarkContainerId = tmpContainer.id;
  }

  /**
   * Load bookmarks into sidebar
   */
  const sidebarBookmarks = document.getElementById('bookmarks');
  const bookmarks = await browser.bookmarks.getChildren(bookmarkContainerId);

  bookmarks.forEach((bookmark) => {
    const bookmarkElement = buildBookmarkElement(bookmark);
    sidebarBookmarks.appendChild(bookmarkElement);
  });
})();
