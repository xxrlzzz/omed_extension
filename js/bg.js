function bgtest()
{
	alert("background的bgtest函数！");
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自content-script的消息：');
	console.log(request, sender, sendResponse);
	sendResponse('我是background，我已收到你的消息：' + JSON.stringify(request));
});

// backgrond向context_scripts发送消息
function TT(){
	
	sendMessageToContentScript('context_scripts你好，我是backgrond！', (response) => {
	if(response) alert('backgrond收到来自content-script的回复：'+response);
	});
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}
