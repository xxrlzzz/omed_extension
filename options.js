function generateRow(conf) {
    if (conf == undefined) {
        conf = {}
    }
    if (conf.name == undefined) {
        conf.name = ""
    }
    if (conf.path == undefined) {
        conf.path = ""
    }
    const html = `
        <tr class="tableRow">
            <td>
                <select style="width:90%">
                    <option value="github" selected>github</option>
                    <option value="chromium">chromium</option>
                </select>
            </td> 
            <td>
                <input style="width:90%" value="${conf.name}">
            </td>
            <td>
                <input style="width:90%" value="${conf.path}">
            </td>
        </tr>
    `
    return html
}

function saveOptions() {
    let configs = []
    $(".tableRow").each((idx, ele) => {
        let children = $(ele).children("td")
        let project_type = $("select :selected").val()
        let project_name = $($(children[1]).children("input")[0]).val()
        let project_path = $($(children[2]).children("input")[0]).val()
        console.log(project_type, project_name, project_path)

        configs.push({
            type: project_type,
            name: project_name,
            path: project_path
        })
    })

    configs.sort((a, b) => {
        return a.name < b.name
    })
    configs = [...new Set(configs)]
    if (chrome.storage) {
        chrome.storage.local.set({ omedConfig: configs }, () => {
            location.reload();
        })
    } else {
        window.localStorage.setItem('omedConfig', JSON.stringify(configs))
    }
}

function loadConfigs() {
    const onLoadConfig = (configs) => {
        let html = ""
        for (let conf of configs) {
            html += generateRow(conf)
        }
        $(html).appendTo("#configListTable")
    }
    if (chrome.storage) {
        chrome.storage.local.get(['omedConfig'], (result) => {
            onLoadConfig(result.omedConfig)
        })
    } else {
        onLoadConfig(JSON.parse(window.localStorage.getItem('omedConfig')))
    }
}

// 初始化函数
jQuery(function () {

    loadConfigs();
    $("#saveConfig").off("click").on("click", saveOptions)
    $("#addNewLine").off("click").on("click", () => {
        let html = generateRow()
        $(html).appendTo("#configListTable")
    })
    $("#removeLine").off("click").on("click", () => {
        $("#configListTable").children().children().last().remove()
    })
})
