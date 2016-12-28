
var gulp = require('gulp');
var wrapper = require('gulp-wrap');
var pkg = require('./package.json');
var date = (new Date).toISOString().substring(0,10);
var anonymous = '/** @ignore */\n(function () {\'use strict\';\n<%= contents %>\n})()';
var license = '/*\n * s-router version '+pkg.version+' at '+date+
    '\n * @license MIT License Copyright (c) 2016 Serhii Perekhrest <allsajera@gmail.com> ( Sajera )\
    \n */\n<%= contents %> ';

function src ( name ) {
    return gulp.src(['lib/*.js'])
        .pipe(require('gulp-order')([ // queue of files
            'util.js',
            'super.js',
            'endpoint.js',
            'unit.js',
            'router.js',
            'define.js'
        ]))
        .pipe( require('gulp-concat')(name||'s-router.js') )
        .pipe( wrapper(anonymous) );
}

gulp.task('concat', function () {
    return src('s-router.js')
        .pipe( wrapper(license) )
        .pipe( gulp.dest('./') );
});

gulp.task('minify', function () {
    return src('s-router.min.js')
        .pipe( require('gulp-uglify')() )
        .pipe( wrapper(license) )
        .pipe( gulp.dest('./') );
});

gulp.task('lint', function () {
    return gulp.src(['s-router.js','s-router.min.js'])
        .pipe( require('gulp-eslint')() )
        .pipe( require('gulp-eslint').format() )
        .pipe( require('gulp-eslint').failAfterError() );
});

gulp.task('tests', function ( done ) {
    return gulp.src('test/test.js', {read: false})
        .pipe( require('gulp-mocha')({reporter: 'spec'}) );
});

gulp.task('watch', ['build'], function () {
    
    gulp.watch('lib/*.js', ['concat']);

});

gulp.task('build', ['concat', 'minify'], function () {
    gulp.start('lint');
    // gulp.start('tests');
});
