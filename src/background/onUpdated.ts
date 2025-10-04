import type { NavigateToNewVideoMessage } from "../types";
import { BLOCKED_USERS, sendMessageToTab, setBlockedUsers } from "./background";

export function onUpdated(
  tabId: number,
  changeInfo: browser.tabs._OnUpdatedChangeInfo,
  tab: browser.tabs.Tab
) {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("youtube") &&
    (tab.url.includes("shorts") || tab.url.includes("v="))
  ) {
    setBlockedUsers(() => {
      const msg: NavigateToNewVideoMessage = {
        messageType: "navigate-new-video",
        data: BLOCKED_USERS
      };

      sendMessageToTab(tab.id, {
        messageType: "navigate-new-video"
      });
    });
  }
}
