import gulp from 'gulp';
import babel from 'gulp-babel';
import jasmine from 'gulp-jasmine';
import runSequence from 'run-sequence';

gulp.task('scripts', () => gulp.src([
  './app/**/*.js',
  '!./app/remoteAppCraft/apps/**/*.js',
  '!./node_modules/**'
])
  .pipe(babel())
  .pipe(gulp.dest('./dist/'))
);

gulp.task('watch', () => {
  gulp.watch([
    './app/**/*.js',
    '!./app/remoteAppCraft/apps/**/*.js'
  ],
    ['scripts']);
});

gulp.task('test-watch', () => {
  gulp.watch([
    './app/**/*.js',
    '!./app/remoteAppCraft/apps/**/*.js'
  ], ['build-test']);
});

gulp.task('build-test', (callback) => {
  runSequence('scripts', 'test-jasmine', callback);
});

gulp.task('test-jasmine', () => {
  return gulp.src('dist/__tests__/**/*.js')
    .pipe(jasmine());
});

gulp.task('test', (callback) => {
  return runSequence('test-watch', 'test-jasmine', callback);
});

gulp.task('default', ['scripts', 'watch']);
