const fs    = require('fs');
const path  = require('path');



/**
 * 
 * @param string file_path 
 */
function getCommentVars(file_path) {
    if (!fs.existsSync(file_path)) return {error: 'File '+file_path+' does not exist on disk'};
    
    // get file content
    let content = fs.readFileSync(file_path, 'utf8')

    // get file extension
    let ext = /\.([^\.]+)$/gi.exec(file_path)
    if (!ext) return {}
    ext = ext[1].toLocaleLowerCase();
    
    // get file content header
    let content_header;
    if (ext == 'py') { // py
        content_header = /^[^\']*\'\'\'([.\s\S]+)?\'\'\'/i.exec(content)
        if (!content_header) return {}
        content_header = content_header[1]
    } else if (ext == "ps1") { // ps1
        content_header = /^[^\<]*\<\#([.\s\S]+)?\#\>/i.exec(content)
        if (!content_header) return {}
        content_header = content_header[1]
    } else { // js like comment
        content_header = /^\s*\/\*\*([.\s\S]+)?\*\//i.exec(content)
        if (!content_header) return {};
        content_header = content_header[0].trim();
    }

    // get variables in content header
    let result = {}
    for (let line of content_header.split("\n")) {
        let n = line.indexOf(":");
        if (n < 0) continue;
        result[line.substr(0, n).replace(/^\s*[\*\#]?\s*/, '').trim()] = line.substr(n+1).trim();
    }

    return result;
}
exports.getCommentVars = getCommentVars;


/**
 * 
 * @param string root_dir 
 * @param string|RegExp|function filter 
 * @param {} opt 
 */
function searchFolder(root_dir, filter, opt = {}) {
    // options 
    opt = {
        recursive: true,
        filesOnly: false,
        ...opt,
    }
    root_dir = path.resolve(root_dir);

    // search function
    if (typeof filter == 'string') fn = (el, stat) => el == filter;
    else if (filter instanceof RegExp) fn = (el, stat) => filter.test(el);

    let result = [];
    let files = fs.readdirSync(root_dir);

    for (let i = 0; i < files.length; i++) {
        let filename = path.join(root_dir, files[i]);
        let stat = fs.lstatSync(filename);

        if (stat.isDirectory() && opt.recursive){
            result = result.concat(searchFolder(filename, fn, opt)); //recurse
        }
        else if (fn(filename, stat)) {
            result.push(filename);
        };
    };

    return result;
}
exports.searchFolder = searchFolder;


let res = getCommentVars('./video/script_addsubs.py')
console.log(res);