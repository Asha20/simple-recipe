Table of Contents:

- [What is Simple Recipe?](#what-is-simple-recipe)
	- [What's wrong with vanilla recipes?](#whats-wrong-with-vanilla-recipes)
	- [Features](#features)
	- [Examples](#examples)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [How to Build](#how-to-build)

# What is Simple Recipe?

It's command line interface that makes writing Minecraft datapack recipes simpler and more pleasant.

## What's wrong with vanilla recipes?

- Writing vanilla recipes in JSON is tedious and error-prone.
- Malformed recipes will silently error with no feedback provided.
- One recipe corresponds to one file, which can be clunky for large datapacks.
- Since recipes are written in JSON, you can't add comments.

## Features

- Recipes are defined in YAML which is a terser, more human-friendly format for writing.
- Descriptive errors make debugging malformed recipes a lot simpler.
- Define multiple recipes per file.
- You can add comments to your recipes in YAML.
- Provides a migrate utility which lets you convert existing vanilla datapacks to Simple Recipe automatically.

## Examples

Instead of writing recipes like this:

```json
{
	"type": "minecraft:crafting_shaped",
	"pattern": ["CCC", "CBC", "CRC"],
	"key": {
		"R": { "item": "minecraft:redstone" },
		"C": { "item": "minecraft:cobblestone" },
		"B": { "item": "minecraft:bow" }
	},
	"result": { "item": "minecraft:dispenser" }
}
```

You can write them like this:

```yaml
type: crafting_shaped
pattern:
  - CCC
  - CBC
  - CRC
key: { R: redstone, C: cobblestone, B: bow }
result: 1 dispenser
```

Or instead of like this:

```json
{
	"type": "minecraft:crafting_shapeless",
	"group": "concrete_powder",
	"ingredients": [
		{ "item": "minecraft:black_dye" },
		{ "item": "minecraft:sand" },
		{ "item": "minecraft:sand" },
		{ "item": "minecraft:sand" },
		{ "item": "minecraft:sand" },
		{ "item": "minecraft:gravel" },
		{ "item": "minecraft:gravel" },
		{ "item": "minecraft:gravel" },
		{ "item": "minecraft:gravel" }
	],
	"result": {
		"item": "minecraft:black_concrete_powder",
		"count": 8
	}
}
```

You write them like this:

```yaml
type: crafting_shapeless
group: concrete_powder
ingredients: [1 black_dye, 4 sand, 4 gravel]
result: 8 black_concrete_powder
```

# Installation

If you are familiar with Node.js and NPM, you can globally install the package, and use `simple-recipe`:

    $ npm install -g simple-recipe
    $ simple-recipe --help

If you aren't familiar with Node.js and NPM, you can download a packaged executable file from [Releases](https://github.com/Asha20/simple-recipe/releases).

# How to Use

[Usage instructions can be found here.](docs/usage.md)

# How to Build

If you'd like to tinker around with the code, clone the repo and install the dependencies:

    $ git clone https://github.com/Asha20/simple-recipe
    $ cd simple-recipe
    $ npm install

Compile the code on change:

    $ npm run watch

Run unit tests:

    $ npm run test:unit

Run end-to-end tests:

    $ npm run test:e2e

Run all tests:

    $ npm run test

Compile the code and package it into standalone executables:

    $ npm run build

Release a new version:

    $ npm run release
