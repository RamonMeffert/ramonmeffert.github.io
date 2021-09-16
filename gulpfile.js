import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import browserSync from 'browser-sync';
import pug from 'gulp-pug';
import htmlmin from 'gulp-htmlmin';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcss from 'gulp-postcss';
import del from 'del';

const server = browserSync.create();

const paths = {
    source: {
        // Include all pug and html files, except those in folders starting with _
        pug: ["src/**/*.{pug,html}", "!src/_*/", "!src/_*/**/*"],
        scss: "src/scss/**/*.s[ca]ss",
        fonts: "src/fonts/*.{woff,woff2,eot,ttf,otf}",
        images: "src/images/*",
        dotfiles: "src/.*"
    },
    dist: {
        html: "dist",
        css: "dist/css",
        fonts: "dist/fonts",
        images: "dist/images",
    }
};

// Compile and minify html
function html() {
    return gulp.src(paths.source.pug)
        .pipe(pug())
        .pipe(htmlmin())
        .pipe(gulp.dest(paths.dist.html));
}

// Compile, prefix and minify scss
function css() {
    const plugins = [
        autoprefixer(),
        cssnano()
    ];
    return gulp.src(paths.source.scss)
        .pipe(sass())
        .pipe(postcss(plugins))
        .pipe(gulp.dest(paths.dist.css));
}

/**
 * Copy fonts to dist folder.
 */
function fonts() {
    return gulp.src(paths.source.fonts)
        .pipe(gulp.dest(paths.dist.fonts));
}

/**
 * Copy images to dist folder.
 */
function images() {
    return gulp.src(paths.source.images)
        .pipe(gulp.dest(paths.dist.images));
}

// Copy dotfiles. Currently just for .nojekyll, so I can use GitHub pages to
// host my personal website.
function dotfiles() {
    return gulp.src(paths.source.dotfiles)
        .pipe(gulp.dest(paths.dist.html));
}

// Remove the generated output.
function clean() {
    return del(['dist']);
}

// Reload the browsersync server.
function reload(done) {
    server.reload();
    done();
}

// Run the live development server
function serve(done) {
    server.init({
        server: {
            baseDir: './dist'
        }
    });
    gulp.watch(paths.source.pug, gulp.series(html, reload));
    gulp.watch(paths.source.scss, gulp.series(css, reload));
    gulp.watch(paths.source.fonts, gulp.series(fonts, reload));
    gulp.watch(paths.source.images, gulp.series(images, reload));
    done();
}

// Default export: Live development environment
export default gulp.series(clean, fonts, dotfiles, images, css, html, serve);
// Build: build for production. Fonts are not included here
export const build = gulp.series(clean, dotfiles, images, css, html);

