# README

## Plan

- Background Script / Service Worker
  - Context Menu Event
    - Listens for click on context menu
    - Fires block-comment event to content script
    - Stores PFP, account name, and video to storage
  - On Tab Change/Youtube Video Change
    - Send block-comments message to content script
    - Need to update counts in storage of any blocked comments
  - Power on/off
    - Add/Remove background script and content script or somehow toggle the extension
- Content Script
  - Script should only attach on youtube.com paths
  - Script will receive messages from the background script/service worker
  - block-comments event
    - For when youtube video is initially loaded
    - Upon receiving a message, the content script will look at the current page and scan the current comment thread for comments and remove them from the comment thread
  - block-comment event
    - Fires when context menua action is fired
    - Upon receiving a message, content script removes the particular comment
- Extension Menu/Popup
  - Will show blocked comments on the currently open youtube video; if no youtube video is open, shows some empty state
    - Blocked comment shows image, account name, comment made
  - Settings gear to get to settings page
  - Power Button/Toggle to turn extension on and offs
  - Report issue button that goes to GitHub issues
- Right Click/Context Menu
  - Right clicking on a comment will add an option to block the comment
  - Listener in background script waits for that event then will call content script to remove that particular comment out
- Settings Page
  - Shows users blocked
    - For each user show: PFP, account name, count of how many times you've seen them (length of videos), and watch videos they've appeared on
  - Can remove users
- Probably need to look into YouTube API
