var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var watchify = require("watchify");
var paths = {
    pages: ['src/*.html']
};

var browserifyInstance = browserify({
    basedir: '.',
    debug: true,
    entries: ['src/main.ts'],
    cache: {},
    packageCache: {}
})
    .plugin(tsify);

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("browserify", function () {
    return browserifyInstance
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["copy-html", "browserify"]);

gulp.task("watch", function () {
    // Watch for changed html files
    gulp.watch('src/*.html', ['copy-html']);

    // Watch files for changes through Browserify with Watchify
    return browserifyInstance
        .plugin(watchify)
        // When a file has changed, rerun the browserify task to create an updated bundle
        .on('update', function () {
            gulp.start("browserify");
        })
        .bundle();
});