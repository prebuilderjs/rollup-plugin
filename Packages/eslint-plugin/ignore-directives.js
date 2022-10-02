module.exports = {
// exports.default = {
    meta: {
        type: "javascript-directives",
        docs: {
            description: "Allow javascript directives",
            category: "layout",
            // recommended: true,
            // url: "https://elint.org/docs/rules/....",
        },
        // fixable: "code",
        schema: []
    },
    create: function (context) {

        // let sc = context.getSourceCode();
        // console.log(sc.getAllComments());
        
        return {
            Program(node) {
                context.report({ message: "woow", node: node});
                let sc = context.getSourceCode(node);
                // console.log(sc);
            }
        };
    }
}