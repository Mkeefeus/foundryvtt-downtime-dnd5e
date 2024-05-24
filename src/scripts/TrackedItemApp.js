import TrackedItem from "./TrackedItem.js";
import TrackingAndTraining from "./TrackingAndTraining.js";
import CONSTANTS from "./constants.js";
import Logger from "./lib/Logger.js";

export default class TrackedItemApp extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
        // game.users.apps.push(this);
        // this.item = data.item;
        this.activity = object.item;
        this.actor = object.actor;
        this.editing = object.editMode;
        this.image = object.item.img || object.activity.chat_icon || "";
        this.world = object.world;
        this.sheet = object.sheet || object.actor.sheet;

        this.alreadyCompleted = object.alreadyCompleted;
        this.categories = object.categories;
        this.dropdownOptions = object.dropdownOptions;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "downtime-dnd5e-downtime-item-app",
            template: `modules/${CONSTANTS.MODULE_ID}/templates/tracked-item-app.hbs`,
            title: game.i18n.localize("downtime-dnd5e.CreateEditItemAppTitle"),
            width: 400,
            resizable: true,
            closeOnSubmit: true,
            submitOnClose: false,
        });
    }

    async getData(options = {}) {
        let originalData = super.getData();

        if (!originalData.object.item) {
            originalData.object.item = new TrackedItem();
        }

        return {
            item: originalData.object.item,
            categories: originalData.object.categories,
            dropdownOptions: originalData.object.dropdownOptions,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        //TODO: See if there's a way to do this better. We're updating the object here so
        // the updates stick around after re-renders for the handful of things that force
        // them. I'm also pretty sure error handling here is dumb. 17 MAY 2021

        html.on("change", "#imgInput", (ev) => {
            this.object.item.img = $(ev.currentTarget).val();
        });

        html.on("click", "#imgPicker", (ev) => {
            new FilePicker({
                type: "image",
                callback: (filePath) => {
                    this.object.item.img = filePath;
                    this.render();
                },
            }).browse("");
        });

        html.on("change", "#nameInput", (ev) => {
            let newThing = $(ev.currentTarget).val();
            if (!newThing) {
                Logger.warn(game.i18n.localize("downtime-dnd5e.InputErrorName"), true);
                this.render();
            } else {
                this.object.item.name = newThing;
            }
        });

        html.on("change", "#categoryInput", (ev) => {
            this.object.item.category = $(ev.currentTarget).val();
        });

        html.on("change", "#descriptionInput", (ev) => {
            this.object.item.description = $(ev.currentTarget).val();
        });

        html.on("change", "#progressInput", (ev) => {
            let newThing = parseInt($(ev.currentTarget).val());
            if (newThing == null || isNaN(newThing) || newThing < 0 || newThing > this.object.item.completionAt) {
                Logger.warn(game.i18n.localize("downtime-dnd5e.InputErrorProgress"), true);
                this.render();
            } else {
                this.object.item.progress = newThing;
            }
        });

        html.on("change", "#progressionStyleInput", (ev) => {
            this.object.item.progressionStyle = $(ev.currentTarget).val();
            this.render();
        });

        html.on("change", "#abilityInput", (ev) => {
            this.object.item.ability = $(ev.currentTarget).val();
        });

        html.on("change", "#skillInput", (ev) => {
            this.object.item.skill = $(ev.currentTarget).val();
        });

        html.on("change", "#toolInput", (ev) => {
            this.object.item.tool = $(ev.currentTarget).val();
        });

        html.on("change", "#macroNameInput", (ev) => {
            let newThing = $(ev.currentTarget).val();
            if (!newThing) {
                Logger.warn(game.i18n.localize("downtime-dnd5e.InputErrorMacroName"), true);
                this.render();
            } else {
                this.object.item.macroName = newThing;
            }
        });

        html.on("change", "#fixedIncreaseInput", (ev) => {
            let newThing = parseInt($(ev.currentTarget).val());
            if (!newThing || isNaN(newThing) || newThing <= 0) {
                Logger.warn(game.i18n.localize("downtime-dnd5e.InputErrorFixedIncrease"), true);
                this.render();
            } else {
                this.object.item.fixedIncrease = newThing;
            }
        });

        html.on("change", "#dcInput", (ev) => {
            let newThing = parseInt($(ev.currentTarget).val());
            if (!newThing) {
                newThing = null;
            }
            this.object.item.dc = newThing;
            this.render();
        });

        html.on("change", "#completionAtInput", (ev) => {
            let newThing = parseInt($(ev.currentTarget).val());
            if (!newThing || isNaN(newThing) || newThing <= 0) {
                Logger.warn(game.i18n.localize("downtime-dnd5e.InputErrorCompletionAt"), true);
                this.render();
            } else {
                this.object.item.completionAt = newThing;
                this.render();
            }
        });
    }

    // Called on submission, handle doing stuff.
    async _updateObject(event, formData) {
        let objItem = this.object.item;
        let actor = this.actor;
        // let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        let world = this.world;
        let newItem = objItem;

        // Set placeholders for name and image, just in case something's gone really wrong here
        newItem.name = formData.name || game.i18n.localize("downtime-dnd5e.NewItem");
        newItem.img = formData.img || "icons/svg/book.svg";
        newItem.progressionStyle = formData.progressionStyle || "ABILITY";

        // Get the rest of the stuff
        newItem.category = formData.category;
        newItem.description = formData.description;
        newItem.progress = formData.progress;
        newItem.completionAt = formData.completionAt;
        newItem.hidden = formData.hidden;

        // Unset the type specific stuff: tool, ability, skill, macro, fixedInput
        // Then put stuff back in where required
        if (newItem.progressionStyle === "ABILITY") {
            newItem.ability = formData.ability || "int";
            newItem.skill = null;
            newItem.tool = null;
            newItem.macroName = null;
            newItem.fixedIncrease = null;
        } else if (newItem.progressionStyle === "SKILL") {
            newItem.ability = null;
            newItem.skill = formData.skill || "acr";
            newItem.tool = null;
            newItem.macroName = null;
            newItem.fixedIncrease = null;
        } else if (newItem.progressionStyle === "TOOL") {
            newItem.ability = null;
            newItem.skill = null;
            newItem.tool = formData.tool || "";
            newItem.macroName = null;
            newItem.fixedIncrease = null;
        } else if (newItem.progressionStyle === "MACRO") {
            newItem.ability = null;
            newItem.skill = null;
            newItem.tool = null;
            newItem.macroName = formData.macroName || "Unnamed Macro";
            newItem.fixedIncrease = null;
            newItem.dc = null;
        } else if (newItem.progressionStyle === "FIXED") {
            newItem.ability = null;
            newItem.skill = null;
            newItem.tool = null;
            newItem.macroName = null;
            newItem.fixedIncrease = formData.fixedIncrease || 1;
            newItem.dc = null;
        } else {
            // SOMETHING IS WRONG
        }

        // local scope
        if (!this.world) {
            let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
            /*
        if (this.editing) {
            let act = allItems.find((act) => act.id == this.activity.id);
            let idx = allItems.indexOf(act);
            allItems[idx] = this.activity;
        } else {
            allItems.push(this.activity);
        }
        await actor.unsetFlag(CONSTANTS.MODULE_ID, "trainingItems");
        await actor.setFlag(CONSTANTS.MODULE_ID, "trainingItems", allItems);
        */

            // See if item already exists
            let itemIdx = allItems.findIndex((obj) => obj.id === newItem.id);

            // Update / Replace as necessary
            if (itemIdx > -1) {
                allItems[itemIdx] = newItem;
            } else {
                allItems.push(newItem);
            }

            // Update actor and flags
            await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
        }
        // World scope
        else {
            let allItemsWorld = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
            /*
        this.activity["world"] = true;
        const settings = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities);
        if (this.editing) {
            let act = settings.find((act) => act.id == this.activity.id);
            let idx = settings.indexOf(act);
            settings[idx] = this.activity;
        } else {
            settings.push(this.activity);
        }
        await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, settings);
        // rerender the character sheet to reflect updated activities
        this.sheet.render(true);
        */

            // See if item already exists
            let itemIdx = allItemsWorld.findIndex((obj) => obj.id === newItem.id);

            // Update / Replace as necessary
            if (itemIdx > -1) {
                allItemsWorld[itemIdx] = newItem;
            } else {
                allItemsWorld.push(newItem);
            }

            // Update actor and flags
            (await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItemsWorld)) || [];
        }

        // rerender the character sheet to reflect updated activities
        this.sheet.render(true);

        // Announce completion if complete
        let alreadyCompleted = this.object.alreadyCompleted;
        TrackingAndTraining.checkCompletion(actor, newItem, alreadyCompleted);
    }
}
