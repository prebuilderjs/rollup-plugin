const preprocess = require('@prebuilder/lib').default;
const { getFilename } = require('@prebuilder/lib');

/**
 * @param {Object} options  
 * ```txt
 * log: boolean             Wether to show this plugin's logs or not, like skipped files and number
 *                          of #if groups found.
 * fileAdress: string       Path or Url of the script (only needed when logging).
 *                          ex: "C:\\myDir\\file.js" or "mysite.com/myscript?myparam"
 * mode: string             Wether to process when directives are written plainly or used in a comment
 *                          'commented'     -> directives are written plainly
 *                                  ex: "//#if", "//#else", ... and "//#post-code let exampleVar = 5;"
 *                          'plain'         -> directives are written plainly
 *                                  ex: "#if", "#else", ... ("#post-code" not available)
 *                          'both'(default) -> both techniques at the same time
 * ```
 */
export default (options = {}) => {
    const { hook = 'buildStart', defines = [], include = undefined, exclude = undefined, log = false, mode = 'both' } = options;

    const conditionalLog = (message) => {
        if (log) {
            console.log(message);
        }
        return;
    }

    return {
        name: 'prebuilder',

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

            code = preprocess(code, {defines: options.defines, log: options.log, fileAdress: id, mode: mode});

            return { code : code };
        }
    }
}