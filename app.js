#!/usr/bin/env node

var _ = require('underscore');
var async = require('async');
var path = require('path');

var argv = require('minimist')(process.argv.slice(2));

var GalleryTool = require(__dirname + '/lib/GalleryTool');

if(!argv._.length) {
    console.log('Missing json path.');
    process.exit(255);
}

var json = require(path.resolve(argv._[0]));

(new GalleryTool(json, argv)).render(function() {

});
