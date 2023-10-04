function updateBadge() {
    chrome.tabs.query({active: true, currentWindow: true, highlighted: true}, function (tabs) {
        if (tabs && tabs[0] && tabs[0].url) {
            const tab = tabs[0];
            chrome.cookies.get({url: tab.url, name: "no_cache"}, function (cookie) {
                if (cookie && cookie.value === "true") {
                    chrome.action.setBadgeText({text: 'no_cache'});
                    chrome.action.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
                } else {
                    chrome.action.setBadgeText({text: ''});
                    //chrome.action.setBadgeBackgroundColor({color: [0, 128, 0, 255]});
                }
            });
        }
    });
}

// On tab activation ensure the badge is rendered properly, only if you already have permissions to avoid spam asking
chrome.tabs.onActivated.addListener(function () {
    chrome.tabs.query({active: true, currentWindow: true, highlighted: true}, function (tabs) {
        if (tabs && tabs[0] && tabs[0].url) {
            chrome.permissions.contains({ origins: [tabs[0].url] }, function (result) {
                updateBadge();
            });
        }
    });
});

// Watch for changes to the cookie and update the badge
chrome.runtime.onInstalled.addListener(function () {
    chrome.cookies.onChanged.addListener(function (changeInfo) {
        if (changeInfo.cookie.name === "no_cache") {
            updateBadge();
        }
    });
});

// Handle toggling of the cookie
chrome.action.onClicked.addListener(function () {
    chrome.tabs.query({active: true, currentWindow: true, highlighted: true}, function (tabs) {
        if (tabs && tabs[0] && tabs[0].url) {
            const tab = tabs[0];
            chrome.cookies.get({url: tab.url, name: "no_cache"}, function (cookie) {
                if (cookie && cookie.value === "true") {
                    chrome.cookies.remove({url: tab.url, name: "no_cache"});
                } else {
                    const oneHourInSeconds = 3600;
                    const expirationTime = Math.floor(Date.now()
                        / 1000) + oneHourInSeconds;
                    const cookieDetails = {
                        url: tab.url,
                        name: "no_cache",
                        value: "true",
                        expirationDate: expirationTime,
                    };
                    chrome.cookies.set(cookieDetails);
                }
            });
        }
    });

});
