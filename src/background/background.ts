import { YT_EMOJIS } from "../constants";
import type {
  CommentRecord,
  ContextMenuMessage,
  Message,
  UserRecord
} from "../types";
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

const DB_TABLE_NAMES = {
  user: "user",
  comment: "comment"
};

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

let DB: IDBDatabase;

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function blockUserOrComment(userBlockedInd: "Y" | "N") {
  const transaction = DB.transaction(["user", "comment"], "readwrite");
  const userObjStore = transaction.objectStore("user");
  const commentsObjStore = transaction.objectStore("comment");
  const username = CONTEXT_MENU_MSG?.data?.username;
  const videoId = CONTEXT_MENU_MSG?.data?.videoId;
  const comment = CONTEXT_MENU_MSG?.data?.comment;

  if (!username || !videoId || !comment) {
    return;
  }

  // Check if user is already stored. If no user, save to users object store
  userObjStore.get(username).onsuccess = (ev: Event) => {
    const result: UserRecord | null = (ev.target as IDBRequest)?.result;
    const updating = result?.blockedInd === "N" && userBlockedInd === "Y";

    // NOOP: user exists and we're not trying to block the user
    if (result && !updating) {
      return;
    }

    const userRecord: UserRecord = {
      username: username,
      blockedInd: userBlockedInd,
      profilePictureUrl: CONTEXT_MENU_MSG?.data?.profilePictureUrl,
      createdOn: new Date()
    };

    userObjStore.put(userRecord);
  };

  // Now save comment
  const commentRecord: CommentRecord = {
    comment: comment,
    videoId: videoId,
    username: username,
    createdOn: new Date()
  };

  commentsObjStore.put(commentRecord);
}

function onContextMenuItemClick(info: browser.contextMenus.OnClickData) {
  if (CONTEXT_MENU_MSG && CONTEXT_MENU_MSG.data) {
    blockUserOrComment(info.menuItemId === "block-user" ? "Y" : "N");
  }
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

function createContextMenus() {
  browser.contextMenus.create(BLOCK_COMMENT_CTX_MENU_PROPS);
  browser.contextMenus.create(BLOCK_USER_CTX_MENU_PROPS);
  browser.contextMenus.onClicked.addListener(onContextMenuItemClick);
  console.log(YT_EMOJIS);
}

function createSchema(this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
  const db = (ev.target as IDBOpenDBRequest).result;
  db.createObjectStore(DB_TABLE_NAMES.user, { keyPath: "username" });

  const commentsObjStore = db.createObjectStore(DB_TABLE_NAMES.comment, {
    keyPath: "commentId",
    autoIncrement: true
  });
  commentsObjStore.createIndex("videoId", "videoId", { unique: false });
  commentsObjStore.createIndex("username", "username", { unique: false });
}

function handleDbCreateError(this: IDBRequest<IDBDatabase>) {
  console.error("Could not instantiate IndexedDB instance.");
}

function setDb(this: IDBRequest<IDBDatabase>, ev: Event) {
  DB = (ev.target as IDBOpenDBRequest).result;
}

function initDb() {
  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = handleDbCreateError;
  request.onupgradeneeded = createSchema;
  request.onsuccess = setDb;
}

function onInstalled() {
  createContextMenus();
  initDb();
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
