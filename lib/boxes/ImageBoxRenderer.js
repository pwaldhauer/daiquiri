var _ = require('underscore');
var async = require('async');

var BoxRenderer = require(__dirname + '/BoxRenderer');

var ImageBoxRenderer = function ImageBoxRenderer(tool) {
    this.tool = tool;
}

ImageBoxRenderer.prototype = Object.create(BoxRenderer.prototype);

ImageBoxRenderer.prototype.shouldRender = function shouldRender(box) {
    return box.type === 'image';
}

ImageBoxRenderer.prototype.renderBox = function renderBox(box, callback) {
    var that = this;

    var images = [];
    box.media.forEach(function(image) {
        var obj = that.tool._imageObjectFromString(image); // <---
        obj.images_in_box = box.media.length;
        obj.is_full = (box.size === 'full');
        obj.box = box;

        images.push(obj);
    });

    box.images = images;
    box.landscape_images = _.filter(images, function(image) {
        return image.is_landscape
    });

    box.portrait_images = _.filter(images, function(image) {
        return !image.is_landscape
    });

    // Determine Classes
    box.box_classes = that._boxClass(box).join(' ');

    return callback();
}


ImageBoxRenderer.prototype._boxClass = function _boxClass(box) {
    /*
    possible returns:

    box-image-grid-full (for at least 3 images)
    box-image-grid-2 (for 2 images)
    box-image-grid-1 (for 1 image)

    box-image-grid-portrait (if a portrait image is included)
    */

    box.has_portrait = false;

    var box_classes = ['box', 'box-image'];
    if (box.size === 'full') {
        box_classes.push('box-image-full');
        return box_classes;
    }

    box_classes.push('box-image-grid');

    var portrait_index = this._getPortraitIndex(box);
    if (portrait_index !== -1) {
        box.has_portrait = true;
    }

    if (portrait_index > 0) {
        box_classes.push('box-image-grid-portrait-last');
    }

    if (box.media.length == 1) {
        box_classes.push('box-image-grid-1');
    } else if (box.media.length == 2 || (box.media.length%2 == 0)) {
        box_classes.push('box-image-grid-2');
    } else if (box.has_portrait) {
        box_classes.push('box-image-grid-portrait');
    } else {
        box_classes.push('box-image-grid-full');
    }

    return box_classes;
}

ImageBoxRenderer.prototype._getPortraitIndex = function _getPortraitIndex(box) {
    var result = [];
    for (var i in box.images) {
        if (!box.images[i].is_landscape) {
            return parseInt(i, 10);
        }
    }

    return -1;
}


module.exports = ImageBoxRenderer;
