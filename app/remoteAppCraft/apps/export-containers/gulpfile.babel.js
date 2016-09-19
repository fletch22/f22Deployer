import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('scripts', () => gulp.src([
  './**/*.js',
  '!./node_modules/**'
]).pipe(babel())
  .pipe(gulp.dest('./dist/'))
);

gulp.task('default', ['scripts']);
