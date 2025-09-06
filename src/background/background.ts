// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "block-comment",
    title: "Block Comment"
  });
});

browser.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfo.status !== "complete" || tab.url?.indexOf("youtube") === -1) {
    return;
  }

  console.log(tab, changeInfo, tab.url);
});
