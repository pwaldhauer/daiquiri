var _ = require('underscore');
var async = require('async');

var BoxRenderer = require(__dirname + '/BoxRenderer');

var VideoBoxRenderer = function VideoBoxRenderer(tool) {
    this.tool = tool;
}

VideoBoxRenderer.prototype = Object.create(BoxRenderer.prototype);

VideoBoxRenderer.prototype.shouldRender = function shouldRender(box) {
    return box.type === 'video';
}

VideoBoxRenderer.prototype.renderBox = function renderBox(box, callback) {
    var that = this;

    box.poster_url = ''; // maybe take first image in array?!?!

    box.videos = box.media

    box.sources = [

        {
            url: '',
            type: 'video/mp4'
        },

        {
            url: '',
            type: 'video/webm'
        },

        {
            url: '',
            type: 'video/ogg'
        },


    ];

    // Determine Classes
    box.box_classes = that._boxClass(box).join(' ');

    return callback();
}


VideoBoxRenderer.prototype._boxClass = function _boxClass(box) {
    var box_classes = ['box', 'box-video'];
    if (box.size === 'full') {
        box_classes.push('box-video-full');
        return box_classes;
    }

    return box_classes;
}

module.exports = VideoBoxRenderer;
