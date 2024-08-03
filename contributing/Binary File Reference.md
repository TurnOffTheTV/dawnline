# Binary File Reference

This file explains the structure of DLP and DLSP files so they can be used in other places, and so that contributors to this project can know how to work with them.

## DLP Files

These files are the main Dawnline project file

### DLP Header

The header consists of 3 main parts, the file identifier, the name, and the channel count.

The file identifier is three bytes at the beginning, `DLP` in ASCII or `44 4C 80` in hex.

The name has 2 parts to it, the length, stored in one byte which is an unsigned integer, and the actual text in ASCII. The default name "New Project" would look like this: `0B 4E 65 77  20 50 72 6F  6A 65 63 74`.

The project's sample rate is stored as a long integer

The

The final part is the channel count, simply an unsigned 16-bit integer with the number of channels.

### Channels

After the header come the channels. They have just a little bit of info about each one, but they are mostly the data inside.

The first part of a channel is the ID. The channel's ID is a 5-digit number, and it is being stored in 5 bytes, as the ASCII of the number. So the ID `12345` would look like `31 32 33 34 35`.

Next is the name. It is stored in the same way as the project's overall name, one byte for length and the rest as the ASCII.

Next is the pan. This is stored in a float, so it takes up 4 bytes.

Next is the channel's data. If it's an audio channel, it's the audio stored in pretty much a .wav file.

## DLSP Files

These files contain synth patches

### DLSP Header

The header consists of 3 main parts, the file identifier, the name, and the module count.

The file identifier is three bytes at the beginning, `DLSP` in ASCII or `44 4C 53 80` in hex.

The name has 2 parts to it, the length, stored in one byte which is an unsigned integer, and the actual text in ASCII. The default name "New Synth Patch" would look like this: `0F 4E 65 77  20 53 79 6E  74 68 20 50  61 74 63 68`.

The final part is the module count, simply an unsigned 16-bit integer with the number of modules.

### Modules

After the header come the modules. Each has a number giving which type of module it is, an ID, and the IDs of the modules connected to their inputs and outputs.

The module's type is an 8-bit unsigned integer that comes straight from the JS, in each module's `type` property.

The module's ID is a 5-digit number, and it is being stored in 5 bytes, as the ASCII of the number. So the ID `12345` would look like `31 32 33 34 35`.

Lastly is the connections. This will be different from each module, but in their JS objects, they each have `inputs` and `outputs` arrays, and the connections will go in that order in the file, inputs then outputs.
