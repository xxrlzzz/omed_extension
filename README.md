## OMED

![GitHub](https://img.shields.io/github/license/xxrlzzz/omed_extension)

Accord to the link url to send request to open in IDE

the [idea](https://chaopeng.me/blog/2017/03/02/Chrome-Dev-Tools.html) from

## we now support 

- ide: jetbrain[clion,goland,idea], vscode (make sure they are in your path)
- codebase: github(gitee), source.chromium

## how to use

1. run [server](https://github.com/xxrlzzz/omed_server) in background

2. install extension to chrome

3. use in codebase website
  - right click a link 
  - right click on selected text
    
4. it will send request to the server and server try to open code in your ide

## open by url schema

vscode support `vscode://file/` format to open from browser, we also support that.
