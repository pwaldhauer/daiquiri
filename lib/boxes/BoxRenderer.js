var BoxRenderer = function BoxRenderer(tool) {
    this.tool = tool;
}

BoxRenderer.prototype = Object.create(Object.prototype);

BoxRenderer.prototype.shouldRender = function shouldRender(box) {
    return false;
}

BoxRenderer.prototype.renderBox = function renderBox(box, callback) {
    callback(null);
}


module.exports = BoxRenderer;
