# Trevi

A Typescript based parser for the screenplay format [Fountain](http://fountain.io/). It is directly inspired by and (largly) copied from [Fountain.js](https://github.com/mattdaly/Fountain.js) by [mattdaly](https://github.com/mattdaly).

## Installation

```
npm install trevi --save
# or
yarn add trevi
```

## Usage

```
import Trevi from "trevi"

const trevi = new Trevi(fountainString)
```

### Blocks

Each section in the Fountain string is parsed into `block`s assigned with a type (e.g. ACTION, CHARACTER, DIALOGUE, etc).

```
const blocks = trevi.blocks
```

### Scenes

A scene consists of a slugline (scene heading) and the following blocks until the next slugline.

```
const scenes = trevi.scenes
```
