// Let gulp of course
var gulp = require( 'gulp' );
var rename = require( 'gulp-rename' );
var sass = require( 'gulp-sass' )(require( 'sass' ));
var uglify = require( 'gulp-uglify' );
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var browserify = require( 'browserify' );
var babelify = require( 'babelify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
const { notify } = require('browser-sync');
var browserSync = require( 'browser-sync' ).create();
var reload = browserSync.reload;

var styleSrc = 'src/scss/style.scss';
var styleDist = './dist/css/';
var styleWatch = 'src/scss/**/*.scss';

var jsSrc = 'script.js';
var jsFolder = 'src/js/';
var jsDist = './dist/js/';
var jsWatch = 'src/js/**/*.js';
var jsFiles = [jsSrc];
var jsUrl = './dist/js/';
var htmlWatch = '**/*.html';


function triggerPlumber( src_file, dest_file ) {
    return gulp.src( src_file )
        .pipe(plumber() )
        .pipe( gulp.dest( dest_file ) );
};


//Browser-sync
function browser_sync(done) {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    done();
};

// Task per-processor SCSS to CSS
function style(done) {
    gulp.src( styleSrc )
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
        .pipe( gulp.dest( styleDist ) )
        .pipe( browserSync.stream() );

        done();
};

// Task js
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
        .pipe( gulp.dest( jsDist ))
        .pipe( browserSync.stream() );
    });

    done();
};

function images() {
    return triggerPlumber( imagesSrc, imagesUrl );
};


function fonts() {
    return triggerPlumber( fontsSrc, fontsUrl );
};

function html() {
    return triggerPlumber( htmlSrc, htmlUrl );
};


function watch_file() {
    gulp.watch(styleWatch, style);
    gulp.watch(jsWatch, gulp.series(javascript, reload));

    // gulp.src(jsUrl + 'main.min.js')
    //     .pipe(notify({ message: 'Gulp is Watching, Happy Coding!' }));
};

gulp.task("style", style);

gulp.task("javascript", javascript);

gulp.task("images", images);

gulp.task("fonts", fonts);

gulp.task("html", html);

gulp.task("default", gulp.parallel(style, javascript, images, fonts, html));

gulp.task("watch", gulp.series(watch_file, browser_sync));