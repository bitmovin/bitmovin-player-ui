var gulp = require('gulp');

// Gulp plugins
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var cssBase64 = require('gulp-css-base64');
var postcss = require('gulp-postcss');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var tslint = require('gulp-tslint');
var sassLint = require('gulp-sass-lint');
var ts = require('gulp-typescript');
var replace = require('gulp-replace');
var header = require('gulp-header');

// PostCSS plugins
var postcssSVG = require('postcss-svg');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

// Browserify
var browserify = require('browserify');
var tsify = require('tsify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Various stuff
var del = require('del');
var browserSync = require('browser-sync');
var merge = require('merge2');
var nativeTslint = require('tslint');
var npmPackage = require('./package.json');
var path = require('path');
var combine = require('stream-combiner2');
const argv = require('yargs').argv;

// Output naming can be set via CLI parameters, e.g. --outputnames.globalNamespace=foo
const outputnames = {
  globalNamespace: argv.outputnames && argv.outputnames.globalNamespace || 'bitmovin.playerui',
  filename: argv.outputnames && argv.outputnames.filename || 'bitmovinplayer-ui',
  cssPrefix: argv.outputnames && argv.outputnames.cssPrefix || 'bmpui',
};

var paths = {
  source: {
    html: ['./src/html/*.html'],
    tsmain: ['./src/ts/main.ts'],
    ts: ['./src/ts/**/*.ts'],
    sass: ['./src/scss/**/*.scss'],
    json: ['./src/ts/**/*.json']
  },
  target: {
    html: './dist',
    js: './dist/js',
    jsframework: './dist/js/framework',
    jsmain: `${outputnames.filename}.js`,
    css: './dist/css'
  }
};

var replacements = [
  ['{{VERSION}}', npmPackage.version],
  ['{{PREFIX}}', outputnames.cssPrefix],
];

var browserifyInstance = browserify({
  basedir: '.',
  debug: true,
  entries: paths.source.tsmain,
  cache: {},
  packageCache: {},
  standalone: outputnames.globalNamespace,
}).plugin(tsify);

var catchBrowserifyErrors = false;
var production = false;

function replaceAll() {
  var replacementStreams = replacements.map(function(replacement) { return replace(replacement[0], replacement[1]); });
  return combine.obj.apply(this, replacementStreams);
}

// Deletes the target directory containing all generated files
gulp.task('clean', function() {
  return del([paths.target.html]);
});

// Copies the JSON files to dist path
gulp.task('copy-json', function() {
  return gulp.src(paths.source.json).pipe(gulp.dest(paths.target.jsframework));
});

// TypeScript linting
gulp.task('lint-ts', function() {
  // The program is required for type checking rules to work: https://palantir.github.io/tslint/usage/type-checking/
  var program = nativeTslint.Linter.createProgram("./tsconfig.json");

  return gulp.src(paths.source.ts)
  .pipe(tslint({
    formatter: 'verbose',
    program: program,
  }))
  .pipe(tslint.report({
    // Print just the number of errors (instead of printing all errors again)
    summarizeFailureOutput: true
  }))
});

// Sass/SCSS linting
gulp.task('lint-sass', function() {
  return gulp.src(paths.source.sass)
  .pipe(sassLint({
    rules: {
      'no-css-comments': 0,
      'hex-length': 0,
      'no-color-literals': 0,
      'no-important': 0,
      'leading-zero': 0,
      'nesting-depth': 5
    }
  }))
  .pipe(sassLint.format())
  .pipe(sassLint.failOnError())
});

// Runs all linters
gulp.task('lint', gulp.parallel('lint-ts', 'lint-sass'));

// Copies html files to the target directory
gulp.task('html', function() {
  return gulp.src(paths.source.html)
  .pipe(gulp.dest(paths.target.html));
});

// Compiles JS and TypeScript to JS in the target directory
gulp.task('browserify', function() {
  var browserifyBundle = browserifyInstance.bundle();

  if (catchBrowserifyErrors) {
    // Normally an error breaks a running task. For permanent tasks like watch/serve, we want the task to
    // stay alive and ignore errors, so we catch them here and print them to the console.
    browserifyBundle.on('error', console.error.bind(console));
  }

  // Compile output JS file
  var stream = browserifyBundle
  .pipe(source(paths.target.jsmain))
  .pipe(replaceAll())
  .pipe(buffer()) // required for production/sourcemaps
  .pipe(gulp.dest(paths.target.js));

  if (production) {
    // Minify JS
    stream.pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.target.js));
  }

  return stream.pipe(browserSync.reload({stream: true}));
});

// Compiles SASS stylesheets to CSS stylesheets in the target directory, adds autoprefixes and creates sourcemaps
gulp.task('sass', function() {
  var stream = gulp.src(paths.source.sass)
  .pipe(sourcemaps.init())
  .pipe(header(`$prefix: '${outputnames.cssPrefix}';`)) // Overwrites declaration in _variables.scss
  .pipe(sass({
    includePaths: [
      // Includes node_modules of the current module
      path.join(__dirname, 'node_modules'),
      // Includes node_modules of the current module, or, if used as a dependency in a supermodule where this
      // gulpfile is reused, includes node_modules of the supermodule
      './node_modules'],
  }).on('error', sass.logError))
  .pipe(postcss([
    autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}),
    postcssSVG()
  ]))
  .pipe(cssBase64())
  .pipe(rename(function(path) {
    // The original filename is defined by the scss source file
    if (path.basename === 'bitmovinplayer-ui') {
      path.basename = outputnames.filename;
    }
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(paths.target.css));

  if (production) {
    // Minify CSS
    stream.pipe(postcss([cssnano({
      // Disable svg optimizer because output is not a valid URI and does not work in IE11
      // TODO check if it works in a later version, because disabling increases file size substantially
      svgo: false
    })]))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest(paths.target.css));
  }

  return stream.pipe(browserSync.reload({stream: true}));
});

// Builds the complete project from the sources into the target directory
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'browserify', 'sass')));

gulp.task('build-prod', gulp.series(function(callback) {
  production = true;
  callback();
}, 'lint', 'build'));

gulp.task('default', gulp.series('build'));

// Watches files for changes and runs their build tasks
gulp.task('watch', function() {
  // Watch for changed html files
  gulp.watch(paths.source.html).on('change', gulp.series('html'));

  // Watch SASS files
  gulp.watch(paths.source.sass).on('change', gulp.series('sass'));

  // Watch JSON files 
  gulp.watch(paths.source.json).on('change', gulp.series('browserify'));

  // Watch files for changes through Browserify with Watchify
  catchBrowserifyErrors = true;
  return browserifyInstance
  .plugin(watchify)
  // When a file has changed, rerun the browserify task to create an updated bundle
  .on('update', function() {
    gulp.start('browserify');
  })
  .bundle();
});

// Serves the project in the browser and updates it automatically on changes
gulp.task('serve', gulp.series('build', function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [paths.target.html]
    }
  });

  gulp.watch(paths.source.sass).on('change', gulp.series('sass'));
  gulp.watch(paths.source.html).on('change', gulp.series('html', browserSync.reload));
  gulp.watch(paths.source.json).on('change', gulp.series('browserify'));
  catchBrowserifyErrors = true;
  gulp.watch(paths.source.ts).on('change', gulp.series('browserify'));
}));

// Prepares the project for a npm release
// After running this task, the project can be published to npm or installed from this folder.
gulp.task('npm-prepare', gulp.series('build-prod', 'copy-json', function() {
  // https://www.npmjs.com/package/gulp-typescript
  var tsProject = ts.createProject('tsconfig.json');
  var tsResult = gulp.src(paths.source.ts).pipe(tsProject());

  return merge([
    tsResult.dts.pipe(gulp.dest(paths.target.jsframework)),
    tsResult.js.pipe(replaceAll()).pipe(gulp.dest(paths.target.jsframework))
  ]);
}));

// Export the paths object to allow customization (e.g. js output filename) from other gulpfiles that import
// and reuse the tasks from here.
module.exports.paths = paths;
