function onContextMenuItemClick(
  info: browser.contextMenus.OnClickData,
  tab?: browser.tabs.Tab
) {
  console.log(info, tab);
}

function createContextMenus() {
  const documentUrlPatterns = ["*://*.youtube.com/*"];

  browser.contextMenus.create({
    id: "block-comment",
    title: "Block Comment",
    documentUrlPatterns: documentUrlPatterns
  });

  browser.contextMenus.create({
    id: "block-user",
    title: "Block User",
    documentUrlPatterns: documentUrlPatterns
  });

  browser.contextMenus.onClicked.addListener(onContextMenuItemClick);
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

browser.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

browser.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfo.status !== "complete" || tab.url?.indexOf("youtube") === -1) {
    return;
  }

  console.log(tab, changeInfo, tab.url);
});
