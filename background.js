const urlPrefix = "google.com/maps/dir/";

chrome.action.onClicked.addListener(extensionClicked);

function extensionClicked(tab) {
    if (tab.url.includes(urlPrefix)) {
        chrome.tabs.sendMessage(tab.id, {
            type: "NEW",
            locations: tab.url.substring(tab.url.indexOf(urlPrefix) + urlPrefix.length, tab.url.indexOf('@') - 1).split('/'),
            currUrl: tab.url.substring(0, tab.url.indexOf('@') - 1)
        });
    } else {
        alert("Please only use this extension for Google Maps routes.");
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, newUrl } = message;

    if (type === "OPT") {
        chrome.tabs.update({ url: newUrl });
        sendResponse({ status: "Tab opened" });
    }

    return true;
});