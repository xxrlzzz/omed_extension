// V3 is not support multi-script so we keep everything in this file

class ChromiumHandler {
	// https://source.chromium.org/chromium/chromium/src/+/master:cc/animation/animation.h;l=9	
	constructor(url) {
		this.url = url
		url = url.replace("https://source.chromium.org/", "")
		url = url.split(':')
		let projectAndBranch = url[0]
		projectAndBranch = projectAndBranch.split('/+/')
		let branch = projectAndBranch[1]
		let project = projectAndBranch[0]
		if (!branch || !project) return
		url = url[1]
		if (!url) return

		let file = url.split(';')[0]
		let line = url.split(';l=')?.[1]?.split(';')?.[0]?.split("?")[0]
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
		let branch = url.substring(0, pos)
		if (!branch) return
		url = url.substring(pos + 1)

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

let ide = "vscode"
let enableScheme = true
let localProjects = []

function GetHandler(url) {
	if (url.startsWith('https://github.com/')) {
		return new GithubHandler(url)
	} else if (url.startsWith('https://gitee.com/')) {
		return new GithubHandler(url)
	} else if (url.startsWith('https://source.chromium.org/')) {
		return new ChromiumHandler(url)
	}
	return null
}

function SupportScheme(ide) {
	switch (ide) {
		case 'vscode':
			return true
	}
	return false
}

// type 1 for json to get, 2 for get to json
function Json2Get(json) {
	let str = `file=${json.file}&line=${json.line}&branch=${json.branch}&ide=${json.ide}&project=${json.project}`
	return str
}

function OpenByScheme(handler) {
	// https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls
	// vscode://file/{full path to project}/
	// vscode://file/{full path to file}:line:column

	// chrome.tabs.create({ url: "vscode://file/d:/codebase/omed_extension/popup.html", });
	console.log(localProjects, handler)
	for (let lp of localProjects) {
		if (lp.name == handler.project) {
			let url = `vscode://file/${lp.path}/${handler.file}:${handler.line}`
			chrome.tabs.create({ url })
			return true
		}
	}
	return false
}

function RequestOpen(url) {
	let handler = GetHandler(url)

	if (!handler || !handler.success) return
	handler.ide = ide
	console.log("send", handler)

	if (enableScheme && SupportScheme(ide) && OpenByScheme(handler)) {
		return;
	}
	let param = Json2Get(handler)
	console.log(param)
	let reqUrl = "http://127.0.0.1:8989/file?" + param
	fetch(reqUrl).catch((err) => {
		console.log("err: ", err)
	})
}

function OpenQueryForCodeSearch(queryStr, lineNum) {
	let opened = false
	console.log("exec script :", lineNum, queryStr);
	window.addEventListener("load", () => {
		if (opened) return
		opened = true
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
		}, 800)
	})
}

function ParseAndDoQuery(url, tabId) {
	let params = url.split(";")
	let queryStr, lineNum
	for (var param of params) {
		const kv = param.split('=')
		if (kv[0] == 'query') {
			queryStr = kv[1].split("?")[0]
		} else if (kv[0] == 'l') {
			lineNum = kv[1]
		}
	}
	if (!queryStr || !lineNum) {
		return
	}
	console.log("exec script :", lineNum, queryStr);
	chrome.scripting.executeScript({
		func: OpenQueryForCodeSearch,
		args: [queryStr, lineNum],
		target: {
			tabId: tabId
		}
	}, (result) => { console.log("exec result ", result) })
}


chrome.runtime.onInstalled.addListener((_) => {

	chrome.contextMenus.create({
		id: 'open_in_editor',
		title: '使用编辑器打开',
		contexts: ['link', 'selection']
	})

	chrome.storage.local.get(['ide', 'enableScheme', 'omedConfig'], (result) => {
		if (result.ide != undefined) {
			ide = result.ide
		}
		if (result.enableScheme != undefined) {
			enableScheme = result.enableScheme
		}
		if (result.omedConf != undefined) {
			localProjects = result.omedConfig
		}
		console.log("load configs: ", result)
	})

	// watch the change of ide
	chrome.storage.onChanged.addListener((changes, namespace) => {
		for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
			console.log("update key " + key + " to ", newValue)
			if (key == "ide") {
				ide = newValue
			} else if (key == "enableScheme") {
				enableScheme = newValue
			} else if (key == "omedConfig") {
				localProjects = newValue
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
					RequestOpen(url)
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
			let myURL = tab.url;
			if (!myURL.includes("source.chromium.org") && !myURL.includes("cs.android.com")) {
				return;
			}
			ParseAndDoQuery(myURL, tabId)
		});
	});


})

