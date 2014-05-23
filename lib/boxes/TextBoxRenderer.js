var _ = require('underscore');
var async = require('async');
var markdown = require("markdown").markdown;

var BoxRenderer = require(__dirname + '/BoxRenderer');

var TextBoxRenderer = function TextBoxRenderer(tool) {
    this.tool = tool;
}

TextBoxRenderer.prototype = Object.create(BoxRenderer.prototype);

TextBoxRenderer.prototype.shouldRender = function shouldRender(box) {
    return box.type === 'text';
}

TextBoxRenderer.prototype.renderBox = function renderBox(box, callback) {
    var text_rendered = '';

    box.paragraphs.forEach(function(p) {
        text_rendered += markdown.toHTML(p);
    })

    box.text_rendered = text_rendered;
    box.box_classes = 'box box-text';

    return callback();
}

module.exports = TextBoxRenderer;
