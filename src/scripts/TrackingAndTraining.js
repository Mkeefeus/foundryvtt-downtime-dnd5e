import CategoryApp from "./CategoryApp.js";
import TrackedItemApp from "./TrackedItemApp.js";
import TrackedItem from "./TrackedItem.js";
import Category from "./Category.js";
import CONSTANTS from "./constants.js";
import { runMacro, runMacroOnExplicitActor } from "./lib/lib.js";
import { RetrieveHelpers } from "./lib/retrieve-helpers.js";
import Logger from "./lib/Logger.js";

export default class TrackingAndTraining {
    static async addCategory(actorId, world = false) {
        Logger.debug("New Category excuted!");

        let actor = game.actors.get(actorId);
        let data = {
            actor: actor,
            category: new Category(),
            world: world,
        };
        new CategoryApp(data).render(true);
    }

    static async editCategory(actorId, categoryId, world = false) {
        Logger.debug("Edit Category excuted!");

        let actor = game.actors.get(actorId);
        let allCategories = [];
        if (world) {
            allCategories = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];
        } else {
            allCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
        }
        let thisCategory = allCategories.filter((obj) => obj.id === categoryId)[0];
        let data = {
            actor: actor,
            category: thisCategory,
            world: world,
        };
        new CategoryApp(data).render(true);
    }

    static async deleteCategory(actorId, categoryId, world = false) {
        Logger.debug("Delete Category excuted!");

        // Set up some variables
        let actor = game.actors.get(actorId);
        let allItems = [];
        if (world) {
            allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        } else {
            allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        }

        let allCategories = [];
        if (world) {
            allCategories = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];
        } else {
            allCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
        }

        let thisCategory = allCategories.filter((obj) => obj.id === categoryId)[0];
        let categoryIdx = allCategories.findIndex((obj) => obj.id === categoryId);
        let del = false;
        let dialogContent = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/delete-category-dialog.hbs`);

        // Create dialog
        new Dialog({
            title: game.i18n.localize("downtime-dnd5e.DeleteCategory"),
            content: dialogContent,
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: game.i18n.localize("downtime-dnd5e.Delete"),
                    callback: () => (del = true),
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: game.i18n.localize("downtime-dnd5e.Cancel"),
                    callback: () => (del = false),
                },
            },
            default: "yes",
            close: async (html) => {
                if (del) {
                    // Delete item
                    allCategories.splice(categoryIdx, 1);
                    // Unset categories from activities
                    for (var i = 0; i < allItems.length; i++) {
                        if (allItems[i].category === categoryId) {
                            allItems[i].category = "";
                        }
                    }
                    // Update actor
                    if (world) {
                        await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories, allCategories);
                        await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
                    } else {
                        await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories, allCategories);
                        await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
                    }
                }
            },
        }).render(true);
    }

    static async addItem(actorId, DROPDOWN_OPTIONS, world = false) {
        Logger.debug("New Item excuted!");
        let actor = game.actors.get(actorId);
        let allCategories = [];
        if (world) {
            allCategories = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];
        } else {
            allCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
        }
        let item = new TrackedItem();
        let data = {
            actor: actor,
            item: item,
            alreadyCompleted: item.progress >= item.completionAt,
            categories: allCategories,
            dropdownOptions: DROPDOWN_OPTIONS,
            world: world,
        };
        new TrackedItemApp(data).render(true);
    }

    static async editFromSheet(actorId, itemId, DROPDOWN_OPTIONS, world = false) {
        Logger.debug("Edit Downtime Activity excuted!");
        let actor = game.actors.get(actorId);
        let allCategories = [];
        if (world) {
            allCategories = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];
        } else {
            allCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
        }
        let allItems = [];
        if (world) {
            allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        } else {
            allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        }
        let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
        if (!thisItem) {
            Logger.warn(game.i18n.localize("downtime-dnd5e.InvalidItemWarning"), true);
            return;
        }
        let data = {
            actor: actor,
            item: thisItem,
            alreadyCompleted: thisItem.progress >= thisItem.completionAt,
            categories: allCategories,
            dropdownOptions: DROPDOWN_OPTIONS,
            editMode: true,
            world: world,
        };
        new TrackedItemApp(data).render(true);
    }

    static async deleteFromSheet(actorId, itemId, world = false) {
        Logger.debug("Delete Downtime Activity excuted!");

        // Set up some variables
        let actor = game.actors.get(actorId);
        let dialogContent = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/delete-training-dialog.hbs`);
        let del = false;

        // Create dialog
        new Dialog({
            title: game.i18n.localize("downtime-dnd5e.DeleteItem"),
            content: dialogContent,
            buttons: {
                yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: game.i18n.localize("downtime-dnd5e.Delete"),
                    callback: () => (del = true),
                },
                no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: game.i18n.localize("downtime-dnd5e.Cancel"),
                    callback: () => (del = false),
                },
            },
            default: "yes",
            close: async (html) => {
                if (del) {
                    let allItems = [];
                    if (world) {
                        allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
                    } else {
                        allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
                    }

                    let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
                    if (!thisItem) {
                        Logger.warn(game.i18n.localize("downtime-dnd5e.InvalidItemWarning"), true);
                        return;
                    }
                    let itemIndex = allItems.findIndex((obj) => obj.id === thisItem.id);
                    allItems.splice(itemIndex, 1);

                    if (world) {
                        await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
                    } else {
                        await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
                    }

                    actor.sheet.render(true);
                }
            },
        }).render(true);
    }

    static async updateItemProgressFromSheet(actorId, itemId, value, world = false) {
        Logger.debug("Progression Override excuted!");

        // Set up some variables
        let actor = game.actors.get(actorId);
        let allItems = [];
        if (world) {
            allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        } else {
            allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        }

        let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
        if (!thisItem) {
            Logger.warn(game.i18n.localize("downtime-dnd5e.InvalidItemWarning"), true);
            return;
        }
        let adjustment = 0;
        let alreadyCompleted = thisItem.progress >= thisItem.completionAt;

        // Format input and change
        if (value.charAt(0) === "+") {
            let changeName = game.i18n.localize("downtime-dnd5e.AdjustProgressValue") + " (+)";
            adjustment = parseInt(value.substr(1).trim());
            thisItem = TrackingAndTraining.calculateNewProgress(thisItem, changeName, adjustment);
        } else if (value.charAt(0) === "-") {
            let changeName = game.i18n.localize("downtime-dnd5e.AdjustProgressValue") + " (-)";
            adjustment = 0 - parseInt(value.substr(1).trim());
            thisItem = TrackingAndTraining.calculateNewProgress(thisItem, changeName, adjustment);
        } else {
            let changeName = game.i18n.localize("downtime-dnd5e.AdjustProgressValue") + " (=)";
            adjustment = parseInt(value);
            thisItem = TrackingAndTraining.calculateNewProgress(thisItem, changeName, adjustment, true);
        }

        // Log completion
        TrackingAndTraining.checkCompletion(actor, thisItem, alreadyCompleted);

        // Update flags and actor
        if (world) {
            await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
        } else {
            await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
        }

        actor.sheet.render(true);
    }

    static async progressItem(actorId, itemId, world = false) {
        Logger.debug("Progress Downtime Activity excuted!");

        // Set up some variables
        let actor = game.actors.get(actorId);
        let allItems = [];
        if (world) {
            allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        } else {
            allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        }

        let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
        if (!thisItem) {
            Logger.warn(game.i18n.localize("downtime-dnd5e.InvalidItemWarning"), true);
            return;
        }
        let rollType = TrackingAndTraining.determineRollType(thisItem);
        let alreadyCompleted = thisItem.progress >= thisItem.completionAt;

        // Progression Type: Ability Check or DC - ABILITY
        if (rollType === "ABILITY") {
            let abilityName = CONFIG.DND5E.abilities[thisItem.ability];
            // Roll to increase progress
            let options = TrackingAndTraining.getRollOptions();
            let r = await actor.rollAbilityTest(thisItem.ability, options);
            if (r) {
                let attemptName = game.i18n.localize("downtime-dnd5e.Roll") + " " + abilityName;
                // Increase progress
                let progressChange = TrackingAndTraining.getRollResult(r);
                thisItem = TrackingAndTraining.calculateNewProgress(thisItem, attemptName, progressChange);
                // Log item completion
                TrackingAndTraining.checkCompletion(actor, thisItem, alreadyCompleted);
                // Update flags and actor
                if (world) {
                    await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
                } else {
                    await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
                }

                actor.sheet.render(true);
            }
        }

        // Progression Type: Ability Check or DC - SKILL
        else if (rollType === "SKILL") {
            let abilityName = CONFIG.DND5E.skills[thisItem.skill].label;
            // Roll to increase progress
            let options = TrackingAndTraining.getRollOptions();
            let r = await actor.rollSkill(thisItem.skill, options);
            if (r) {
                let attemptName = game.i18n.localize("downtime-dnd5e.Roll") + " " + abilityName;
                // Increase progress
                let progressChange = TrackingAndTraining.getRollResult(r);
                thisItem = TrackingAndTraining.calculateNewProgress(thisItem, attemptName, progressChange);
                // Log item completion
                TrackingAndTraining.checkCompletion(actor, thisItem, alreadyCompleted);
                // Update flags and actor
                if (world) {
                    await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
                } else {
                    await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
                }

                actor.sheet.render(true);
            }
        }

        // Progression Type: Ability Check or DC - TOOL
        else if (rollType === "TOOL") {
            let toolId = thisItem.tool;
            let tool = actor.items.get(toolId);
            if (tool) {
                let toolName = tool.name;
                // Roll to increase progress
                let options = TrackingAndTraining.getRollOptions();
                let r = await tool.rollToolCheck(options);
                if (r) {
                    let attemptName = game.i18n.localize("downtime-dnd5e.Roll") + " " + toolName;
                    // Increase progress
                    let progressChange = TrackingAndTraining.getToolRollResult(r);
                    thisItem = TrackingAndTraining.calculateNewProgress(thisItem, attemptName, progressChange);
                    // Log item completion
                    TrackingAndTraining.checkCompletion(actor, thisItem, alreadyCompleted);
                    // Update flags and actor
                    if (world) {
                        await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
                    } else {
                        await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
                    }

                    actor.sheet.render(true);
                }
            } else {
                Logger.warn(game.i18n.localize("downtime-dnd5e.ToolNotFoundWarning"));
            }
        }

        // Progression Type: Simple
        else if (rollType === "FIXED") {
            let itemName = game.i18n.localize("downtime-dnd5e.ProgressionStyleFixed");
            // Increase progress
            thisItem = TrackingAndTraining.calculateNewProgress(thisItem, itemName, thisItem.fixedIncrease);
            // Log item completion
            TrackingAndTraining.checkCompletion(actor, thisItem, alreadyCompleted);
            // Update flags and actor
            if (world) {
                await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
            } else {
                await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
            }

            actor.sheet.render(true);
        }

        // Progression Type: Macro
        else if (rollType === "MACRO") {
            let macroName = thisItem.macroName;
            // let macro = game.macros.getName(macroName);
            let macro = await RetrieveHelpers.getMacroAsync(macroName, false, false);
            if (macro) {
                let macroData = [];
                // macro.execute();
                runMacroOnExplicitActor(actor, macro, macroData);
            } else {
                Logger.warn(game.i18n.localize("downtime-dnd5e.MacroNotFoundWarning") + ": " + macroName, true);
            }
        }
    }

    // Figures out what options we need to tack onto any rolls we do for things to work as expected
    static getRollOptions() {
        let options = {};
        if (game.settings.get(CONSTANTS.MODULE_ID, "gmOnlyMode")) {
            options.rollMode = "gmroll";
        } //GM Only Mode
        if (
            !game.modules.get("midi-qol")?.active ||
            isNewerVersion(game.modules.get("midi-qol").version, "0.9.25")
        ) {
            options.vanilla = true;
        } //Handles BR. Want it on in all cases except when midi is enabled
        return options;
    }

    // Gets the result of the roll. Necessary for compatibility with BR, which returns CustomItemRoll objects.
    static getRollResult(roll) {
        let result = roll._total;
        return parseInt(result);
    }

    // Gets the result of the roll. Necessary for compatibility with BR, which returns CustomItemRoll objects.
    // This is slightly different for tools because of how the object gets attached to the roll.
    static getToolRollResult(roll) {
        let result;
        if (roll.BetterRoll) {
            result = roll.BetterRoll.entries.filter((entry) => entry.type == "multiroll")[0].entries[0].total;
        } else {
            result = roll._total;
        }
        return parseInt(result);
    }

    // Calculates the progress value of an item and logs the change to the progress
    // if absolute is true, set progress to the change value rather than adding to it
    // RETURNS THE ENTIRE ITEM
    static calculateNewProgress(item, actionName, change, absolute = false) {
        let newProgress = 0;

        if (absolute) {
            newProgress = change;
        } else {
            if (item.dc) {
                //if there's a dc set
                if (change >= item.dc) {
                    //if the check beat the dc
                    newProgress = item.progress + 1; //increase the progress
                } else {
                    //check didnt beat dc
                    newProgress = item.progress; //add nothing
                }
            } else {
                //if no dc set
                newProgress = item.progress + change;
            }
        }

        if (newProgress > item.completionAt) {
            newProgress = item.completionAt;
        } else if (newProgress < 0) {
            newProgress = 0;
        }

        // Log item change
        // Make sure flags exist and add them if they don't
        if (!item.changes) {
            item.changes = [];
        }
        // Create and add new change to log
        let logEntry = {
            id: randomID(),
            timestamp: new Date(),
            actionName: actionName,
            valueChanged: "progress",
            oldValue: item.progress,
            newValue: newProgress,
            user: game.user.name,
            note: "",
        };
        item.changes.push(logEntry);

        item.progress = newProgress;
        return item;
    }

    // Checks for completion of an item and alerts if it's done
    static async checkCompletion(actor, activity, alreadyCompleted) {
        if (alreadyCompleted) {
            return;
        }
        if (activity.progress >= activity.completionAt) {
            let alertFor = game.settings.get(CONSTANTS.MODULE_ID, "announceCompletionFor");
            let isPc = actor.hasPlayerOwner;
            let sendIt;

            switch (alertFor) {
                case "none":
                    sendIt = false;
                    break;
                case "both":
                    sendIt = true;
                    break;
                case "npc":
                    sendIt = !isPc;
                    break;
                case "pc":
                    sendIt = isPc;
                    break;
                default:
                    sendIt = false;
            }

            if (sendIt) {
                Logger.debug("" + actor.name + " " + game.i18n.localize("downtime-dnd5e.CompletedATrackedItem"));
                let chatHtml = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/completion-message.hbs`, {
                    actor: actor,
                    activity: activity,
                });
                let chatObj = { content: chatHtml };
                if (game.settings.get(CONSTANTS.MODULE_ID, "gmOnlyMode")) {
                    chatObj.whisper = ChatMessage.getWhisperRecipients("GM");
                }
                ChatMessage.create(chatObj);
            }
        }
    }

    // Determines what kind of item is being rolled, be it a skill check, an ability check, or a tool check
    // OLD METHOD, STILL USED BY MIGRATION #1
    static determineRollType(item) {
        let rollType;
        let abilities = ["str", "dex", "con", "int", "wis", "cha"];
        let skills = [
            "acr",
            "ani",
            "arc",
            "ath",
            "dec",
            "his",
            "ins",
            "inv",
            "itm",
            "med",
            "nat",
            "per",
            "prc",
            "prf",
            "rel",
            "slt",
            "ste",
            "sur",
        ];

        // checks for post-migration 1 types and returns
        if (["ABILITY", "SKILL", "TOOL", "MACRO", "FIXED"].includes(item.progressionStyle)) {
            return item.progressionStyle;
        }

        if (item.ability) {
            if (abilities.includes(item.ability)) {
                rollType = "ability";
            } else if (skills.includes(item.ability)) {
                rollType = "skill";
            } else if (item.ability.substr(0, 5) === "tool-") {
                rollType = "tool";
            }
        } else if (item.macroName) {
            rollType = "macro";
        } else {
            rollType = "simple";
        }

        return rollType;
    }

    // Gets and formats an array of tools the actor has in their inventory. Used for selection menus
    static getActorTools(actorId) {
        let actor = game.actors.get(actorId);
        let items = actor.items;
        let tools = items.filter((item) => item.type === "tool");
        let formatted = tools.map((obj) => {
            let newObj = {};
            newObj.value = obj._id;
            newObj.label = obj.name;
            return newObj;
        });
        return formatted;
    }

    static formatAbilitiesForDropdown() {
        return [
            { value: "str", type: "ability", label: game.i18n.localize("downtime-dnd5e.AbilityStr") },
            { value: "dex", type: "ability", label: game.i18n.localize("downtime-dnd5e.AbilityDex") },
            { value: "con", type: "ability", label: game.i18n.localize("downtime-dnd5e.AbilityCon") },
            { value: "int", type: "ability", label: game.i18n.localize("downtime-dnd5e.AbilityInt") },
            { value: "wis", type: "ability", label: game.i18n.localize("downtime-dnd5e.AbilityWis") },
            { value: "cha", type: "ability", label: game.i18n.localize("downtime-dnd5e.AbilityCha") },
        ];
    }

    static formatSkillsForDropdown() {
        return [
            { value: "acr", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillAcr") },
            { value: "ani", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillAni") },
            { value: "arc", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillArc") },
            { value: "ath", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillAth") },
            { value: "dec", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillDec") },
            { value: "his", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillHis") },
            { value: "ins", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillIns") },
            { value: "inv", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillInv") },
            { value: "itm", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillItm") },
            { value: "med", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillMed") },
            { value: "nat", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillNat") },
            { value: "per", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillPer") },
            { value: "prc", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillPrc") },
            { value: "prf", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillPrf") },
            { value: "rel", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillRel") },
            { value: "slt", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillSlt") },
            { value: "ste", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillSte") },
            { value: "sur", type: "skill", label: game.i18n.localize("downtime-dnd5e.SkillSur") },
        ];
    }

    static exportItems(actorId) {
        let actor = game.actors.get(actorId);
        let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        let allCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
        let dataToExport = {
            items: allItems,
            categories: allCategories,
        };
        if (allItems.length < 1 && allCategories.length < 1) {
            Logger.info(game.i18n.localize("downtime-dnd5e.ExportNoTrackedItems"), true);
            return;
        }
        let jsonData = JSON.stringify(dataToExport);
        saveDataToFile(jsonData, "application/json", `${actor.id}-tracked-items-backup.json`);
    }

    static async importItems(actorId) {
        let actor = game.actors.get(actorId);
        let input = $('<input type="file">');
        input.on("change", function () {
            const file = this.files[0];
            if (!file) {
                Logger.info(game.i18n.localize("downtime-dnd5e.ImportNoFile"), true);
                return;
            }
            readTextFromFile(file).then(async (contents) => {
                let importedData = JSON.parse(contents);
                let importedItems = [];
                let importedCategories = [];

                // Handles old format of export/import
                if (importedData.items) {
                    importedItems = importedData.items;
                    importedCategories = importedData.categories;
                } else {
                    new Dialog({
                        title: game.i18n.localize("downtime-dnd5e.ImportOldWarningTitle"),
                        content: `<p>${game.i18n.localize("downtime-dnd5e.ImportOldWarningText")}</p>`,
                        buttons: {
                            ok: {
                                icon: "<i class='fas fa-check'></i>",
                                label: game.i18n.localize("downtime-dnd5e.ImportOldWarningConfirm"),
                            },
                        },
                        default: "ok",
                    }).render(true);
                    Logger.debug("Import detected old format.", importedData);
                    importedItems = importedData;
                }

                if (importedItems.length < 1 && importedCategories.legnth < 1) {
                    Logger.info(game.i18n.localize("downtime-dnd5e.ImportNoTrackedItems"), true);
                    return;
                }

                let currentCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
                let currentCategoryIds = currentCategories.map((c) => c.id);
                let currentCategoryNames = currentCategories.map((c) => c.name);
                let categoriesToDelete = [];

                for (var i = 0; i < importedCategories.length; i++) {
                    // De-dupe category ID's
                    if (currentCategoryIds.indexOf(importedCategories[i].id) > -1) {
                        let newId = randomID();
                        let oldId = importedCategories[i].id;
                        for (var j = 0; j < importedItems.length; j++) {
                            if (importedItems[j].category === oldId) {
                                importedItems[j].category = newId;
                            }
                        }
                        importedCategories[i].id = newId;
                    }

                    // If category exists with same name, combine into one category
                    if (currentCategoryNames.indexOf(importedCategories[i].name) > -1) {
                        let newCategory = importedCategories[i];
                        let existingCategory = currentCategories.filter(
                            (obj) => obj.name === importedCategories[i].name,
                        )[0];
                        let existingCategoryId = existingCategory.id;
                        let importedCategoryId = newCategory.id;

                        for (var j = 0; j < importedItems.length; j++) {
                            if (importedItems[j].category === importedCategoryId) {
                                importedItems[j].category = existingCategoryId;
                            }
                        }
                        // Flag these categories for deletion
                        categoriesToDelete.push(importedCategoryId);
                    }
                }

                let currentItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
                let currentIds = currentItems.map((i) => i.id);
                let currentNames = currentItems.map((i) => i.name);

                for (var i = 0; i < importedItems.length; i++) {
                    // De-dupe item ID's
                    if (currentIds.indexOf(importedItems[i].id) > -1) {
                        importedItems[i].id = randomID();
                    }

                    // Unset missing category ID's
                    let importedCategoryIds = importedCategories.map((c) => c.id);
                    let availableCategoryIds = currentCategoryIds.concat(importedCategoryIds);
                    if (
                        availableCategoryIds.length === 0 ||
                        availableCategoryIds.indexOf(importedItems[i].category) === -1
                    ) {
                        importedItems[i].category = "";
                    }
                }

                let combinedItems = currentItems.concat(importedItems);
                let combinedCategories = currentCategories
                    .concat(importedCategories)
                    .filter((c) => !categoriesToDelete.includes(c.id));

                await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories, combinedCategories);
                await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, combinedItems);

                Logger.info(game.i18n.localize("downtime-dnd5e.ImportComplete"), true);

                // let act = "quit";
                //let content = `<p><b>${game.i18n.localize("downtime-dnd5e.ImportTypeSelectionOverwrite")}:</b> ${game.i18n.localize("downtime-dnd5e.ImportTypeSelectionTextOverwrite")}</p>
                //               <p><b>${game.i18n.localize("downtime-dnd5e.ImportTypeSelectionCombine")}:</b> ${game.i18n.localize("downtime-dnd5e.ImportTypeSelectionTextCombine")}</p>`;
                // Create dialog
                // new Dialog({
                //   title: game.i18n.localize("downtime-dnd5e.ImportTypeSelectionTitle"),
                //   content: content,
                //   buttons: {
                //     overwrite: {icon: "<i class='fas fa-file-import'></i>", label: game.i18n.localize("downtime-dnd5e.ImportTypeSelectionOverwrite"), callback: () => act = "overwrite"},
                //     add: {icon: "<i class='fas fa-plus'></i>", label: game.i18n.localize("downtime-dnd5e.ImportTypeSelectionCombine"), callback: () => act = "add"},
                //     quit: {icon: "<i class='fas fa-times'></i>", label: game.i18n.localize("downtime-dnd5e.Cancel"), callback: () => act = "quit"},
                //   },
                //   default: "quit",
                //   close: async (html) => {
                //     if(act === "quit"){
                //       return;
                //     } else if (act === "overwrite") {
                //       let currentCategories = actor.getFlag(CONSTANTS.MODULE_ID,CONSTANTS.FLAGS.categories) || [];
                //       let currentCategoryIds = currentCategories.map(c => c.id);

                //       for(var i = 0; i < importedItems.length; i++){
                //         // Unset missing category ID's
                //         if((currentCategoryIds.length === 0) || (currentCategoryIds.indexOf(importedItems[i].category) === -1)){
                //           importedItems[i].category = "";
                //         }
                //       }
                //       actor.setFlag(CONSTANTS.MODULE_ID,CONSTANTS.FLAGS.trainingItems,importedItems);
                //       Logger.info(game.i18n.localize("downtime-dnd5e.ImportComplete"), true);
                //     } else if (act === "add") {
                //       let currentItems = actor.getFlag(CONSTANTS.MODULE_ID,CONSTANTS.FLAGS.trainingItems) || [];
                //       let currentCategories = actor.getFlag(CONSTANTS.MODULE_ID,CONSTANTS.FLAGS.categories) || [];
                //       let currentIds = currentItems.map(i => i.id);
                //       let currentNames = currentItems.map(i => i.name);
                //       let currentCategoryIds = currentCategories.map(c => c.id);
                //       let possibleDupes = false;

                //       for(var i = 0; i < importedItems.length; i++){
                //         // De-dupe ID's
                //         if(currentIds.indexOf(importedItems[i].id) > -1){
                //           let matchedIdx = currentIds.indexOf(importedItems[i].id);
                //           importedItems[i].id = randomID();
                //           possibleDupes = true;
                //         }

                //         // Check for duplicate names
                //         if(currentNames.indexOf(importedItems[i].name) > -1){
                //           possibleDupes = true;
                //         }

                //         // Unset missing category ID's
                //         if((currentCategoryIds.length === 0) || (currentCategoryIds.indexOf(importedItems[i].category) === -1)){
                //           importedItems[i].category = "";
                //         }
                //       }
                //       let combinedItems = currentItems.concat(importedItems);
                //       await actor.setFlag(CONSTANTS.MODULE_ID,CONSTANTS.FLAGS.trainingItems, combinedItems);
                //       Logger.info(game.i18n.localize("downtime-dnd5e.ImportComplete"), true);
                //       if(possibleDupes){
                //         new Dialog({
                //           title: game.i18n.localize("downtime-dnd5e.ImportDupeWarningTitle"),
                //           content: `<p>${game.i18n.localize("downtime-dnd5e.ImportDupeWarningText")}</p>`,
                //           buttons: {
                //             ok: {icon: "<i class='fas fa-check'></i>", label: game.i18n.localize("downtime-dnd5e.ImportDupeWarningConfirm")},
                //           },
                //           default: "ok"
                //         }).render(true);
                //       }
                //     }
                //   }
                // }).render(true);

                actor.sheet.render(true);
            });
        });
        input.trigger("click");
    }
}
