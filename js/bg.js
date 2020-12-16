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
