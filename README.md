# $toolname

Hi! $toolname is a tool to create [exposure.so](http://exposure.so)-like image galleries as static files based on a configuration passed in as a JSON file.

When exposure.so launched somewhen last year I really liked the approach and interface, but I want more control over the layout and my files. Also I want to include the galleries in my blog and I don't want to pay nine dollars a month to another service for hosting my image files.

You can take a look at [an example in my blog](http://knuspermagier.de/galerie/helgoland).

## Features

- You provide a JSON file that describes the layout of your image gallery
- $toolname creates a HTML file containing the necessary markup
- $toolname automatically creates multiple versions of the used images (fitting sizes for the boxes in the grid, retina versions, low res versions for unveil.js)
- The default templates comes with a [Flexbox](http://caniuse.com/#feat=flexbox) powered responsive layout, support for [unveil.js](https://github.com/luis-almeida/unveil) and a [nice Lightbox](http://dimsemenov.com/plugins/magnific-popup/) -- but it's easily customizable using CSS and stuff!

## Things not included

- A super easy visual editor for the JSON file
- A super easy Wordpress plugin

## What you can do

- Test it!
- Star it!
- Fork it!
- Make it better!

## Installation

`sudo npm install -g $toolname`

(Or clone this repo)

Also you'll need [graphicsmagick](http://www.graphicsmagick.org/). (OS X: `brew install graphicsmagick`)

## Usage

`$toolname [json file]`

Most of the configuration is embedded in the JSON file, but there are some command line arguments:

- *--force-images*: Forces the recreation of images. By default images won't be recreated if the files already exist in the target directory.
- *--quiet*: Do not print anything to the console while processing
- *--open*: Open the generated file in your browser automatically (Only works under Mac OS, because it uses the `open` command, I guess.)

## The magical JSON file

The format of the JSON file is quite self-explanatory. Currently all fields you see in the following example are mandatory.

````
{
    "meta": {
        "title": {
            "headline": "Big title",
            "subtitle": "Some subtitle",
            "author": {
                "name": "Philipp Waldhauer",
                "url": "http://knuspermagier.de"
            },
            "media": ["title_image"]
        },

        "input": {
            "prefix": "images/IMG_",
            "suffix": ".jpg"
        },

        "output": {
            "template": "default",
            "prefix": "build/",
            "image_prefix": "images/",
            "file": "index.html",
            "url": "build/",
            "quality_main": 87,
            "quality_retina": 78,
            "quality_lowres": 10
        },

        "layout": {
            "big_width": 1024,
            "full_width": 1440,
            "grid_spacing": 10
        }
    },

    "sections": [
        {
            "title": "Very interesting first section",
            "boxes": [
            {
                    "type": "text",
                    "paragraphs": [
                        "Very interesting text.",
                        "Another paragraph"
                    ]
                }, {
                    "type": "image",
                    "size": "grid",
                    "media": ["1158", "1171"]
                },

                {
                    "type": "image",
                    "size": "full",
                    "media": ["1175"]
                }
            ]
        }
    ]
}

````

With `meta.output.template` you can specify the path to a template file if you don't want to use the default one. Please take a look at the shipped default template to learn how it needs to look. (It's using ejs as templating engine).

The `meta.layout` fields are used to calculate the size of the fitting images for the grid. If you change the CSS (i.e. make the column wider) you may need to change this values.

You can have as many sections and boxes as you want. Currently $toolname supports two types of boxes: `text` and `image`. The latter supports the sizes `grid`, which creates a grid-like structure based on how many images are provided, and `full`, which creates a full-size image with scales to the viewports width.

The path of the images is constructed using the `meta.input` fields and the string you define in the `media` arrays of the boxes. So `"media": ["1175"]` gets `meta.input.prefix` + 1175 + `meta.input.suffix` = `images/IMG_1175.jpg`. This is mainly to save you some time typing the whole filename everytime.

For a real-world example take a look at [this JSON-file](http://knuspermagier.de/galerie/helgoland) I used to create [the gallery in my blog](http://knuspermagier.de/galerie/helgoland).

## License

MIT
