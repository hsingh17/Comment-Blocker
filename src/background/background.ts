// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Types
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
function blockComment() {}

function blockUser() {}

function onContextMenuItemClick(info: browser.contextMenus.OnClickData) {
  if (info.menuItemId === "block-comment") {
    blockComment();
  } else if (info.menuItemId === "block-user") {
    blockUser();
  }
}

function createContextMenus() {
  const shared = {
    documentUrlPatterns: ["*://*.youtube.com/*"],
    enabled: false
  };

  browser.contextMenus.create({
    id: "block-comment",
    title: "Block Comment",
    ...shared
  });

  browser.contextMenus.create({
    id: "block-user",
    title: "Block User",
    ...shared
  });

  browser.contextMenus.onClicked.addListener(onContextMenuItemClick);
}

function handleMessage(
  message: unknown,
  sender: browser.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) {
  console.log(message, sender, sendResponse);
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Listeners
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
browser.runtime.onInstalled.addListener(createContextMenus);

browser.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfo.status !== "complete" || tab.url?.indexOf("youtube") === -1) {
    return;
  }

  console.log(tab, changeInfo, tab.url);
});

browser.runtime.onMessage.addListener(handleMessage);
