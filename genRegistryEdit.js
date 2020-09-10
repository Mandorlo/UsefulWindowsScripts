/**
 * This script generates a .reg file to add the explorer's context menu items needed
 * 
 */

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const {searchFolder, getCommentVars} = require('./libjs/file');

// template path
const template_path = path.resolve(__dirname, './ExplorerMenuInstallScriptsTemplate.reg');
const out_file = path.resolve(__dirname, './out.reg');

// find execution paths for NodeJS, Python
let exec_path = {
    js: process.execPath,
    py : findPythonExec(),
    ps1: 'Powershell.exe -File',
}
console.log(exec_path)

function gen() {
    let data = {
        images: {
            jpg: getCommandsFromFolder(path.resolve(__dirname, './images/jpg')),
        },
        pdf: getCommandsFromFolder(path.resolve(__dirname, './pdf')),
        video: getCommandsFromFolder(path.resolve(__dirname, './video')),
    }
    console.log("data", data)
    let content = ejs.render(fs.readFileSync(template_path, 'utf8'), data);
    fs.writeFileSync(out_file, content, 'utf8');
}
gen()

 
function getCommandsFromFolder(folder_path) {
    let scripts_path = searchFolder(folder_path, /(^|\\)script\_.+\.(py|js|ps1)$/i, {filesOnly: true});
    console.log('scripts', scripts_path)

    function getCommand(path) {
        let ext = /\.([^\.]+)$/gi.exec(path)[1];
        let v = getCommentVars(path);
        if (!v.title) {
            console.log('Unknown title for command', path); 
            return null;
        }
        if (!v.icon) v.icon = "cmd.exe,0";
        if (!v.command) v.command = '\\"%1\\"';
        v.command = `${exec_path[ext].replace(/\\/g, "\\\\")} \\"${path.replace(/\\/g, "\\\\")}\\" ${v.command}`;

        return {
            commandname: /(^|\\)script_([^\.]+)\..+/gi.exec(path)[2],
            ...v,
        }
    }

    let commands = [];
    for (let path of scripts_path) {
        let co = getCommand(path)
        if (co) commands.push(co)

        // other commands
        for (let attr in co) {
            if (attr[0] != '-') continue;
            let ext = /\.([^\.]+)$/gi.exec(path)[1];
            c = `${exec_path[ext].replace(/\\/g, "\\\\")} \\"${path.replace(/\\/g, "\\\\")}\\" ${co[attr]}`;
            commands.push({title: attr.substr(1), command: c, icon: 'cmd.exe,0'})
        }
    }
    console.log("commands", commands)
    return commands;
}
 
function findPythonExec() {
    let python_folders = process.env.PATH.split(';').filter(el => /python[^\\]+\\$/gi.test(el)).sort().reverse();
    for (let p of python_folders) {
        let py_exec = searchFolder(p, /\\py(thon)\.exe$/gi, {recursive: false, filesOnly: true});
        if (py_exec.length) return py_exec[0];
    }
}