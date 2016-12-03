var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var jasmine = require('gulp-jasmine-node');

gulp.task("copy-json", function() {
    return gulp.src("src/**/*json", { base: 'src' }).pipe(gulp.dest("lib"));
});
gulp.task("copy-txt", function() {
    return gulp.src("src/**/*txt", { base: 'src' }).pipe(gulp.dest("lib"));
});
gulp.task("copy-jg", function() {
    return gulp.src("src/**/*jg", { base: 'src' }).pipe(gulp.dest("lib"));
});
gulp.task("default", ["copy-json", "copy-txt", "copy-jg"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("lib/natural"));
});
gulp.task("test", ["default"], function () {
    return gulp.src(["spec/*js"]).pipe(jasmine({ verbose: false, timeout: 10000, color: true }))
});
