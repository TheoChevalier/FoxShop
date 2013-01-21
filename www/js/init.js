require.config({
    baseUrl: 'js/lib',

    // We fake jquery so that libs that "require" it don't download
    // both jquery and zepto. If you want to use jquery, remove this.
    // Use case: backbone
    map: { '*': { 'jquery': 'zepto' } },

    // Fix libraries that simply require a global window object, and
    // thus don't have the AMD module definition in the code, by
    // defining the AMD shim here
    shim: {
        // Example:
        // 'move': {
        //     exports: 'move'
        // }
    }
});

requirejs(['../app']);
