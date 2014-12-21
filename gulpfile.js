var gulp = require('gulp');
var connect = require('gulp-connect');
var through = require('through2');

var fs = require('fs');
var tpl = fs.readFileSync('includes/tpl.html').toString();

function parse (src, dest) {
  return gulp.src(src).
    pipe(through.obj(function (file, enc, cb) {
      var src = file.contents.toString();
      src = fromTpl(src);
      src = src.replace(/( *)<!--\s*#include\s*(.*?)-->/g, function (p0, p1, p2) {
        return fs.readFileSync(p2.trim()).toString().trim().
          split('\n').map(function (line) {
            return p1 + line;
        }).join('\n');
      });
      src = execute(src, dest);
      src = findTitle(file, src);
      src = buildTitle(file, src);
      file.contents = new Buffer(src);
      file.path = file.base + 'dist' + dest;
      this.push(file);
      cb();
    })).
    pipe(gulp.dest('.'));
}

function buildTitle (file, src) {
  return src.replace(/<!--\s*#buildTitle\s*(.*?)-->/g, function (p0, p1) {
    return p1.trim().replace(/\{\}/g, (file.title || '').trim());
  });
}

function findTitle (file, src) {
  return src.replace(/^\s*<!--\s*#title\s*(.*?)-->\s*\n/mg, function (p0, p1) {
    file.title = p1;
    return '';
  }).replace(/<!--\s*#title\s*(.*?)-->/g, function (p0, p1) {
    file.title = p1;
    return '';
  });
}

function execute (content, path) {
  return content.replace(/<!--\s*#exec\s*([\S\s]+?)-->/g, function (p0, p1) {
    var func = new Function('return function(path){return ' + p1.trim() + '}');
    return func().call(undefined, path);
  });
}

function fromTpl (content) {
  return tpl.replace(/( *)<!--\s*#body\s*-->/, function (p0, p1) {
    return content.trim().split('\n').map(function (line) {
      return p1 + line;
    }).join('\n');
  });
}

gulp.task('tpl', function () {
  parse('pages/index.html',      '/index.html');
  parse('pages/specs.html',      '/specs/index.html');
  parse('pages/collations.html', '/collations/index.html');
  parse('pages/videos.html',     '/videos/index.html');
  parse('pages/contact.html',    '/contact/index.html');

  parse('pages/collations-flooded.html', '/collations/flooded.html');
  parse('pages/collations-laner.html', '/collations/laner.html');
  parse('pages/collations-single-row.html', '/collations/single-row.html');
  parse('pages/collations-multi-tier.html', '/collations/multi-tier.html');
  parse('pages/collations-multi-high.html', '/collations/multi-high.html');

  connect.reload();
});

gulp.task('copy', function () {
  return gulp.src(['images/**', 'css/**', 'js/**'], {
    base: '.'
  }).pipe(gulp.dest('dist'));
});

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch([
    'pages/**',
    'includes/**'
  ], ['tpl']);

  gulp.watch([
    'js/**',
    'css/**',
    'images/**'
  ], ['copy']);
});

gulp.task('default', ['tpl', 'copy', 'connect', 'watch']);
