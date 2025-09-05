# Downtime Dnd5e

![Latest Release Download Count](https://img.shields.io/github/downloads/laquasicinque/foundryvtt-downtime-dnd5e/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fdowntime-dnd5e&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=downtime-dnd5e)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Flaquasicinque%2Ffoundryvtt-downtime-dnd5e%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)
![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Flaquasicinque%2Ffoundryvtt-downtime-dnd5e%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fdowntime-dnd5e%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/downtime-dnd5e/)
![GitHub all releases](https://img.shields.io/github/downloads/laquasicinque/foundryvtt-downtime-dnd5e/total?style=for-the-badge)

A module for keeping track of downtime activities. Currently keeps track of both individual and world downtimes for both PCs and NPCs.

Does your group do a lot of downtime activities? Got a lot of factions? Need a simple quest log or timer? Do you have a hard time keeping track of... well... anything? Then this is the mod for you!

_Downtime 5e_ is a module for the dnd5e system in Foundry VTT that adds a tab to all actor sheets (character and NPC) that lets you add and keep track of just about anything you can keep track of with a number and a progress bar. Finally working on that History proficiency? It's in here. Learning how to use thieves tools? In here. Need to keep track of how much of the town's water supply you've accidentally (I hope) poisoned? Quest progress! Countdown timers! Faction reputation! If you can measure it with a percentage, you can track it with this module.

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/laquasicinque/foundryvtt-downtime-dnd5e/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

## History

This project comes from a line of other downtimes such as [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) and [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking), both of which have not been updated in a while/are no longer maintained.

This project was created as a continuation of the crash project [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) and previously maintained by [p4535992](https://github.com/p4535992/foundryvtt-downtime-dnd5e).

## Differences between [Crash's](https://github.com/crash1115/5e-training), [Ethck's](https://github.com/Ethck/Ethck-s-Downtime-Tracking) and [Downtime Dnd5e](https://github.com/laquasicinque/foundryvtt-downtime-dnd5e)

[Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking) focuses more on the implementation of "skill challenge" type downtime activities like the ones you find in xanathar's guide to everything. it lets you construct activities that are made up of multiple rolls, maybe for different skills/abilities/etc that you have to choose between, creating a sort of branching structure with varying dc's for each one. it gives you different outputs depending on how many successes/failures you get and how the activity is configured

[Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) is more of a general progress tracking tool. it's a little bit more flexible/less specifically scoped and the activities you can create are nowhere near as complex as his, but it's more useful for tracking things that take multiple days/weeks to complete and things that are less "one and done".

[Downtime Dnd5e](https://github.com/laquasicinque/foundryvtt-downtime-dnd5e) This project was created as a continuation of the crash project [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training)  but with the code rewritten to follow "standard" development rules like use the module id as prefix for the css rule, the standard folder structure ecc.

## How To Use

Check out the [wiki](/wiki/Home.md) for instructions, screenshots, sample macros, compatibility info, API documentation, and more!

**Note on the execution of the macro:** executes Macro command, giving speaker, actor, token, character, and event constants. This is recognized as the macro itself. Pass an event as the first argument. Is the same concept used from [Item Macro](https://github.com/Foundry-Workshop/Item-Macro/), but without the item, also the main reference is not the item, but the actor, we used the actor set as character by default or the first owned actor by the user, same concept of [Item Piles](https://github.com/fantasycalendar/FoundryVTT-ItemPiles). The macro is launched under as a asynchronus call so  `await ` command are good.

So when you set up to run a macro with this module these arguments are already "setted":`
- **speaker**: The chat message speaker referenced to the actor.
- **actor**: The actor reference.
- **token**: The token (if present on the current scene), referenced to the actor.
- **character**: The character is the actor reference to the one setted to the specific player (cannot be the same of the actor reference).
- **event**: The javascript event passed from the module to the macro.
- **args**: Additional arguments passed from the module to the macro.
- **activity**: Information regarding the downtime activity being usd

## Api

All informations about the api can be found here [API](./wiki/API.md)

# Build

## Install all packages

```bash
npm install
```

### dev

`dev` will let you develop you own code with hot reloading on the browser

```bash
npm run dev
```

## npm build scripts

### build

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### build-watch

`build-watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build-watch
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### lint and lint:fix

`lint` launch the eslint process based on the configuration [here](./.eslintrc.json)

```bash
npm run-script lint
```

`lint:fix` launch the eslint process with the fix argument

```bash
npm run-script lint:fix
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/laquasicinque/foundryvtt-downtime-dnd5e/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) with [Creative Commons Attribution 4.0 International License.](https://github.com/crash1115/5e-training/blob/master/LICENSE)

- [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking) with [MIT](https://github.com/Ethck/Ethck-s-Downtime-Tracking/blob/master/LICENSE)

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Attributions and Special Thanks

- Thanks to KLO#1490 for Korean translations
- Thanks to MS-PBS for Spanish translations
- Thanks Varriount for some CSS fixes
- Thanks to crash1115 for the module [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training)
- Thanks to Ethck for the module [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking)
- Thanks to [p4535992](https://github.com/p4535992) for maintaining the module [previous](https://github.com/p4535992/foundryvtt-downtime-dnd5e)
