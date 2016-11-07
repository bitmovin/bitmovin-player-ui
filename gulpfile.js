var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var watchify = require('watchify');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

var paths = {
    source: {
        html: ['./src/html/*.html'],
        ts: ['./src/ts/main.ts'],
        sass: ['./src/scss/*.scss']
    },
    target: {
        html: './dist',
        js: './dist/js',
        css: './dist/css'
    }
};

var browserifyInstance = browserify({
    basedir: '.',
    debug: true,
    entries: paths.source.ts,
    cache: {},
    packageCache: {}
}).plugin(tsify);

// Deletes the target directory containing all generated files
gulp.task('clean', del.bind(null, [paths.target.html]));

// Copies html files to the target directory
gulp.task('html', function () {
    return gulp.src(paths.source.html)
        .pipe(gulp.dest(paths.target.html));
});

// Compiles JS and TypeScript to JS in the target directory
gulp.task('browserify', function () {
    return browserifyInstance
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(paths.target.js))
        .pipe(browserSync.reload({stream: true}));
});

// Compiles SASS stylesheets to CSS stylesheets in the target directory, adds autoprefixes and creates sourcemaps
gulp.task('sass', function () {
    gulp.src(paths.source.sass)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.target.css))
        .pipe(browserSync.reload({stream: true}));
});

// Builds the complete project from the sources into the target directory
gulp.task('build', function(callback) {
    // First run 'clean', then the other tasks
    // TODO remove runSequence on Gulp 4.0 and use built in serial execution instead
    runSequence('clean',
        ['html', 'browserify', 'sass'],
        callback);
});

gulp.task('default', ['build']);

// Watches files for changes and runs their build tasks
gulp.task('watch', function () {
    // Watch for changed html files
    gulp.watch(paths.source.html, ['html']);

    // Watch SASS files
    gulp.watch(paths.source.sass, ['sass']);

    // Watch files for changes through Browserify with Watchify
    return browserifyInstance
        .plugin(watchify)
        // When a file has changed, rerun the browserify task to create an updated bundle
        .on('update', function () {
            gulp.start('browserify');
        })
        .bundle();
});

// Serves the project in the browser and updates it automatically on changes
gulp.task('serve', function () {
    runSequence(['build'], function () {
        browserSync({
            notify: false,
            port: 9000,
            server: {
                baseDir: [paths.target.html]
            }
        });

        gulp.watch(paths.source.sass, ['sass']);
        gulp.watch(paths.source.html, ['html']).on('change', browserSync.reload);
        gulp.watch(paths.source.ts, ['browserify']);
    });
});