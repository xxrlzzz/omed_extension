
const url_btn = document.getElementById("url_btn")
const msg_span = document.getElementById("message")
const ide_select = document.getElementById("ide_select")
const cur_ide = document.getElementById("cur_ide")


url_btn.addEventListener("click", () => {
  let ide = ide_select.options[ide_select.selectedIndex].value
  console.log(ide)
  chrome.storage.sync.set({ide:ide}, ()=>{})
  cur_ide.value = ide
})