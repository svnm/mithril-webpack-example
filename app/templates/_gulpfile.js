'use strict';
var gulp = require('gulp');
var plugin = require('gulp-load-plugins')();

/* styles */
gulp.task('styles', function () { 
  <%  if (cssFramework === 'SASS') { %>
  return gulp.src('app/styles/main.scss')
    .pipe(plugin.plumber())
    .pipe(plugin.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe(plugin.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
  <% } %>

  <%  if (cssFramework === 'LESS') { %>
  return gulp.src('app/styles/main.less')
    .pipe(plugin.plumber())
    .pipe(plugin.less({
      style: 'expanded',
      precision: 10
    }))
    .pipe(plugin.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
  <% } %>

});

/* js hint */
gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(plugin.jshint())
    .pipe(plugin.jshint.reporter('jshint-stylish'))
    .pipe(plugin.jshint.reporter('fail'));
});

/* html */
gulp.task('html', ['styles'], function () {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe(plugin.csso)
    .pipe(plugin.replace, 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap','fonts');
  var assets = plugin.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(plugin.if('*.js', plugin.uglify()))
    .pipe(plugin.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe(plugin.useref())
    .pipe(plugin.if('*.html', plugin.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

/* images */
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(plugin.cache(plugin.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

/* fonts */
gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe(plugin.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(plugin.flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

/* extras */
gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

/* clean */
gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

/* connect */
gulp.task('connect', ['styles'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

/* serve */
gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

/* wiredep */ 
gulp.task('wiredep', function () {
  /*
  var wiredep = require('wiredep').stream;
  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/styles/*.less')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({exclude: ['bootstrap-sass-official']}))
    .pipe(wiredep({exclude: ['bootstrap']}))
    .pipe(gulp.dest('app'));
  */
});

/* watch */
gulp.task('watch', ['connect'], function () {
  plugin.livereload.listen();

  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', plugin.livereload.changed);

  <% if (cssFramework === 'SASS') { %>
    gulp.watch('app/styles/**/*.scss', ['styles']);
  <% } %>

  <% if (cssFramework === 'LESS') { %>
    gulp.watch('app/styles/**/*.less', ['styles']);
  <% } %>

  gulp.watch('bower.json', ['wiredep']);
});

/* build */
gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(plugin.size({title: 'build', gzip: true}));
});

/* default */
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

