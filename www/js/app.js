
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    require('receiptverifier');

    // Installation button
    require('./install-button');

    // Install the x-view and x-listview tags
    require('layouts/view');
    require('layouts/list');

    // Write your app here.

    function formatDate(d) {
        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
     }

    // Passing a function into $ delays the execution until the
    // document is ready
    $(function() {

        // List view
        var list = $('.list').get(0);
        list.add({ title: 'Cook yummy food',
                   desc: 'COOK ALL THE THINGS',
                   date: new Date() });
        list.add({ title: 'Make things',
                   desc: 'Make this look like that',
                   date: new Date(12, 9, 5) });
        list.add({ title: 'Move stuff',
                   desc: 'Move this over there',
                   date: new Date(12, 10, 1) });
        list.add({ title: 'Cook yummy food',
                   desc: 'COOK ALL THE THINGS',
                   date: new Date() });
        list.add({ title: 'Make things',
                   desc: 'Make this look like that',
                   date: new Date(12, 9, 5) });

        list.nextView = 'x-view.details';

        // Detail view
        var details = $('.details').get(0);
        details.render = function(item) {
            $('.title', this).text(item.get('title'));
        };
    });
});