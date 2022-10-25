import { default as process, getFilename } from '@preprocess-directives/lib';

export default (options = {}) => {
    const { hook = 'buildStart', include = undefined, exclude = undefined, log = false } = options;

    const conditionalLog = (message) => {
        if (log) {
            console.log(message);
        }
        return;
    }

    return {
        name: 'preprocess-directives',

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

            code = process(code, id, {defines: options.defines, log: options.log});

            return { code : code };
        }
    }
}