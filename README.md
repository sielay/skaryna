# Skaryna

![Skaryna Logo](logo.png?raw=true "" =250x)

**NPM, BOWER** users. I am only locking package name. Package is not ready for use.

## Inspirations

 * [MediumEditor](https://github.com/yabwe/medium-editor)
 * [Carbon](https://github.com/manshar/carbon)
 * [ProseMirror](prosemirror.net)

## Goals

 * Opinionated and restrictive
   * force structure
   * allow specifing allowed elements per area
 * With extendable model
 * Actual WYSIWYM (not like ProseMirror which break idea of WYSIWYM in approach to marks)
 * Touch and handheld friendly
 * Mordern browsers support only
 * Easilly skinnable and extendable
 * Server side processing
 * No added tags or styles (not like ProseMirror which while editing adds loads)
 * Multiple editors on page support
 * Use only `data-*` attributes
 * Loads from Text, HTML Markdown, Carbon and ProseMirror formats.
 * Allows usage as just single elements (like `h1`)
 * Allows attaching own render
 * Lack of dependencies
 * Multiple documents
 * Not allow inline images
   * That means image can't be added inside paragraph, heading or other text node
   * Still can be positioned around text with styles
   * Restriction is only semantic

 * TextNodes
  * Text - standalone
  * Paragraph
  * Heading
  * Quote
 * BlockNodes
  * Image
  * Video
  * Embed
  * Component
  * Table
  * List

Carbon looks like best example to complete goals, but one, last but not least goal is to increase understanding of `contentEditable` within our team.

Project will be lead in align with [POM](https://github.com/getlackey/lackey-cms/wiki/POM) definition from Lackey CMS.

## Architecture

```

/------
| Ed
\---


```

## Project Name

Francysk Skaryna (pronounced [franˈt͡sɨsk skaˈrɨna]; or Skoryna; Belarusian: Францыск (Францішак[1]) Скарына; ca. 1490–before 29 January 1552) was a Belarusian humanist, physician, translator and one of the first book printers in Eastern Europe, laying the groundwork for the development of the Belarusian language. More on [Wikipedia](http://en.wikipedia.org/wiki/Francysk_Skaryna).

## Licence

MIT forever

