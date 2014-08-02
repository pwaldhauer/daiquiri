# daiquiri

Hi! daiquiri is a tool to create [exposure.so](http://exposure.so)-like image galleries as static files based on a configuration passed in as a JSON file.

When exposure.so launched sometime last year, I really liked the approach and interface but I want more control over the layout and my files. Also, I want to include the galleries in my blog and I don't want to pay nine dollars a month to another service for hosting my image files.

You can take a look at [an example in my blog](http://knuspermagier.de/galerie/helgoland).

## Features

- You provide a JSON file that describes the layout of your image gallery
- daiquiri creates an HTML file containing the necessary markup
- daiquiri automatically creates multiple versions of the used images (fitting sizes for the boxes in the grid, retina versions, low res versions for unveil.js)
- The default templates comes with a [Flexbox](http://caniuse.com/#feat=flexbox) powered responsive layout, support for [unveil.js](https://github.com/luis-almeida/unveil) and a [nice Lightbox](http://dimsemenov.com/plugins/magnific-popup/) -- but it's easily customizable using CSS and stuff!

## Things not included

- A super easy visual editor for the JSON file, but you can use Photoshop and convert the psd with [daiquiri-psd](https://github.com/pwaldhauer/daiquiri-psd)
- A super easy Wordpress plugin

## What you can do

- Test it!
- Star it!
- Fork it!
- Make it better!

## Installation

`sudo npm install -g daiquiri`

(Or clone this repo)

Also you'll need [graphicsmagick](http://www.graphicsmagick.org/). (OS X: `brew install graphicsmagick`)

## Usage

`daiquiri [json file]`

Most of the configuration is embedded in the JSON file, but there are some command line arguments:

- *--force-images*: Forces the recreation of images. By default images won't be recreated if the files already exist in the target directory.
- *--quiet*: Do not print anything to the console while processing
- *--open*: Open the generated file in your browser automatically (Only works on Mac OS because it uses the `open` command, I guess.)

You can use `daiquiri -c [json file]` to create a brand new and empty JSON file.

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

With `meta.output.template` you can specify the path to a template file if you don't want to use the default one. Please take a look at the included default template to see how it works. (It's using the [ejs](https://github.com/visionmedia/ejs) templating engine).

The `meta.layout` fields are used to calculate the size of the fitting images for the grid. If you change the CSS (i.e. make the column wider) you may need to change this values.

You can have as many sections and boxes as you want. Currently daiquiri supports two types of boxes: `text` and `image`. The latter supports the sizes `grid`, which creates a grid-like structure based on how many images are provided, and `full`, which creates a full-size image that scales to the viewport's width.

The path of the images is constructed using the `meta.input` fields and the strings you define in the `media` arrays of the boxes. `"media": ["1175"]` becomes "`meta.input.prefix` + 1175 + `meta.input.suffix`" = `images/IMG_1175.jpg`, so you won't need to type the whole filename everytime.

For a real-world example take a look at [this JSON file](https://s3-eu-west-1.amazonaws.com/knusperfiles/helgoland.json) I used to create [the gallery in my blog](http://knuspermagier.de/galerie/helgoland).

## License

MIT
