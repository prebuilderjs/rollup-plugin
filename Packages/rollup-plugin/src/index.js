import path from 'path';

export default (options = {}) => {
    const { hook = 'buildStart', include = undefined, exclude = undefined, log = false } = options;

    options.defines = options.defines.constructor.name == 'Array' ? options.defines : [];

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

    const getFilename = (id) => {
        let url = {};
        try {
            url = new URL(id);
        } catch {}
        
        return path.basename(url.pathname || id);
    }

    const conditionalLog = (message) => {
        if (log) {
            console.log(message);
        }
        return;
    }

    return {
        name: 'directives',

        // buildStart: () => {

        // },

        // renderChunk: (code, chunk) => {
        
        // },

        transform: (code, id) => {

            // verify

            let fileName = getFilename(id);

            if (!!include) {
                if (typeof include == 'string' && fileName != include) {
                    conditionalLog('directives plugin -> skipped ' + fileName);
                    return;
                
                } else if (include.constructor.name == 'Array') {

                    let match = false;

                    for (let i = 0; i < include.length; i++) {
                        if (typeof include[i] == 'string' && fileName == include[i]) {
                            match = true;
                            break;
                        }
                    }

                    if (!match) {
                        conditionalLog('directives plugin -> skipped ' + fileName);
                        return;
                    }
                }
            }
            if (!!exclude) {
                if (typeof exclude == 'string' && fileName == exclude) {
                    conditionalLog('directives plugin -> skipped ' + fileName);
                    return;
                
                } else if (exclude.constructor.name == 'Array') {

                    for (let i = 0; i < exclude.length; i++) {
                        if (typeof exclude[i] == 'string' && fileName == exclude[i]) {
                            conditionalLog('directives plugin -> skipped ' + fileName);
                            return;
                        }
                    }
                }
            }

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
                throw 'An #endif is missing in ' + id;
            } else if (ifs.length < endifs.length) {
                throw 'An #if is missing in ' + id;
            }

            for (let i = 0; i < ifs.length; i++) {

                if (ifs[i] > endifs[i]) {
                    throw '#endif is declared before #if in ' + id + ' line ' + getLineNumber(code, endifs[i]);
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
                        else: elseIndex < 0 ? elseIndex : elses.splice(elseIndex, 1),
                        endif: endifs[i],
                    });
                }
            }

            if (elses.length > 0) {
                throw '#else is declared outside #if and #endif in ' + id + ' line ' + getLineNumber(code, elses[0]);
            }

            conditionalLog(' └                     -> found: ' + groups.length + ' #if groups.');

            // process groups
            for (let i = groups.length - 1; i >= 0; i--) {

                let _startEnd = code.indexOf('\n', groups[i].if);

                let condition = code.slice(groups[i].if + 3, _startEnd - 1);
                condition = condition.split(' ');
                condition = condition.filter(str => !!str);// remove empty or null

                if (condition.length == 0) {
                    throw '#if condition missing. at ' + id + ' line ' + getLineNumber(code, groups[i].if + 3);
                } else if (condition.length > 1) {
                    throw '#if condition cannot have spaces. at ' + id + ' line ' + getLineNumber(code, groups[i].if + 3);
                } 
                condition = condition[0];

                let comparisonValue = condition.slice(0,1) != '!';
                if (!comparisonValue)
                    condition = condition.slice(1, condition.length);

                // if else found between if & endif
                if (groups[i].else > 0) {

                    // if - else - endif
                    if (options.defines.includes(condition) == comparisonValue) {// condition == 'mycond') {
                        // remove else to endif
                        code = strRemove(code, groups[i].else, groups[i].endif + 6);
                        // remove if statement
                        code = strRemove(code, groups[i].if, _startEnd);

                    } else {
                        // remove endif statement
                        code = strRemove(code, groups[i].endif, groups[i].endif + 6);
                        // remove if to else
                        code = strRemove(code, groups[i].if, groups[i].else + 5);
                    }
                    
                } else {

                    // if - endif
                    if (options.defines.includes(condition) == comparisonValue) {
                        // remove endif statement
                        code = strRemove(code, groups[i].endif, groups[i].endif + 6);
                        // remove if statement
                        code = strRemove(code, groups[i].if, _startEnd);

                    } else {
                        // remove all
                        code = strRemove(code, groups[i].if, groups[i].endif + 6);
                    }
                }
            }

            return { code : code };
        }
    }
}