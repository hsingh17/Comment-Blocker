// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

browser.runtime.onInstalled.addListener(() => {
  console.log("hello from background script!");
});

browser.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    if (tab.url?.indexOf("youtube.com") != -1) {
      alert("Youtube load complete");
    }
  }
});
