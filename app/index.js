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

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Welcome to the marvelous Mithril generator! Out of the box I include Mitrhil, Bootstrap, HTML5 Boilerplate, Modernizr, jQuery, and a gulpfile.js to build your app.'));
    }
  },

  cssFramework: function () {
    var done = this.async();

    var prompts = [{
      type: 'list',
      name: 'cssFramework',
      message: 'Which CSS framework would you like to use?',
      choices: [{
        name: 'LESS',
        value: 'LESS'
      }, {
        name: 'SASS',
        value: 'SASS'
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
      this.template('_gulpfile.js', 'gulpfile.js');
    },

    packageJSON: function() {
      this.template('_package.json', 'package.json');
    },

    git: function() {
      this.copy('gitignore', '.gitignore');
    },

    bower: function() {
      this.copy('_bowerrc', '.bowerrc');
      this.copy('_bower.json', 'bower.json');
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

      if (this.cssFramework === 'SASS') {
        css += '.scss';
      }
      if (this.cssFramework === 'LESS') {
        css += '.less';
      }

      this.copy('_' + css, 'app/styles/' + css);
    },

    writeIndex: function () {
      this.indexFile = this.src.read('_index.html');
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
      this.copy('_main.js', 'app/scripts/main.js');
    }
  },

  install: function () {
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' + '\nfront end dependencies by running ' +
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

      var bowerJson = this.dest.readJSON('bower.json');
      // read Bower packages from bower.json and wire them to .html and .scss / .less
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        exclude: ['bootstrap-sass', 'bootstrap.js'],
        ignorePath: /^(\.\.\/)+/,
        src: 'app/index.html'
      });

      if (this.cssFramework === 'SASS') {
        wiredep({
          bowerJson: bowerJson,
          directory: 'bower_components',
          ignorePath: /^(\.\.\/)+/,
          src: 'app/styles/*.scss'
        });
      }

      if (this.cssFramework === 'LESS') {
        wiredep({
          bowerJson: bowerJson,
          directory: 'bower_components',
          ignorePath: /^(\.\.\/)+/,
          src: 'app/styles/*.less'
        });
      }


      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install']
        }
      });
    }.bind(this));
  }
});
