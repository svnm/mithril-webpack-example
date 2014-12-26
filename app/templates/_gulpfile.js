'use strict';
var gulp = require('gulp');
var plugin = require('gulp-load-plugins')();

gulp.task('less', function () {

var less = require('gulp-less');
var path = require('path');

  gulp.src('app/styles/main.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('.tmp/styles'));
});


gulp.task('styles', function () { 
  <%  if (this.cssFramework === 'SASS') { %>
  return gulp.src('app/styles/main.scss')
    .pipe(plugin.rubySass({
      style: 'expanded',
      precision: 10,
      loadPath: ['.']
    }))
    .on('error', function (err) { console.log(err.message); })
    <% } else { %>
  return gulp.src('app/styles/main.css')
  <% } %>
    .pipe(plugin.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(plugin.jshint())
    .pipe(plugin.jshint.reporter('jshint-stylish'))
    .pipe(plugin.jshint.reporter('fail'));
});

gulp.task('html', ['styles'], function () {
  var assets = plugin.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(plugin.if('*.js', plugin.uglify()))
    .pipe(plugin.if('*.css', plugin.csso()))
    .pipe(assets.restore())
    .pipe(plugin.useref())
    .pipe(plugin.if('*.html', plugin.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(plugin.cache(plugin.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe(plugin.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(plugin.flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});


gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles', 'fonts'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
<% if (this.cssFramework === 'SASS') { %>
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));
<% } %>

<% if (this.cssFramework === 'SASS') { %>
  gulp.src('app/styles/*.less')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));
<% } %>

  gulp.src('app/*.html')
    .pipe(wiredep({
      <% if (this.cssFramework === 'SASS') { %>
      exclude: ['bootstrap-sass-official'],
      <% } %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  plugin.livereload.listen();
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', plugin.livereload.changed);

  <% if (this.cssFramework === 'SASS') { %>
  gulp.watch('app/styles/**/*.scss', ['styles']);
  <% } %>

  <% if (this.cssFramework === 'LESS') { %>
  gulp.watch('app/styles/**/*.less', ['styles']);
  <% } %>

  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(plugin.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
