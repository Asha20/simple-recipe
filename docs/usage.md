Table of Contents:

- [How does Simple Recipe work?](#how-does-simple-recipe-work)
- [Your first recipe](#your-first-recipe)
- [Compiling a recipe](#compiling-a-recipe)
- [Watching recipes](#watching-recipes)
- [Error reporting](#error-reporting)
- [Multiple recipes per file](#multiple-recipes-per-file)
- [Name conflicts](#name-conflicts)
- [Migrating an existing datapack](#migrating-an-existing-datapack)
- [Command line options](#command-line-options)
- [The Ultimate Cookbook](#the-ultimate-cookbook)

# How does Simple Recipe work?

The primary goal of Simple Recipe is to make writing datapack recipes simpler and more pleasant. How does it go about doing that? Mainly in the following ways:

- Uses YAML instead of JSON since it's more human-friendly to type. Also, YAML has comments, which JSON doesn't.
- Allows multiple recipes inside a single file for ease of organization.
- Offers detailed error messages for malformed recipes.

The work-flow is rather simple:

1. You write your recipes inside a YAML file, following the Simple Recipe format. Minecraft datapacks can't recognize these files however.
2. You run `simple-recipe` on your YAML files.
3. Simple Recipe takes your YAML files and generates JSON files, which Minecraft datapacks *can* recognize.
4. Assuming the datapack is loaded, you use the `/reload` command in Minecraft to load the recipes you just made.  

# Your first recipe

We'll take a look at how to write your own recipes by going through a couple of existing recipes in vanilla Minecraft and rewriting them into the Simple Recipe format. What better place to start than the glorious crafting table recipe?

`crafting_table.json`

```json
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "PP",
    "PP"
  ],
  "key": {
    "P": {
      "tag": "minecraft:planks"
    }
  },
  "result": {
    "item": "minecraft:crafting_table",
    "count": 1
  }
}
```

We would rewrite this recipe like so:

`index.yml`

```yaml
_name: crafting_table
type: crafting_shaped
pattern:
  - PP
  - PP
key: {P: +planks}
result: 1 crafting_table
```

> **Note:** The name of our Simple Recipe file isn't special and can be anything, as long as it has the `.yml` extension.

First off, notice the special `_name` property. This property is required for every Simple Recipe. Since multiple recipes can be defined inside a single file, `_name` tells the program what the name of the generated output JSON should be for a given recipe.

While the `type` and `pattern` keys stay mostly the same, `key` and `result` have noticeable changes. In vanilla Minecraft recipes you will find "ingredient objects." The previous recipe has a tag ingredient for planks:

```json
{"tag": "minecraft:planks"}
```

Simple Recipe makes writing ingredients way less verbose:

```yaml
+planks
```

> **Note:** In Minecraft, when using various commands, tags are prefixed with `#` to denote that they are indeed tags and not items. In Simple Recipe, `+` is used to denote tags, as `#` is reserved by YAML for writing line comments.

As for the `result`, Simple Recipe uses a shorthand to define both the count and the item name:

```yaml
1 crafting_table
```

By default, non-namespaced items and tags will get the `minecraft:` namespace. You can also explicitly provide a namespace to an item or a tag.

# Compiling a recipe

Let's imagine that our datapack structure looks like this:

```
my-datapack/
├── data/
│   └── asha/
│       └── _recipes/
│           └── index.yml
└── pack.mcmeta
```

We've defined our `crafting_table` recipe inside `my-datapack/data/asha/_recipes/index.yml`. Now, we can compile it:

```
$ cd my-datapack/data/asha
$ simple-recipe compile _recipes recipes
```

We're using the `compile` command to convert recipes from the Simple Recipe format to JSON recipes recognized by Minecraft. We've provided the input directory, `_recipes`, and the output directory, `recipes`. After compiling we'll get the following output in the console:

```
  ✓ index.yml
```

This tells us that the recipe was compiled successfully. Our datapack directory now looks like this:

```
my-datapack/
├── data/
│   └── asha/
│       ├── recipes/
│       │   └── crafting_table.json
│       └── _recipes/
│           └── index.yml
└── pack.mcmeta
```

Simple Recipe has generated the `recipes/crafting_table.json` file for us. Assuming the datapack is loaded, we can now run `/reload` inside Minecraft to reload the datapack and use the new recipe.

> **Note:** Running `simple-recipe compile` will *delete* the output directory each time if it already exists. Storing files other than the generated JSON files is *not recommended*, as they will end up being deleted!

# Watching recipes

Running `simple-recipe compile` every time you make a change in your recipes is tedious and annoying. Simple Recipe comes with a file watcher that will automatically re-compile your recipes whenever the input directory changes.

Using the watcher is quite simple: all you have to do is replace the `compile` command with `watch`. So, if we wanted to continuously watch the previous datapack for recipe changes instead of compiling it only once, we would use:

```
$ simple-recipe watch _recipes recipes
```

After making some changes to a recipe and saving the file, the datapack will re-compile automatically. Next step is to `/reload` the datapack in-game to put the changes into effect.

> **Note:** Similarly to `simple-recipe compile`, `simple-recipe watch` will also *delete* the output directory each time if it already exists.

# Error reporting

One of Simple Recipe's biggest strengths is that it offers feedback if your recipe is malformed, whereas Minecraft will just silently ignore the malformed recipe, which makes debugging a lot harder. Let's go back to our crafting table example. This time, we'll rewrite it like so:

```
_name: crafting_table
type: shapedCrafting
pattern:
  - PA
  - PA
key: {P: +planks}
result: 1.5 crafing_table
```

There are plenty of problems with this recipe:

1. The type `shapedCrafting` is invalid.
2. An unknown `A` ingredient is in the pattern but isn't defined in the key.
3. The result count is 1.5, which is impossible.
4. The result item is misspelled; it says `crafing_table` instead of `crafting_table`.

Let's try watching the recipes for changes:

```
$ simple-recipe watch _recipes recipes
```

We get the following output:

```
  ✗ index.yml

root.crafting_table: Unknown type given.
```

The compilation failed because the recipe has an unknown type. Once we change the type back to `crafting_shaped` and save, it tries to re-compile and we get the following:

```
  ✗ index.yml

root.crafting_table.result: Item count must be an integer between 1 and 64.
root.crafting_table.result: Unknown item "crafing_table".

Perhaps you meant one of the following?

 - crafting_table
 - fletching_table
 - smithing_table
```

The two error messages helpfully point out that the mistakes are found in the `result` key of the `crafting_table` recipe. The first error tells us that we've provided an invalid result count. Simple Recipe will also recognize that the provided result item does not match any item that exists in Minecraft. This probably means that it was misspelled, so Simple Recipe will error and try to offer suggestions for the misspelled item.

Simple Recipe will use all of the items from the latest Minecraft version for its spell-checking capabilities. If you're writing a datapack for an older version of Minecraft, you can use the `--target` flag to select the version you're targeting.

If you would like to turn off the item spell-checker, use the `--no-spellcheck` flag.

After fixing the result count and result item name, we save the file and get the following output:

```
  ✗ index.yml

root.crafting_table: Unknown key found in pattern: "A".
```

After changing the invalid `A` keys into `P` keys, we've finally fixed all of the mistakes our recipe had. Saving the recipe:

```
  ✓ index.yml
```

Compilation was successful.

Here's an example of a recipe with an error that can be hard to spot:

```yaml
_name: fire_charge
type: crafting_shapeless
ingredients: [1 gunpowder, 1 blaze_powder, [1 coal, 1 chacoal]]
result: 3 fire_charge
```

Simple Recipe will pinpoint the exact location of the error for you:

```
  ✗ index.yml

root.fire_charge.ingredients[2][1]: Unknown item "chacoal".

Perhaps you meant one of the following?

 - charcoal
 - coal
```

# Multiple recipes per file

Right now, our `index.yml` file contains a single recipe: the shaped crafting table recipe. Let's also add the recipe for red concrete powder. Here's what the recipe would look like in JSON:

```json
{
  "type": "minecraft:crafting_shapeless",
  "group": "concrete_powder",
  "ingredients": [
    {"item": "minecraft:black_dye"},
    {"item": "minecraft:sand"},
    {"item": "minecraft:sand"},
    {"item": "minecraft:sand"},
    {"item": "minecraft:sand"},
    {"item": "minecraft:gravel"},
    {"item": "minecraft:gravel"},
    {"item": "minecraft:gravel"},
    {"item": "minecraft:gravel"}
  ],
  "result": {
    "item": "minecraft:black_concrete_powder",
    "count": 8
  }
}
```

And here's what it looks like after we've included it in our `index.yml` file:

```yaml
- _name: crafting_table
  type: crafting_shaped
  pattern:
    - PP
    - PP
  key: {P: +planks}
  result: 1 crafting_table

- _name: black_concrete_powder
  group: concrete_powder
  type: crafting_shapeless
  ingredients: [1 black_dye, 4 sand, 4 gravel]
  result: 8 black_concrete_powder
```

Notice how the recipes are now indented and starting with a `"-"`. With multiple recipes, our YAML file has become an array of recipes. We define each recipe in the array by prefixing it with `"-"`.

Secondly, notice how there's a lot less repetition in the Simple Recipe definition of `ingredients`. When defining a list of ingredient objects, instead of having to define the same ingredient multiple times, you can simply provide the ingredient count as a number.

# Name conflicts

Simple Recipe allows you to write multiple recipes inside a single YAML file. Each of these recipes will then get compiled into its own JSON file. This means that it is possible for name conflicts to occur. Simple Recipe will notify you of these conflicts so that you can resolve them.

For example, let's say we had a recipe file that looked like this:

```yaml
- _name: button
  type: crafting_shapeless
  ingredients: [1 oak_planks]
  result: 1 oak_button

- _name: button
  type: crafting_shapeless
  ingredients: [1 birch_planks]
  result: 1 birch_button

- _name: ender_eye
  type: crafting_shapeless
  ingredients: [1 ender_pearl, 1 blaze_powder]
  result: 1 ender_eye
```

We have two recipes with the same name, `button`, as well as one recipe with a unique name, `ender_eye`. After compiling, we get the following output:

```
  Name conflicts:

  - button in files: index.yml
```

Simple Recipe will refuse to compile both of the `button` recipes since they have conflicting names. However, `ender_eye` will compile successfully since it has no errors and does not have a name conflict.

# Migrating an existing datapack

Simple Recipe offers a `migrate` command which is pretty much the opposite of `compile`: it converts JSON recipes into YAML recipes. This makes it a lot easier to migrate large datapacks to Simple Recipe.

Imagine that we had a datapack with the following structure:

```
my-datapack/
├── data/
│   └── asha/
│       └── recipes/
│           ├── hopper_from_logs.json
│           └── sticks_from_logs.json
└── pack.mcmeta
```

The two recipes that we have included look like this:

`hopper_from_logs.json`

```json
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "ILI",
    "ILI",
    " I "
  ],
  "key": {
    "L": {
      "tag": "minecraft:logs"
    },
    "I": {
      "item": "minecraft:iron_ingot"
    }
  },
  "result": {
    "item": "minecraft:hopper"
  }
}
```

`sticks_from_logs.json`

```json
{
  "type": "minecraft:crafting_shaped",
  "group": "sticks",
  "pattern": [
    "L",
    "L"
  ],
  "key": {
    "L": {
      "tag": "minecraft:logs"
    }
  },
  "result": {
    "item": "minecraft:stick",
    "count": 16
  }
}
```

We can migrate this datapack like so:

```
$ cd my-datapack/data/asha
$ simple-recipe migrate recipes _recipes
```

Here we've provided the input directory containing the JSON files, `recipes`, and an output directory which will contain the migrated, Simple Recipe files, `_recipes`. We will get the following console output:

```
  ✓ hopper_from_logs.json
  ✓ sticks_from_logs.json
```

Which tells us that migrating the two recipes was successful. Looking at the folder structure:

```
my-datapack/
├── data/
│   └── asha/
│       ├── recipes/
│       │   ├── hopper_from_logs.json
│       │   └── sticks_from_logs.json
│       └── _recipes/
│           └── index.yml
└── pack.mcmeta
```

We see that a new `_recipes` directory was created, which contains an `index.yml` file with the following content:

`index.yml`

```yaml
- _name: hopper_from_logs
  type: crafting_shaped
  pattern:
    - ILI
    - ILI
    - ' I '
  key:
    L: +logs
    I: iron_ingot
  result: 1 hopper
- _name: sticks_from_logs
  group: sticks
  type: crafting_shaped
  pattern:
    - L
    - L
  key:
    L: +logs
  result: 16 stick
```

# Command line options

Run the following for help about the program:

```
simple-recipe --help
```

Run the following for help about a specific command:

```
simple-recipe <command> --help
```

Where `<command>` is one of the following:

- `compile`
- `watch`
- `migrate`

# The Ultimate Cookbook

In this guide, we've covered writing very basic recipes, compiling and watching them, using error messages to debug malformed recipes, resolving name conflicts and migrating existing datapacks to Simple Recipe. You might still feel a little confused about how you're actually supposed to write more advanced recipes in this new format properly.

Probably the fastest way to get comfortable with Simple Recipe is by looking through [the cookbook](cookbook.yml), which contains every single recipe present in the latest version of Minecraft (at the time of writing this, that's 1.16).

> **Note:** The cookbook was generated using the `simple-recipe migrate` command and then adjusted slightly, to make the contents more readable. This means that if you were to compile it using `simple-recipe compile`, you'd generate all of the original JSON recipes you'd find in the latest Minecraft's vanilla datapack!