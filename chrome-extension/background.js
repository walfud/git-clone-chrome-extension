//// Debug
chrome.storage.sync.set({
  sshUsers: ["walfud"]
});
////
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

function getGitUrl(callback) {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true
    },
    ([tab]) => {
      let matches;
      if ((matches = tab.url.match(GITHUB))) {
        const [_, user, project] = matches;

        chrome.storage.sync.get(["sshUsers"], ({ sshUsers }) => {
          let sshOrHttps = false;
          if (sshUsers) {
            for (let i of sshUsers) {
              if (i === user) {
                sshOrHttps = true;
                break;
              }
            }
          }

          const gitUrl = sshOrHttps
            ? `git@github.com:${user}/${project}.git`
            : `https://github.com/${user}/${project}.git`;
          callback && callback(gitUrl);
        });
      }
    }
  );
}

function getLocalDir(url, callback) {
  callback && callback("./Sir");
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
