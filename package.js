Package.describe({
    name: 'webtempest:animate',
    version: '0.3.1',
    summary: 'Easily perform CSS animations and transitions in Meteor',
    git: 'https://github.com/webtempest/meteor-animate.git',
    documentation: 'README.md',
});

Package.onUse(function (api) {
    api.versionsFrom(['1.10', '2.3', '3.0']);
    api.use('templating');
    api.addFiles([
        'transition.html',
        'transitions.js',
        'animate.html',
        'animate.js',
        'animate.css',
    ], 'client');
});
