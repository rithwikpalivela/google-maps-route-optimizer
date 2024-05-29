// document.getElementById('sendMessageButton').addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.tabs.sendMessage(tabs[0].id, { type: "greet" }, (response) => {
//             console.log("Response from content script in popup:", response);
//         });
//     });
// });