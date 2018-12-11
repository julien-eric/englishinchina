const minify = require('@node-minify/core');
const gcc = require('@node-minify/google-closure-compiler');
const cleanCSS = require('@node-minify/clean-css');

// CSS
let cssMinPromise = minify({
    compressor: cleanCSS,
    input: './public/stylesheets/*.css',
    output: './public/stylesheets/dist/slworld.css'
});

cssMinPromise.then(function (min) {
    console.log(min);
});
cssMinPromise.catch(function (err) {
    console.log(err);
});


// // Third-party libs
// let thirdPartyMinPromise = minify({
//     compressor: gcc,
//     input: './public/javascripts/libs/bkp/*.js',
//     output: './public/javascripts/dist/slworldlibs.js'
// });

// thirdPartyMinPromise.then(function (min) {
//     console.log(min);
// });
// thirdPartyMinPromise.catch(function (err) {
//     console.log(err);
// });


// // SLWORLD front-end
// let promise = minify({
//     compressor: gcc,
//     input: './public/javascripts/*.js',
//     output: './public/javascripts/dist/slworld.js'
// });

// promise.then(function (min) {
//     console.log(min);
// });
// promise.catch(function (err) {
//     console.log(err);
// });
