const gulp = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const fs = require("fs");
const include = require("gulp-include");

// Fonts
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

// Images
const avif = require("gulp-avif");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const newer = require("gulp-newer");

const svgSprite = require("gulp-svg-sprite");

gulp.task("pages", function () {
  return gulp
    .src("app/pages/*.html")
    .pipe(
      include({
        includePaths: "app/components",
      })
    )
    .pipe(gulp.dest("app"))
    .pipe(browserSync.stream());
});

gulp.task("images", function () {
  return gulp
    .src(["app/images/src/*.*", "!app/images/src/*.svg"])
    .pipe(newer("app/images"))
    .pipe(avif({ quality: 50 }))

    .pipe(gulp.src(["app/images/src/*.*"]))
    .pipe(newer("app/images"))
    .pipe(webp())

    .pipe(gulp.src(["app/images/src/*.*"]))
    .pipe(newer("app/images"))
    .pipe(imagemin())

    .pipe(gulp.dest("app/images"));
});

gulp.task("sprite", function () {
  return gulp
    .src("app/images/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(gulp.dest("app/images"));
});

gulp.task("fonts", function () {
  return gulp
    .src("app/fonts/src/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(gulp.src("app/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(gulp.dest("app/fonts"));
});

gulp.task("styles", function () {
  return gulp
    .src("app/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 10 version"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
});

gulp.task("scripts", function () {
  return gulp
    .src(["app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("app/js"))
    .pipe(browserSync.stream());
});

gulp.task("watching", function () {
  gulp.watch(["app/scss/style.scss"], gulp.parallel("styles"));
  gulp.watch(["app/images/src"], gulp.parallel("images"));
  gulp.watch(["app/js/main.js"], gulp.parallel("scripts"));
  gulp.watch(["app/components/*", "app/pages/*"], gulp.parallel("pages"));
  gulp.watch(["app/*.html"]).on("change", browserSync.stream);
});

gulp.task("browsersync", function () {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
});

gulp.task(
  "default",
  gulp.parallel("styles", "scripts", "browsersync", "watching")
);

gulp.task("cleanDist", function (done) {
  if (fs.existsSync("./dist")) {
    return gulp.src("./dist").pipe(clean({ force: true }));
  }
  done();
});

gulp.task("building", function () {
  return gulp
    .src(
      [
        "app/css/style.min.css",
        "app/fonts/*.*",
        "app/js/main.min.js",
        "app/**/*.html",
        "app/images/*.*",
        "!app/images/*.svg",
        "!app/images/stack",
        "app/images/sprite.svg",
      ],
      {
        base: "app",
      }
    )
    .pipe(gulp.dest("dist"));
});

gulp.task("build", gulp.series("cleanDist", "building"));
