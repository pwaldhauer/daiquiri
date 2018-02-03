var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var ejs = require('ejs');
var gm = require('gm');
var optimizer = require('image-optim');
var imageinfo = require('imageinfo');
var ncp = require('ncp').ncp;
ncp.limit = 16;
var exec=require('child_process').exec;

var TextBoxRenderer = require(__dirname + '/boxes/TextBoxRenderer');
var ImageBoxRenderer = require(__dirname + '/boxes/ImageBoxRenderer');
var VideoBoxRenderer = require(__dirname + '/boxes/VideoBoxRenderer');

var GalleryTool = function(json, options) {
    this.options = options;
    this.json_original = json;
    this.json = _.clone(json);

    this.renderer = [
        new TextBoxRenderer(this),
        new ImageBoxRenderer(this),
        new VideoBoxRenderer(this)
    ];

}

GalleryTool.prototype = Object.create(Object.prototype);

GalleryTool.prototype.render = function render(zallback) {
    var that = this;

    that._log('> RENDER ALL THE THINGS');

    // Reset
    this.json = _.clone(this.json_original);
    that._createDirectories();

    // Title
    this.json.meta.title.background_image = this._getImageOutputUrl(this.json.meta.title.media[0], 'fitting');

    async.waterfall([

        function renderSections(callback) {
            var queue = async.queue(that._renderSection.bind(that), 10);
            queue.drain = function() {
                that._log('>> Done!');
                callback(null, _.flatten(_.pluck(that.json.sections, 'boxes')));
            };

            queue.push(that.json.sections);

            that._log('> Rendering ' + that.json.sections.length + ' sections.');
        },

        function renderBoxes(boxes, callback) {
            var queue = async.queue(that._renderBox.bind(that), 10);
            queue.drain = function() {
                that._log('>> Done!');
                callback(null, _.flatten(_.pluck(boxes, 'images')));
            };

            queue.push(boxes);

            that._log('> Rendering ' + boxes.length + ' boxes.');
        },

        function renderImages(images, callback) {

            var title_image = that._imageObjectFromString(that.json.meta.title.media[0]);
            title_image.is_full = true;
            title_image.images_in_box = 1;
            images.push(title_image);

            var queue = async.queue(that._processImage.bind(that), 10);
            queue.drain = function() {
                that._log('>> Done!');
                callback(null);
            };

            queue.push(images);
            that._log('> Rendering ' + images.length + ' images.');
        },

        function renderTemplate(callback) {
            that._log('> Rendering template.');

            var template_file = that.json.meta.output.template === 'default' ? __dirname + '/../template/template.html' : that.json.meta.output.template;
            var template = fs.readFileSync(template_file, 'utf8');

            var rendered = ejs.render(template, {
                json: that.json
            });

            fs.writeFileSync(that._getOutputPath(that.json.meta.output.file), rendered, 'utf8');

            // Copy shit
            if(that.json.meta.output.template === 'default') {
                ncp(__dirname + '/../template/', that.json.meta.output.prefix, function (err) {
                    fs.unlinkSync(that.json.meta.output.prefix + '/template.html');

                    that._log('>> Done!');

                    if(that.options.open) {
                        that._log('Opening "' + that._getOutputPath(that.json.meta.output.file) + '" for you :)');
                        exec('open ' + that._getOutputPath(that.json.meta.output.file));
                    } else {
                        that._log('Just open "' + that._getOutputPath(that.json.meta.output.file) + '" :)');
                    }


                    callback();
                });
            }

        }

    ], zallback);
}

GalleryTool.prototype._log = function _log(message) {
    if(this.options.quiet || this.options.q) {
        return;
    }

    console.log(message);
}

GalleryTool.prototype._createDirectories = function _createDirectories() {
    if(!fs.existsSync(this.json.meta.output.prefix)) {
        fs.mkdirSync(this.json.meta.output.prefix);
    }

    if(!fs.existsSync(this.json.meta.output.prefix + this.json.meta.output.image_prefix)) {
        fs.mkdirSync(this.json.meta.output.prefix + this.json.meta.output.image_prefix);
    }

}

GalleryTool.prototype._getInputPath = function _getInputPath(file) {
    return this.json.meta.input.prefix + file + this.json.meta.input.suffix;
}


GalleryTool.prototype._getOutputPath = function _getOutputPath(file) {
    return this.json.meta.output.prefix + file;
}


GalleryTool.prototype._getImageOutputPath = function _getImageOutputPath(file, version) {
    return this.json.meta.output.prefix + this.json.meta.output.image_prefix + file + '_' + version + this.json.meta.input.suffix;
}

GalleryTool.prototype._getImageOutputUrl = function _getImageOutputUrl(file, version, json) {
    return this.json.meta.output.url + this.json.meta.output.image_prefix + file + '_' + version + this.json.meta.input.suffix;
}

GalleryTool.prototype._isLandscape = function _isLandscape(image, cb) {
    var buffer = fs.readFileSync(image);
    var info = imageinfo(buffer);

    return info.width > info.height;
}

GalleryTool.prototype._imageObjectFromString = function _imageObjectFromString(image) {
    return {
        name: image,

        lowres: this._getImageOutputUrl(image, 'lowres'),
        fitting: this._getImageOutputUrl(image, 'fitting'),
        big: this._getImageOutputUrl(image, 'big'),
        big_retina: this._getImageOutputUrl(image, 'big@2x'),
        fitting_retina: this._getImageOutputUrl(image, 'fitting@2x'),

        is_landscape: this._isLandscape(this._getInputPath(image))
    }
}

GalleryTool.prototype._renderSection = function _renderSection(section, zallback) {
    var that = this;

    // Currently we don't need to do anything here.

    zallback();
}

GalleryTool.prototype._renderBox = function _renderBox(box, zallback) {
    var that = this;

    that.renderer.forEach(function(renderer) {
        if(!renderer.shouldRender(box)) {
            return;
        }

        renderer.renderBox(box, zallback);
    })
}

GalleryTool.prototype._processImage = function _processImage(image, callback) {
    if(_.isUndefined(image)) {
        return callback();
    }


    var that = this;

    var fitting_size = that.json.meta.layout.big_width;
    if (image.is_full) {
        fitting_size = that.json.meta.layout.full_width;
    } else {
        if(image.images_in_box%2 == 0) {
            fitting_size = (that.json.meta.layout.big_width / 2) - that.json.meta.layout.grid_spacing * 2;
        } else {
            fitting_size = (that.json.meta.layout.big_width / (image.images_in_box)) - that.json.meta.layout.grid_spacing * ((image.images_in_box > 2) ? image.images_in_box : 2);
        }

        // If there is a portrait, it's 50% regardless of how many images there are.
        if (image.box.has_portrait) {
            fitting_size = (that.json.meta.layout.big_width / 2) - that.json.meta.layout.grid_spacing * 2;
        }
    }

    var retina_size = fitting_size * 2;

    var big_size = that.json.meta.layout.big_width;
    var big_retina_size = big_size * 2;

    var sizes = [
        {
            "name": "fitting",
            "size": fitting_size,
            "quality": that.json.meta.output.quality_main
        },
        {
            "name": "fitting@2x",
            "size": fitting_size * 2,
            "quality": that.json.meta.output.quality_retina
        },
        {
            "name": "big",
            "size": that.json.meta.layout.big_width,
            "quality": that.json.meta.output.quality_main
        },
        {
            "name": "big@2x",
            "size": that.json.meta.layout.big_width * 2,
            "quality": that.json.meta.output.quality_retina
        },
        {
            "name": "lowres",
            "size": fitting_size,
            "quality": that.json.meta.output.quality_lowres
        }
    ];

    var queue = async.queue(function(size, cb) {
        if(fs.existsSync(that._getImageOutputPath(image.name, size.name)) && !that.options['force-images']) {
            return cb();
        }

        var pipeline = gm(that._getInputPath(image.name)).resize(size.size);

        if(size.name == 'lowres') {
            pipeline.blur(20, 30);
        }

        pipeline.quality(size.quality).write(that._getImageOutputPath(image.name, size.name), function(err) {
            optimizer.optimize(that._getImageOutputPath(image.name, size.name), cb);
        });
    }, 10)

    queue.drain = callback;

    queue.push(sizes);
}

module.exports = GalleryTool;
