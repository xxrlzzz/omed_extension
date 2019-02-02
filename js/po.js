
// popup调用background的js函数
$('#bg').click(() => {
	//alert("调用background的js函数");
	var bg = chrome.extension.getBackgroundPage();
	console.log(123123, bg)
	bg.bgtest();
});

 // popup主动发消息给content-script
$('#con').click(() => {
	alert("popup发送消息给content-script");
	sendMessageToContentScript('你好，我是popup！', (response) => {
		if(response) alert('收到来自content-script的回复：'+response);
	});
});

// popup调用background的js函数
$('#bgtocon').click(() => {
	var bg = chrome.extension.getBackgroundPage();
	bg.TT();
});

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