GITHUB = "^https://github.com/(.+?)/(.+?)(?:/.+)?$";

chrome.runtime.onInstalled.addListener(details => {
  // 注册支持的页面
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          // Github
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: GITHUB }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

function getUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        currentWindow: true,
        active: true
      },
      ([tab]) => {
        resolve(tab.url)
      }
    );
  })
}

function runNativeGit(url, localDir) {
  const port = chrome.runtime.connectNative("com.walfud.git_clone");
  port.onMessage.addListener(msg => {
    console.log(msg);
  });
  port.onDisconnect.addListener(() => {
    console.log("Disconnected");
  });
  port.postMessage(['git', 'clone', url, localDir]);
}

function save(targets) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(
      {
        targets: JSON.stringify(targets)
      },
      () => resolve()
    )
  })
}

function retrieve() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['targets'], (result) => {
      try {
        const targets = JSON.parse(result.targets)
        if (Array.isArray(targets)) {
          resolve(targets)
        } else {
          reject('Restore fail: target is not an array')
        }
      } catch (err) {
        reject(err.message)
      }
    })
  })
}