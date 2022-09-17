

const App = chrome.runtime.getManifest();
jQuery(() => {

  const cur_ele_ele = $("#cur_ide")
  let selected_ide = "vscode"

  if (chrome.storage) {
    chrome.storage.sync.get(['ide', 'enableScheme'], (result) => {
      console.log("get config ", result)
      if (result.ide) {
        cur_ele_ele.text(result.ide)
        cur_ele_ele.parent().show()
        selected_ide = result.ide
      }

      $("#checkInput").prop("checked", result.enableScheme != false)
    })
  }

  $("#url_btn").off("click").on("click", () => {
    let new_selected_ide = $("option:selected")[0].value
    if (new_selected_ide == selected_ide) {
      return
    }
    console.log("set ide to " + new_selected_ide)
    chrome.storage.sync.set({ ide: new_selected_ide })
    cur_ele_ele.text(new_selected_ide)
    cur_ele_ele.parent().show()
    selected_ide = result.ide
  })


  $("#checkLabel").off("click").on("click", () => {
    let allow = !$("#checkInput").is(':checked')

    console.log("set enableScheme to " + allow)
    chrome.storage.sync.set({ enableScheme: allow })
  })

  // 配置选项
  $("#open_setting").off('click').on('click', () => {
    let fullUrl = chrome.runtime.getURL("./options.html");
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      for (let i in tabs) { // check if Options page is open already
        if (tabs.hasOwnProperty(i)) {
          let tab = tabs[i];
          if (tab.url == fullUrl) {
            chrome.tabs.update(tab.id, { selected: true }); // select the tab
            return;
          }
        }
      }
      chrome.tabs.create({ url: fullUrl, });
    });
  });

})
