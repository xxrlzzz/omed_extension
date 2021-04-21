class ChromiumHandler {
	// https://source.chromium.org/chromium/chromium/src/+/master:cc/animation/animation.h;l=9	
	constructor(url, branch = "master") {
		this.url = url

		url = url.split(':')[2];
		if (!url) return;

		let file = url.split(';')[0]
		let line = url.split(';l=')[1].split(';')[0]
		if (!file) return;

		if (!line)
			line = 1;
		this.file = file
		this.line = line
		this.branch = branch
		this.mode = "chromium"
		this.success = true
	}
}

class GithubHandler {
	// https://github.com/sxei/chrome-plugin-demo/blob/master/full-chrome-plugin-demo/devtools.html#L2
	// https://gitee.com/antv/f2/blob/master/README.md

	constructor(url, branch = "master") {
		this.url = url

		if (url.indexOf(branch) == -1) return
		url = url.split(`/blob/${branch}/`)

		let project = url[0].replace("https://github.com/", "")
		if (!project) return

		url = url[1].split("#L")

		let file = url[0]
		let line = url[1]
		if (!file) return;
		if (!line)
			line = 1;
		this.file = file
		this.line = line
		this.branch = branch
		this.mode = "github"
		this.project = project
		this.success = true
	}
}

function main() {
  console.log('this is main')
}