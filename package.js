Package.describe({
  name: 'webtempest:animate',
  version: '0.1.9',
  summary: 'Easily perform CSS animations and transitions in Meteor',
  git: 'https://github.com/webtempest/meteor-animate.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['1.10', '2.3', '3.0']);
  api.use('coffeescript');
  api.use('templating');
  api.addFiles([
    'transition.html',
    'transitions.coffee',
    'animate.html',
    'animate.coffee',
    'animate.css'
  ], 'client');
});
