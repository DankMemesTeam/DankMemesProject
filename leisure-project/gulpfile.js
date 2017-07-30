const config = require('./config/config').dev;
const logger = require('./config/logger-conf');

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
const minify = require('gulp-minify');

const app = require('./config')(logger);
let server = null;

gulp.task('start', () => {
  return app
    .then((application) => {
      application.listen(config.port, () =>
        logger.debug('Express server listening on port ' + config.port)
      )
    });
});

// Fix the following when needed

gulp.task('server:restart', () => {
  const pr = Promise.resolve();
  if (server) {
    pr.then(() => server.close());
  }

  return pr.then(() => {
    server = app.listen(config.port, () =>
      logger.debug('Express server listening on port ' + config.port)
    );
  });
});

gulp.task('dev', ['server:restart'], () => {
  return nodemon({
    ext: 'js',
    tasks: ['server:restart'],
    script: 'server.js',
  });
});

gulp.task('test:unit', () => {
  gulp.src('tests/**/*.js')
    .pipe(mocha({
      reporter: 'nyan',
    }));
});

// Useless atm
gulp.task('minify:js', () => {
  gulp.src(['app/**/*.js', 'config/**/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', [
  'dev',
]);
