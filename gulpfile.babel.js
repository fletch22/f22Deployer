import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('scripts', () => gulp.src('./app/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dist/'))
);

gulp.task('watch', () => {
  gulp.watch('./app/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);
