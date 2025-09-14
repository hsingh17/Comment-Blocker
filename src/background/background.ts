import { YT_EMOJIS } from "../constants";
import type { ContextMenuMessage, Message } from "../types";
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Globals
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
const DB_NAME = "Blocker";

const DB_VERSION = 1;

const SHARED_CTX_PROPS: browser.contextMenus._CreateCreateProperties = {
  documentUrlPatterns: ["*://*.youtube.com/*"],
  visible: false
};

const BLOCK_COMMENT_CTX_MENU_PROPS: browser.contextMenus._CreateCreateProperties =
  {
    id: "block-comment",
    title: "Block Comment",
    ...SHARED_CTX_PROPS
  };

const BLOCK_USER_CTX_MENU_PROPS: browser.contextMenus._CreateCreateProperties =
  {
    id: "block-user",
    title: "Block User",
    ...SHARED_CTX_PROPS
  };

let CONTEXT_MENU_MSG: ContextMenuMessage | null;

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
  browser.contextMenus.create(BLOCK_COMMENT_CTX_MENU_PROPS);
  browser.contextMenus.create(BLOCK_USER_CTX_MENU_PROPS);
  browser.contextMenus.onClicked.addListener(onContextMenuItemClick);
  console.log(YT_EMOJIS);
}

function handleContextMenuMessage(message: ContextMenuMessage) {
  const updateProps: browser.contextMenus._UpdateUpdateProperties = {};
  CONTEXT_MENU_MSG = message.data ? (message as ContextMenuMessage) : null;
  updateProps.visible = CONTEXT_MENU_MSG !== null;

  browser.contextMenus.update(BLOCK_COMMENT_CTX_MENU_PROPS.id!, updateProps);
  browser.contextMenus.update(BLOCK_USER_CTX_MENU_PROPS.id!, updateProps);
}

function handleMessage(message: Message) {
  if (message.messageType === "context-menu") {
    handleContextMenuMessage(message as ContextMenuMessage);
  }
}

function createSchema(this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
  const db = (ev.target as IDBOpenDBRequest).result;
  const objStore = db.createObjectStore("comments", { keyPath: "" });
  console.log(objStore);
}

function handleDbCreateError(this: IDBRequest<IDBDatabase>) {
  console.error("Could not instantiate IndexedDB instance.");
}

function createDb() {
  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = handleDbCreateError;
  request.onupgradeneeded = createSchema;
}

function onInstalled() {
  createContextMenus();
  createDb();
}
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Listeners
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
browser.runtime.onInstalled.addListener(onInstalled);

browser.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfo.status !== "complete" || tab.url?.indexOf("youtube") === -1) {
    return;
  }
  // TODO: Only do stuff if on an actual video or short

  console.log(tab, changeInfo, tab.url);
});

browser.runtime.onMessage.addListener(handleMessage);
