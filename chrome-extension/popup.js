const background = chrome.extension.getBackgroundPage();
background.getGitUrl(gitUrl => {
    background.getLocalDir(gitUrl, localDir => {
        background.runNativeGit(gitUrl, localDir)
        // TODO: 1. 调用外部 git clone
            //   2. 展示进度和结果
    })
})
