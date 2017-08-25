chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
    saveData(response);
});

function saveData(data) {
    chrome.storage.sync.set({'polyPlannerCourses': data});
}