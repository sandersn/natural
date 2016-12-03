var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var jasmine = require('gulp-jasmine');

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("lib/natural"));
});
gulp.task("test", ["default"], function () {
    return gulp.src("spec/*js").pipe(jasmine({ verbose: true}))
});
