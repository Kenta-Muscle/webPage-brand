const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const gulpDartSass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob-use-forward');
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const del = require('del');
const browserSync = require('browser-sync');

const dir = {
  src: 'src/',
  dest: 'dist/'
}

gulp.task( "ejs", function () {
  return gulp.src([dir.src + "ejs/**/*.ejs", "!" + dir.src + "ejs/_*/_*.ejs"])
      .pipe(ejs({}, {}, {ext: ".html"}))
      .pipe(rename({ extname: ".html" }))
			.pipe(
				rename(function (path) {
					path.dirname = "";
			}))
      .pipe(gulp.dest(dir.dest + "/html"));
});

gulp.task("scss", function() {
  return gulp.src([dir.src + "scss/**/*.scss", '!scss/_*/_*.scss'])
			.pipe(sassGlob())
			.pipe(gulpDartSass({
				includePaths: ['src/scss'],
			}))
      .pipe(sass({outputStyle: "expanded"}))
      .pipe(autoprefixer())
			.pipe(
				rename(function (path) {
					path.dirname = "";
			}))
      .pipe(gulp.dest(dir.dest + "/css"));
});

// gulp.task("css", function() {
//   return gulp.src([dir.src + "scss/**/*.css", "!scss/_*/*.css"])
//       .pipe(gulp.dest(dir.dest + "/css"))
// });

gulp.task("js", function() {
  return gulp.src([dir.src + "js/**/*.ejs"])
	.pipe(ejs({}, {}, {ext: ".html"}))
	.pipe(rename({ extname: ".js" }))
	.pipe(
		rename(function (path) {
			path.dirname = "";
	}))
  .pipe(gulp.dest(dir.dest + "/js"))
});

var imageminOption = [
  pngquant({
    quality: [0.7, 0.85],
  }),
  mozjpeg({
    quality: 85
  }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256
  }),
  imagemin.mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo()
];

gulp.task("img", function() {
  return gulp
    .src([dir.src + "img/**/*.{png,jpg,gif,svg,ico}"])
    .pipe(changed(dir.dest + "img"))
    .pipe(imagemin(imageminOption))
		.pipe(
			rename(function (path) {
				path.dirname = "";
		}))
    .pipe(gulp.dest(dir.dest + "/img"));
});

gulp.task("browser-sync",(done) => {
  browserSync({
    server: {
      baseDir: 'dist/'
    },
    startPath: '/',
    port: 8000,
    notify: false
  });
  done();
});

gulp.task('hot-reload',(done) => {
  browserSync.reload();
  done();
});

gulp.task("watch", function() {
  gulp.watch(dir.src + "scss/**/*.scss", gulp.series("scss"));
  // gulp.watch(dir.src + "scss/**/*.css", gulp.series("css"));
  gulp.watch(dir.src + "ejs/**/*.ejs", gulp.series("ejs"));
  gulp.watch(dir.src + "ejs/_*/_*.ejs", gulp.series("ejs"));
  gulp.watch(dir.src + "js/**/*.js", gulp.series(["js"]));
  gulp.watch(dir.src + "img/**/*.{png,jpg,gif,svg,ico}", gulp.series(["img"]));
  gulp.watch(dir.src + "**/*", gulp.series(["hot-reload"]));
});

gulp.task("clean", function(done) {
  del.sync(dir.dest + "**/*");
  done();
});

gulp.task("default", 
  gulp.series("clean", 
    gulp.parallel(
      "ejs", 
      "scss", 
      // "css", 
      "js", 
      "img"
    ), "browser-sync", "watch"));
