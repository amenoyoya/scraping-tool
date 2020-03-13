chrome.extension.onMessage.addListener((request, sender, response) => {
  if (request === 'Action') {
    alert('Hello, world');
  }
})