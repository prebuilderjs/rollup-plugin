import path from 'path';

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

const getFilename = (filePath) => {
    let url = {};
    try {
        url = new URL(filePath);
    } catch {}
    
    return path.basename(url.pathname || filePath);
}


const process = (code, filePath, options = {}) => {

    if (typeof code != 'string') {
        throw 'Preprocess directives library: Invalid "code" parameter, a string is expected.';
    } else if (typeof filePath != 'string') {
        throw 'Preprocess directives library: Invalid "filePath" parameter, a string is expected.';
    } else if (typeof options != 'object') {
        throw 'Preprocess directives library: Invalid "options" parameter, a string is expected.';
    }

    options.defines = options.defines?.constructor.name == 'Array' ? options.defines : [];

    const conditionalLog = (message) => {
        if (options.log)
            console.log(message);
        return;
    }

    let fileName = getFilename(filePath);

    // start process
    conditionalLog('directives plugin -> processing: ' + fileName);

    let ifs = [...code.matchAll(new RegExp('#if ', 'gi'))].map(l => l.index);
    let elses = [...code.matchAll(new RegExp('#else', 'gi'))].map(l => l.index);
    let endifs = [...code.matchAll(new RegExp('#endif', 'gi'))].map(l => l.index);

    ifs = ifs.filter(a => noCodeBefore(code, a));
    elses = elses.filter(a => noCodeBefore(code, a));
    endifs = endifs.filter(a => noCodeBefore(code, a));

    let groups = [];

    if (ifs.length > endifs.length) {
        throw 'An #endif is missing in ' + filePath;
    } else if (ifs.length < endifs.length) {
        throw 'An #if is missing in ' + filePath;
    }

    for (let i = 0; i < ifs.length; i++) {

        if (ifs[i] > endifs[i]) {
            throw '#endif is declared before #if in ' + filePath + ' line ' + getLineNumber(code, endifs[i]);
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
        throw '#else is declared outside #if and #endif in ' + filePath + ' line ' + getLineNumber(code, elses[0]);
    }

    conditionalLog('     ' + (groups.length > 0 ? '├' : '└') + '╼╼╼╼╼╼╼➤ found: ' + groups.length + ' #if groups.');

    // process groups
    for (let i = groups.length - 1; i >= 0; i--) {

        let _startEnd = code.indexOf('\n', groups[i].if);

        let condition = code.slice(groups[i].if + 3, _startEnd - 1);
        condition = condition.split(' ');
        condition = condition.filter(str => !!str);// remove empty or null

        if (condition.length == 0) {
            throw '#if condition missing. at ' + filePath + ' line ' + getLineNumber(code, groups[i].if + 3);
        } else if (condition.length > 1) {
            throw '#if condition cannot have spaces. at ' + filePath + ' line ' + getLineNumber(code, groups[i].if + 3);
        } 
        condition = condition[0];

        let comparisonValue = condition.slice(0,1) != '!';
        if (!comparisonValue)
            condition = condition.slice(1, condition.length);

        // if else found between if & endif
        if (groups[i].else != undefined) {

            // if - else - endif
            if (options.defines.includes(condition) == comparisonValue) {// condition == 'mycond') {

                conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if-else condition (' + condition + ') fulfilled');

                // remove else to endif
                code = strRemove(code, groups[i].else, groups[i].endif + 6);
                // remove if statement
                code = strRemove(code, groups[i].if, _startEnd);

            } else {

                conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if-else condition (' + condition + ') unfulfilled');

                // remove endif statement
                code = strRemove(code, groups[i].endif, groups[i].endif + 6);
                // remove if to else
                code = strRemove(code, groups[i].if, groups[i].else + 5);
            }
            
        } else {

            conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if condition (' + condition + ') fulfilled');

            // if - endif
            if (options.defines.includes(condition) == comparisonValue) {
                // remove endif statement
                code = strRemove(code, groups[i].endif, groups[i].endif + 6);
                // remove if statement
                code = strRemove(code, groups[i].if, _startEnd);

            } else {

                conditionalLog('     ' + (i == 0 ? '└' : '├') + '╼╼╼╼╼╼╼➤ ' + i + '. if condition (' + condition + ') unfulfilled');
                
                // remove all
                code = strRemove(code, groups[i].if, groups[i].endif + 6);
            }
        }
    }

    return code;
}

export { process as default, getFilename };