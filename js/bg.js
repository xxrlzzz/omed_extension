chrome.contextMenus.create({
	id: 'open_in_ide',
	title: '使用ide打开',
	contexts: ['link']
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
	switch (info.menuItemId) {
		case 'open_in_ide':
			var url = info.linkUrl
			params = url.split(':')[2].split(';')
			filepath = params[0]
			line = params[params.length - 1].split('=')[1]
			line = parseInt(line.split('?')[0])
			if (!line) {
				line = 0
			}
			$.get('http://127.0.0.1:8989/file?f=' + filepath + '&l=' + line)
			break;
	}
})

// onUpdated should fire when the selected tab is changed or a link is clicked 
// 该函数解析URL中的 l={};query={} 参数
// 从而激活l行中query对应的字符串的link  达到触发索引的效果
// note: 1.注意有些link是跳转, 暂时不对这两种情况区别
// 2.使用settimeout, 在加载完成后一段时间才点击link, 
// 因为网页是动态生成的, 等待的时间就是假设网页已经生成完成
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	chrome.tabs.getSelected(null, function (tab) {
		myURL = tab.url;
		params = myURL.split(";")
		var queryStr, lineNum
		for (var param of params) {
			kv = param.split('=')
			if (kv[0] == 'query') {
				queryStr = kv[1].split("?")[0]
			} else if (kv[0] == 'l') {
				lineNum = kv[1]
			}
		}
		if (queryStr != null && lineNum != null) {
			let code = `
			var opened = false;
			window.addEventListener("load", ()=> {
				if (opened) return; 
				opened = true;
				setTimeout(()=>{ 
					
					var container = document.getElementsByTagName("code-container")
					// document.get()
					if (container.length > 0 ) {
						var linklist = container[0].getElementsByTagName("div")[${lineNum}-1].getElementsByTagName("a");
						for (item of linklist) {
							if (item.innerText.search("${queryStr}") != -1) {
								item.click();
								console.log("${queryStr} has found");
								return
							}
						}
					}
				}, 1500)
			})`;
			// http://infoheap.com/chrome-extension-tutorial-access-dom/
			chrome.tabs.executeScript(tabId, { code }, () => { });
		}
	});
});
