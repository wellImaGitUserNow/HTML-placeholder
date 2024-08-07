# Placeholder Text & Image Generator - VS Code Extension

Welcome to the Placeholder Text & Image Generator, a VS Code extension designed to make your web development process smoother by allowing you to easily insert placeholder text and images directly within the editor.

## Features

- **Placeholder Text Generation:**
  - Generate lorem ipsum text on the fly by typing `/lorem (p|w|l) [number]`:
    - `p`: Generate [number] of paragraphs.
    - `w`: Generate [number] of words.
    - `l`: Generate [number] of list items.

- **Placeholder Image Generation:**
  - Easily insert placeholder images by typing `<img "[query]" [size OR orientation] [color]`:
    - `query`: Search term for the desired image.
    - `size`: Desired size of an image (e.g., tiny, small, medium, large, xlarge).
    - `orientation`: Image orientation (e.g., landscape, portrait).
    - `color`: Dominant color of the image, which can be a named color or a hex value.

    *Note: All images are provided by the [Pexels API](https://www.pexels.com).*

## Supported Languages

This extension is dedicated to web development and supports only HTML and PHP languages.

## Installation

*This section will be provided after extension publication.*

## Usage

### Generating Lorem Ipsum Text

To generate lorem ipsum text, use the following syntax in the editor:

- `/lorem p [number]`

  Example: `/lorem p 3` generates 3 paragraphs.

- `/lorem w [number]`

  Example: `/lorem w 10` generates 10 words.

- `/lorem l [number]`

  Example: `/lorem l 5` generates a list with 5 items.

### Generating Placeholder Images

To insert a placeholder image, use the following syntax:

- `<img "[query]" [size || orientation] [color]`

  - **Example 1**: `<img "nature" landscape green` generates an image of nature with landscape orientation and green color.
  - **Example 2**: `<img "nature" xlarge "#ff5733"` generates an extra-large image of nature with a hex color `#ff5733`.

**Note:** The current pattern recognition requires that generation phrases (commands) be used on a new, empty line in order to be highlighted correctly.

## Contributing

*This section will be provided after extension publication.*

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Thanks to Pexels for providing the images.
Inspired by the need to streamline the development process with easy access to placeholder content.

## Contact

*This section will be provided after extension publication.*

Thank you for your interest in the Placeholder Text & Image Generator extension! The project will be published and ready to use soon!