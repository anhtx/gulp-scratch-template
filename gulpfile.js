// Let gulp of course
const { src, dest, task, series, parallel, watch } = require('gulp');

// CSS
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer' );

// Plugins
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');

// Style
const styleSrc = './src/scss/style.scss';
const styleDist = './dist/css/';
const styleWatch = './src/scss/**/*.scss';

// Javascript
const jsSrc = 'script.js';
const jsFolder = 'src/js/';
const jsDist = './dist/js/';
const jsWatch = 'src/js/**/*.js';
const jsFiles = [jsSrc];

// Images
const imagesSrc = './src/images/**/*.*';
const imagesDist = './dist/images/';
const imagesWatch = './src/images/**/*.*';

// Fonts
const fontsSrc = './src/fonts/**/*.*';
const fontsDist = './dist/fonts/';
const fontsWatch = './src/fonts/**/*.*';


// Html
const htmlSrc = './src/**/*.html';
const htmlDist = './dist/';
const htmlWatch = './src/**/*.html';
const pugSrc = './src/views/**/*.pug';
const pugWatch = './src/views/**/*.pug';

//Browser-sync
function browserSyncAction() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    });
};

function reload(done) {
    browserSync.reload();
    done();
};

// Task per-processor SCSS to CSS
function style(done) {
    src(styleSrc)
        .pipe(sourcemaps.init({ loadMaps: true }) )
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'], 
            cascade: false
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(styleDist))
        .pipe(browserSync.stream());

        done();
};

// Task javascript
function javascript(done) {
    jsFiles.map(function(entry) { 
        return browserify({
            entries: [jsFolder + entry]
        })
        .transform(babelify, { presets: ['@babel/preset-env'] })
        .bundle()
        .pipe(source(entry))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest(jsDist))
        .pipe(browserSync.stream());
    });

    done();
};

function triggerPlumber(src_file, dest_file) {
    return src(src_file)
        .pipe(plumber())
        .pipe(dest(dest_file));
};

function images() {
    return triggerPlumber(imagesSrc, imagesDist);
};


function fonts() {
    return triggerPlumber(fontsSrc, fontsDist);
};

function html() {
    return triggerPlumber(htmlSrc, htmlDist);
};

function viewPug() {
    return src(pugSrc)
        .pipe(pug({
            pretty: true
        }))
        .pipe(dest(htmlDist));
};

// Watch files
function watchFile() {
    watch(styleWatch, series(style, reload));
    watch(jsWatch, series(javascript, reload));
    watch(imagesWatch, series(images, reload));
    watch(fontsWatch, series(fonts, reload));
    watch(htmlWatch, series(html, reload));
    watch(pugWatch, series(viewPug, reload));
};

// Gulp tasks
task("style", style);

task("javascript", javascript);

task("images", images);

task("fonts", fonts);

task("html", html);

task("viewPug", viewPug);

task("build", parallel(style, javascript, images, fonts, html, viewPug));

task("watch", parallel(browserSyncAction, watchFile));