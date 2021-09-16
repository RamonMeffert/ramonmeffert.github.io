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
        pug: "src/**/*.{pug,html}",
        // Don't add layouts to outputs
        pug_excludes: "!src/layouts/*.{pug,html}",
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

function html() {
    return gulp.src([paths.source.pug, paths.source.pug_excludes])
        .pipe(pug())
        .pipe(htmlmin())
        .pipe(gulp.dest(paths.dist.html));
}

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
 * Copy fonts to 
 */
function fonts() {
    return gulp.src(paths.source.fonts)
        .pipe(gulp.dest(paths.dist.fonts));
}

/**
 * Copy images to the dist folder.
 */
function images() {
    return gulp.src(paths.source.images)
        .pipe(gulp.dest(paths.dist.images));
}

/**
 * Copy dotfiles. Currently just for .nojekyll, so I can use GitHub pages to
 * host my personal website.
 */
function dotfiles() {
    return gulp.src(paths.source.dotfiles)
        .pipe(gulp.dest(paths.dist.html));
}

function clean() {
    return del(['dist']);
}

function reload(done) {
    server.reload();
    done();
}

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

// Default export: Live development environment with HMR
export default gulp.series(clean, fonts, dotfiles, images, css, html, serve);
// Build: build for production
export const build = gulp.series(clean, dotfiles, fonts, images, css, html);

