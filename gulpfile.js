// Let gulp of course
// var gulp = require( 'gulp' );
const { src, dest, task, series, parallel, watch } = require('gulp');

// CSS
const sass = require( 'gulp-sass' )(require( 'sass' ));
const autoprefixer = require( 'gulp-autoprefixer' );

// Plugins
const rename = require( 'gulp-rename' );
const uglify = require( 'gulp-uglify' );
const sourcemaps = require( 'gulp-sourcemaps' );
const browserify = require( 'browserify' );
const babelify = require( 'babelify' );
const source = require( 'vinyl-source-stream' );
const buffer = require( 'vinyl-buffer' );
const { notify } = require('browser-sync');
const browserSync = require( 'browser-sync' ).create();
const reload = browserSync.reload;


// Html
const htmlSrc = './src/**/*.html';
const htmlDist = './dist/';
const htmlWatch = './src/**/*.html';

// Style
const styleSrc = '/.src/scss/style.scss';
const styleDist = './dist/css/';
const styleWatch = '/.src/scss/**/*.scss';

// Javascript
const jsSrc = 'script.js';
const jsFolder = 'src/js/';
const jsDist = './dist/js/';
const jsWatch = 'src/js/**/*.js';
const jsFiles = [jsSrc];
const jsUrl = './dist/js/';

// Images
const imagesSrc = './src/images/**/*.*';
const imagesDist = './dist/images/';
const imagesWatch = './src/images/**/*.*';

// Fonts
const fontsSrc = './src/fonts/**/*.*';
const fontsDist = './dist/fonts/';
const fontsWatch = './src/fonts/**/*.*';

//Browser-sync
function browserSyncAction() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
};

function reload(done) {
    browserSync.reload();

    done();
};

// Task per-processor SCSS to CSS
function style(done) {
    src( styleSrc )
        .pipe( sourcemaps.init({ loadMaps: true }) )
        .pipe( sass({ 
            outputStyle: 'compressed' }))
        .on('error', sass.logError)
        .pipe( autoprefixer({
            overrideBrowserslist: ['last 2 versions'], 
            cascade: false
        }) )
        .pipe( rename( { suffix: '.min' } ) )
        .pipe( sourcemaps.write( './' ) )
        .pipe( dest( styleDist ) )
        .pipe( browserSync.stream() );

        done();
};

// Task javascript
function javascript(done) {
    jsFiles.map(function( entry ){ 
        return browserify({
            entries: [jsFolder + entry]
        })
        .transform( babelify, { presets: ['@babel/preset-env'] } )
        .bundle()
        .pipe( source( entry ) )
        .pipe( rename({ extname: '.min.js' }))
        .pipe( buffer() )
        .pipe( sourcemaps.init({ loadMaps: true }))
        .pipe( uglify() )
        .pipe( sourcemaps.write( './' ))
        .pipe( dest( jsDist ))
        .pipe( browserSync.stream() );
    });

    done();
};

function triggerPlumber( src_file, dest_file ) {
    return src( src_file )
        .pipe(plumber() )
        .pipe( dest( dest_file ) );
};

function html() {
    return triggerPlumber( htmlSrc, htmlDist );
};

function images() {
    return triggerPlumber( imagesSrc, imagesDist );
};


function fonts() {
    return triggerPlumber( fontsSrc, fontsUrl );
};

// Clean build dist
function cleanBuild() {
    return task.src( './dist/**', { read: false } )
        .pipe(clean());
};

// Watch files
function watchFile() {
    watch(styleWatch, series(style, reload));
    watch(jsWatch, series(javascript, reload));
    watch(imagesWatch, series(images, reload));
    watch(fontsWatch, series(fonts, reload));
    watch(htmlWatch, series(html, reload));
};

// Gulp tasks
task("style", style);
// exports.style = style;

task("javascript", javascript);
// exports.javascript = javascript;

task("images", images);
// exports.images = images;

task("fonts", fonts);
// exports.fonts = fonts;

task("html", html);
// exports.html = html;

task("build", parallel(cleanBuild, parallel(style, javascript, images, fonts, html)));
// exports.build = parallel(style, javascript, images, fonts, html);

task("watch", series(browserSyncAction, watchFile));
// exports.watch = series(browserSyncAction, watchFile);