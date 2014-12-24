'use strict';
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install', {
      desc: 'Skips the installation of dependencies',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      // Have Yeoman greet the user.
      this.log(yosay('Welcome to the marvelous Mithril generator!'));
      this.log(yosay('\'Allo \'allo! Out of the box I include Mitrhil, Bootstrap, HTML5 Boilerplate, Modernizr, jQuery, and a gulpfile.js to build your app.'));
    }

    /* this should be obsolete as we will just give them bootstrap, either SASS, LESS or CSS version */

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      var hasFeature = function (feat) {
        return features.indexOf(feat) !== -1;
      };

      done();
    }.bind(this));
  },


  cssFramework: function () {
    var done = this.async();

    var prompts = [{
      type: 'list',
      name: 'cssFramework',
      message: 'Which CSS framework would you like to use?',
      choices: [{
        name: 'LESS',
        value: 'less'
      }, {
        name: 'SASS',
        value: 'sass'
      }]
    }];

    this.prompt(prompts, function (props) {
      this.cssFramework = props.cssFramework;
      done();
    }.bind(this));
  },
  
  moduleLoader: function() {
    var cb = this.async();

    var prompts = [{
      type: 'list',
      name: 'moduleLoader',
      message: 'Which module loader would you like to include?',
      choices: [{
        name: 'Browserify',
        value: 'browserify'
      }, {
        name: 'Requirejs',
        value: 'requirejs'
      }]
    }];

    this.prompt(prompts, function(props) {
      this.moduleLoader = props.moduleLoader;
      cb();
    }.bind(this));
  },

  writing: {
    gulpfile: function() {
      this.template('_gulpfile.js');
    },

    packageJSON: function() {
      this.template('_package.json', 'package.json');
    },

    git: function() {
      this.copy('gitignore', '.gitignore');
    },

    bower: function() {
      this.copy('_bowerrc', '.bowerrc');
      this.copy('_bower.json', '.bower.json');
    },

    jshint: function () {
      this.copy('_jshintrc', '.jshintrc');
    },

    editorConfig: function () {
      this.copy('_editorconfig', '.editorconfig');
    },

    h5bp: function () {
      this.copy('_favicon.ico', 'app/favicon.ico');
      this.copy('_robots.txt', 'app/robots.txt');
    },

    mainStylesheet: function () {
      var css = 'main';

      if (this.includeSass) {
        css += '.scss';
      } else {
        css += '.css';
      }

      this.copy(css, 'app/styles/' + css);
      this.copy(css, 'app/styles/main.less');
    },

    writeIndex: function () {
      this.indexFile = this.src.read('index.html');
      this.indexFile = this.engine(this.indexFile, this);

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/main.js',
        sourceFileList: ['scripts/main.js']
      });

      this.write('app/index.html', this.indexFile);
    },

    app: function () {
      this.mkdir('app');
      this.mkdir('app/scripts');
      this.mkdir('app/styles');
      this.mkdir('app/images');
      this.mkdir('app/fonts');
      this.copy('main.js', 'app/scripts/main.js');
    }
  },

  install: function () {
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });

    this.on('end', function () {
      var bowerJson = this.dest.readJSON('_bower.json');

      // wire Bower packages to .html
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        exclude: ['bootstrap-sass', 'bootstrap.js'],
        ignorePath: /^(\.\.\/)+/,
        src: 'app/index.html'
      });

      if (this.cssFramework === 'SASS') {
        // wire Bower packages to .scss
        wiredep({
          bowerJson: bowerJson,
          directory: 'bower_components',
          ignorePath: /^(\.\.\/)+/,
          src: 'app/styles/*.scss'
        });
      }

      // ideally we should use composeWith, but we're invoking it here
      // because generator-mocha is changing the working directory
      // https://github.com/yeoman/generator-mocha/issues/28
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install']
        }
      });
    }.bind(this));
  }
});
