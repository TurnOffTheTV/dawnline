# DLP Reference

This file explains the structure of DLP files so they can be used in other places, and so that contributors to this project can know how to work with them.

## Header

The header consists of 3 main parts, the file identifier, the name, and the channel count.

The file identifier is three bytes at the beginning, `DLP` in ASCII or `44 4C 50` in hex.

The name has 2 parts to it, the length, stored in one byte which is an unsigned integer, and the actual text in ASCII. The default name "New Project" would look like this: `0B 4E 65 77  20 50 72 6F  6A 65 63 74`.

The final part is the channel count, simply an unsigned 16-bit integer with the number of channels.

## Channels

After the header come the channels. They have just a little bit of info about each one, but they are mostly the data inside.