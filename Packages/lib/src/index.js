#if CJS
    const path = require('path');
#endif

const strRemove = (string, start, end) => {
    return string.slice(0, start) + string.slice(end);
}

const getLineNumber = (string, position) => {
    return [...string.slice(0, position).matchAll(new RegExp(String.fromCharCode(13), 'gi'))].map(l => l.index).length;
}

const noCodeBefore = (code, end) => {
    let lineStart = [...code.slice(0, end).matchAll(new RegExp(String.fromCharCode(13), 'gi'))].map(l => l.index).pop();
    let result = code.slice(lineStart, end);

    result = result.replaceAll(String.fromCharCode(10), ''); // remove newlines
    result = result.replaceAll(String.fromCharCode(13), ''); // remove unquoted chars
    result = result.replaceAll(' ', '');
    
    return !result;
}

/**
 * 
 * @param {string} fileAdress Path or Url of the script (only needed when logging). ex: "C:\\myDir\\file.js" or "mysite.com/myscript?myparam"
 * @returns {string} Name with extention.
 */
const getFilename = (fileAdress) => {
#if CJS

    let url = {};
    try {
        url = new URL(fileAdress);
    } catch {}
    
    return path.basename(url.pathname || fileAdress);
    
#else
    
    let temp = 'Uknown file adress';

    try {
        
        // get name wether path based slash or backslash
        if (fileAdress.includes('\\')) {
            temp = fileAdress.slice(fileAdress.lastIndexOf('\\') + 1);

        } else {
            temp = fileAdress.slice(fileAdress.lastIndexOf('/') + 1);
        }

        // remove url any parameter
        if (temp.includes('?')) {
            temp = temp.slice(0, temp.indexOf('?'));
        }

    } catch {}

    return temp;

#endif
}

/**
 * @param {string} code     The code that  must be processed.
 * @param {Object} options  
 * ```txt
 * log: boolean             Wether to show this plugin's logs or not, like skipped files and number of #if groups found.
 * fileAdress: string       Path or Url of the script (only needed when logging).
 *                          ex: "C:\\myDir\\file.js" or "mysite.com/myscript?myparam"
 * mode: string             Wether directives are written plainly ('plain') or used in a comment ('commented')
 *                          ex: "//#if", "//#else", or "//#post-code let exampleVar = 5;"
 * 
 *                          'commented' -> directives are written plainly
 *                                  ex: "//#if", "//#else", ... or "//#post-code let exampleVar = 5;"
 *                          'plain'     -> directives are written plainly
 *                                  ex: "#if", "#else", ... ("#post-code" not available)
 *                          'both'      -> both techniques at the same time
 * ```
 * @returns {string} Processed code.
 */
const process = (code, options = { mode: 'plain', log: false }) => {

    // options
    if (typeof code != 'string') {
        throw 'Preprocess directives library: Invalid "code" parameter, a string is expected.';
    } else if (typeof options != 'object') {
        throw 'Preprocess directives library: Invalid "options" parameter, a string is expected.';
    }

    options.defines = options.defines?.constructor.name == 'Array' ? options.defines : [];
    options.mode = ['commented', 'both'].includes(options.mode) ? options.mode : 'plain';

    // utility functions
    const conditionalLog = (message) => {
        if (options.log)
            console.log(message);
        return;
    }
    const genDirectiveDefinition = (text, commented = false) => {
        let temp = { statement: commented != false ? '//#' + text : '#' + text };
        temp.len = temp.statement.length;
        return temp;
    }

    // processing functions
    const processIfStatements = (if_def, else_def, endif_def) => {
        // get directives positions
        let ifs = [...code.matchAll(new RegExp(if_def.statement, 'gi'))].map(l => l.index);
        let elses = [...code.matchAll(new RegExp(else_def.statement, 'gi'))].map(l => l.index);
        let endifs = [...code.matchAll(new RegExp(endif_def.statement, 'gi'))].map(l => l.index);

        ifs = ifs.filter(a => noCodeBefore(code, a));
        elses = elses.filter(a => noCodeBefore(code, a));
        endifs = endifs.filter(a => noCodeBefore(code, a));

        // retrieve if directives groups
        let groups = [];

        if (ifs.length > endifs.length) {
            throw 'An #endif is missing in ' + options.fileAdress;
        } else if (ifs.length < endifs.length) {
            throw 'An #if is missing in ' + options.fileAdress;
        }

        for (let i = 0; i < ifs.length; i++) {

            if (ifs[i] > endifs[i]) {
                throw '#endif is declared before #if in ' + options.fileAdress + ' line ' + getLineNumber(code, endifs[i]);
            } else {

                let elseIndex = -1;

                for (let j = 0; j < elses.length; j++) {
                    if (elses[j] > ifs[i] && elses[j] < endifs[i]) {
                        elseIndex = j;
                        break;
                    }
                }

                groups.push({
                    if: ifs[i],
                    else: elseIndex < 0 ? undefined : elses.splice(elseIndex, 1)[0],
                    endif: endifs[i],
                });
            }
        }

        if (elses.length > 0) {
            throw '#else is declared outside #if and #endif in ' + options.fileAdress + ' line ' + getLineNumber(code, elses[0]);
        }

        conditionalLog('     ' + (groups.length > 0 ? '├' : '└') + '╼╼╼╼╼╼╼➤ found: ' + groups.length + ' #if groups.');

        // process groups
        for (let i = groups.length - 1; i >= 0; i--) {

            let _ifEnd = code.indexOf('\n', groups[i].if);

            // get condition
            let condition = code.slice(groups[i].if + if_def.len - 1, _ifEnd - 1);
            condition = condition.split(' ');
            condition = condition.filter(str => !!str);// remove empty or null
            if (condition.length == 0) {
                throw '#if condition missing. at ' + options.fileAdress + ' line ' + getLineNumber(code, groups[i].if + 3);
            } else if (condition.length > 1) {
                throw '#if condition cannot have spaces. at ' + options.fileAdress + ' line ' + getLineNumber(code, groups[i].if + 3);
            } 
            condition = condition[0];

            // prepare condition for check
            let comparisonValue = condition.slice(0,1) != '!';
            if (!comparisonValue)
                condition = condition.slice(1, condition.length);

            // if else found between if & endif
            if (groups[i].else != undefined) {

                // if - else - endif
                if (options.defines.includes(condition) == comparisonValue) {

                    conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if-else condition (' + condition + ') fulfilled');

                    // remove else to endif
                    code = strRemove(code, groups[i].else, groups[i].endif + endif_def.len);
                    // remove if statement
                    code = strRemove(code, groups[i].if, _ifEnd);

                } else {

                    conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if-else condition (' + condition + ') unfulfilled');

                    // remove endif statement
                    code = strRemove(code, groups[i].endif, groups[i].endif + endif_def.len);
                    // remove if to else
                    code = strRemove(code, groups[i].if, groups[i].else + else_def.len);
                }
                
            } else {

                conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if condition (' + condition + ') fulfilled');

                // if - endif
                if (options.defines.includes(condition) == comparisonValue) {
                    // remove endif statement
                    code = strRemove(code, groups[i].endif, groups[i].endif + endif_def.len);
                    // remove if statement
                    code = strRemove(code, groups[i].if, _ifEnd);

                } else {

                    conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if condition (' + condition + ') unfulfilled');
                    
                    // remove all
                    code = strRemove(code, groups[i].if, groups[i].endif + endif_def.len);
                }
            }
        }
    }

    let fileName = getFilename(options.fileAdress);

    // start process
    conditionalLog('directives plugin -> processing: ' + fileName);

    if (options.mode == 'plain' || options.mode == 'both') {
        console.log('iter 1');
        processIfStatements(
            genDirectiveDefinition('if ', false),
            genDirectiveDefinition('else', false),
            genDirectiveDefinition('endif', false)
        );
    }
    
    if (options.mode == 'commented' || options.mode == 'both') {
        console.log('iter 2');
        processIfStatements(
            genDirectiveDefinition('if ', true),
            genDirectiveDefinition('else', true),
            genDirectiveDefinition('endif', true)
        );
        code = code.replaceAll('//#post-code', '');
    }

    return code;
}

export { process as default, getFilename };