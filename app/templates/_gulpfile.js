'use strict';
var gulp = require('gulp'),
  connect = require('connect'),
  livereload = require('gulp-livereload'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  source = require('vinyl-source-stream'),
  less = require('gulp-less'),
  rubySass = require('gulp-ruby-sass'),
  plumber = require('gulp-plumber'),
  autoprefixer = require('gulp-autoprefixer'),
  cache = require('gulp-cache'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  minifyHtml = require('gulp-minify-html'),
  size = require('gulp-size'),
  serveStatic = require('serve-static'),
  serveIndex = require('serve-index');

/* browserify */ 
gulp.task('browserify', function() {
  var sourceFile = './app/scripts/main.js',
    destFolder = './app/scripts/browserify/',
    destFile = 'main.js';

  var bundler = browserify({
    entries: sourceFile,
    cache: {}, packageCache: {}, fullPaths: true, debug: true
  });

  var bundle = function() {
    return bundler
      .bundle()
      .on('error', function () {})
      .pipe(source(destFile))
      .pipe(gulp.dest(destFolder));
  };

  if(global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }
  return bundle();
});


/* styles */
gulp.task('styles', function () { 
  <%  if (cssFramework === 'SASS') { %>
  return gulp.src('app/styles/main.scss')
    .pipe(plumber())
    .pipe(rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe(autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('app/styles/')); <% } %>

  <%  if (cssFramework === 'LESS') { %>
  return gulp.src('app/styles/main.less')
    .pipe(plumber())
    .pipe(less({
      style: 'expanded',
      precision: 10
    }))
    .pipe(autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('app/styles')); <% } %>

});

/* js hint */
gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});


/* extras */
gulp.task('extras', function () {
  return gulp.src([
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

/* connect */
gulp.task('connect', ['styles'], function () {
  var app = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('app'))
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

/* serve */
gulp.task('serve', ['watch'], function () {
    gulp.start('browserify');
  require('opn')('http://localhost:9000');
});

/* copy bower components */
gulp.task('bower', function () {
  var paths = {
    js: [
      'bower_components/modernizr/modernizr.js',
      'bower_components/requirejs/require.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/mithril/mithril.min.js'
    ]
  }

  gulp.src(paths.js)
    .pipe(gulp.dest('app/scripts'));

});

/* watch */
gulp.task('watch', ['connect', 'bower'], function () {

  livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/styles/**/*.css',
    'app/scripts/**/*.js'
  ]).on('change', livereload.changed);

  <% if (cssFramework === 'SASS') { %>
    gulp.watch('app/styles/**/*.scss', ['styles']); <% } %>

  <% if (cssFramework === 'LESS') { %>
    gulp.watch('app/styles/**/*.less', ['styles']); <% } %>

    gulp.watch('app/scripts/**/*.js', ['browserify']);
});

/* build */
gulp.task('build', ['styles','extras', 'bower'], function () {

  gulp.start('browserify');

  /* app */
  gulp.src('app/**/*')
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'build', gzip: true}));

  /* html */
  var opts = {comments:true,spare:true, quotes: true};
  gulp.src('dist/*.html')
    .pipe(minifyHtml(opts))
    .pipe(gulp.dest('dist'));    
});

/* default */
gulp.task('default', function () {
  gulp.start('serve');
});
