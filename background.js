
class ChromiumHandler {
	// https://source.chromium.org/chromium/chromium/src/+/master:cc/animation/animation.h;l=9	
	constructor(url) {
		this.url = url
		debugger
		url = url.replace("https://source.chromium.org/","")
		url = url.split(':')
		let projectAndBranch = url[0]
		projectAndBranch = projectAndBranch.split('/+/')
		let branch = projectAndBranch[1]
		let project = projectAndBranch[0]
		if (!branch || !project) return 
		url = url[1]
		if (!url) return

		let file = url.split(';')[0]
		let line = url.split(';l=')[1].split(';')[0].split("?")[0]
		if (!file) return

		if (!line)
			line = "1";
		this.file = file
		this.line = line
		this.branch = branch
		this.project = project
		// this.mode = "chromium"
		this.success = true
	}
}

class GithubHandler {
	// https://github.com/sxei/chrome-plugin-demo/blob/master/full-chrome-plugin-demo/devtools.html#L2
	// https://gitee.com/antv/f2/blob/master/README.md

	constructor(url) {
		this.url = url

		url = url.split('/blob/')

		let project = url[0].replace("https://github.com/", "")
		if (!project) return

		url = url[1]

		let pos = url.indexOf('/')
		if (pos == -1) return
		let branch = url.substring(0,pos)
		if (!branch)	return 
		url = url.substring(pos+1)

		url = url.split("#L")

		let file = url[0]
		let line = url[1]
		if (!file) return;
		if (!line)
			line = "1";
		this.file = file
		this.line = line
		this.branch = branch
		// this.mode = "github"
		this.project = project
		this.success = true
	}
}

const handlerMap = {
	"github": GithubHandler,
	"gitee": GithubHandler,
	"chromium": ChromiumHandler,
}

function GetHandler(url) {
	if (url.startsWith('https://github.com/')) {
		return GithubHandler
	} else if (url.startsWith('https://gitee.com/')) {
		return GithubHandler
	} else if (url.startsWith('https://source.chromium.org/')) {
		return ChromiumHandler
	}
}

// type 1 for json to get, 2 for get to json
function Json2Get(json){
	let str = `file=${json.file}&line=${json.line}&branch=${json.branch}&ide=${json.ide}&project=${json.project}`
	return str
}


function RequestOpen(url,ide) {
	// let url_mode = "chromium"

	let handlerClass = GetHandler(url)

	if (!handlerClass) return

	let handler = new handlerClass(url)

	if (!handler || !handler.success) return
	handler.ide = ide
	console.log("send", handler)
	let param = Json2Get(handler)
	console.log(param)
	let reqUrl = "http://127.0.0.1:8989/file?" + param
	fetch(reqUrl).catch((err) => {
		console.log("err: ", err)
	})
}

chrome.runtime.onInstalled.addListener((_) => {
	let ide = "vscode"

	chrome.contextMenus.create({
		id: 'open_in_editor',
		title: '使用编辑器打开',
		contexts: ['link', 'selection']
	})

	// watch the change of ide
	chrome.storage.onChanged.addListener((changes, namespace) => {
		for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
			if (key == "ide") {
				ide = newValue
				console.log("ide is set to " , ide )
			}
		}
	})

	chrome.contextMenus.onClicked.addListener((info, tab) => {
		switch (info.menuItemId) {
			case 'open_in_editor':
				let url = info.linkUrl;
				if (url == undefined) {
					url = info.pageUrl;
				}
				if (url) {
					console.log(url, "start open")
					RequestOpen(url,ide)
				}
				break
		}
	})

	// onUpdated should fire when the selected tab is changed or a link is clicked 
	// 该函数解析URL中的 l={};query={} 参数
	// 从而激活l行中query对应的字符串的link  达到触发索引的效果
	// note: 
	//   1.注意有些link是跳转, 暂时不对这两种情况区别
	//   2.使用setTimeout, 在加载完成后一段时间才点击link, 
	// 		 因为网页是动态生成的, 等待的时间就是假设网页已经生成完成
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		chrome.tabs.getCurrent((_) => {
			
			myURL = tab.url;
			console.log("update url :", myURL);
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
			if (!queryStr || !lineNum) {
				return
			}

			chrome.storage.local.set({query_str: queryStr, line_num: lineNum}, ()=>{})

			console.log(queryStr + " is the query")
			const code = () => {
				let opened = false;
				console.log(window)
				let queryStr, lineNum
				chrome.storage.local.get(['query_str', 'line_num'], (res) => {
					queryStr = res.query_str
					lineNum = res.line_num
				})
				window.addEventListener("load", () => {
					if (opened) return;
					opened = true;
					setTimeout(() => {
						console.log("debug start")
						var container = document.getElementsByTagName("code-container")
						if (container.length > 0) {
							var linklist = container[0].getElementsByTagName("div")[lineNum - 1].getElementsByTagName("a");
							for (item of linklist) {
								if (item.innerText.search(queryStr) != -1) {
									item.click();
									console.log(queryStr + " has found");
									return
								}
							}
						}
					}, 1500)
				})

				// http://infoheap.com/chrome-extension-tutorial-access-dom/
				// chrome.tabs.executeScript(tabId, { code }, () => { })

				chrome.scripting.executeScript({
					function: code,
					target: {
						tabId: tabId
					}
				}, (result) => { console.log(result) })
			}
		});
	});


})

