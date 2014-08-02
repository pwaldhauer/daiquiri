#!/usr/bin/env node

var _ = require('underscore');
var async = require('async');
var path = require('path');
var ncp = require('ncp').ncp;

var argv = require('yargs')
    .usage('Usage: $0 [path-to-json]')
    .demand(1)
    .boolean('c')
    .alias('c', 'create')
    .describe('c', 'Create a new and empty JSON file')
    .boolean('f')
    .alias('f', 'force-images')
    .describe('f', 'Force regeneration of all images')
    .boolean('q')
    .alias('q', 'quiet')
    .describe('q', 'Quiet mode')
    .boolean('j')
    .alias('j', 'open')
    .describe('j', 'Automatically open output file')
    .argv;

if(argv.c) {
    ncp(__dirname + '/template/default.json', path.resolve(argv._[0]), function (err) {
        process.exit(0);
    });

    return;
}

var GalleryTool = require(__dirname + '/lib/GalleryTool');
var json = require(path.resolve(argv._[0]));
(new GalleryTool(json, argv)).render(function() {

});
