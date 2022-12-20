const generateCompletionAction = async (info) => {
    console.log(info)


};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Generate poem about',
        contexts: ['selection'],
    });
});

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
