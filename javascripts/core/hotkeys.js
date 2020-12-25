"use strict";

// Add your hotkeys and combinations here
// GameKeyboard.bind for single press combinations
// GameKeyboard.bindRepeatable for repeatable combinations
// Hotkeys obey player.options.hotkeys option
// GameKeyboard.bindHotkey for single press hotkeys
// GameKeyboard.bindRepeatableHotkey for repeatable hotkeys
// GameKeyboard class uses Mousetrap under the hood, so for more details visit
// https://craig.is/killing/mice

// Free keys:
// i, j, k, l, n, o, p, q, v, w, x, z

GameKeyboard.bindRepeatableHotkey("m", () => maxAll());
GameKeyboard.bindRepeatableHotkey("d", () => requestDimensionBoost(true));
GameKeyboard.bindRepeatableHotkey("shift+d", () => requestDimensionBoost(false));
GameKeyboard.bindRepeatableHotkey("g", () => requestGalaxyReset(true));
GameKeyboard.bindRepeatableHotkey("shift+g", () => requestGalaxyReset(false));
GameKeyboard.bindRepeatableHotkey("s", () => sacrificeBtnClick());
GameKeyboard.bindRepeatableHotkey("r", () => replicantiGalaxy());
GameKeyboard.bindRepeatableHotkey("t", () => buyMaxTickSpeed());
GameKeyboard.bindRepeatableHotkey("shift+t", () => buyTickSpeed());
GameKeyboard.bindRepeatableHotkey("c", () => bigCrunchResetRequest());
GameKeyboard.bindRepeatableHotkey("e", () => eternityResetRequest());
GameKeyboard.bindRepeatableHotkey("y", () => requestManualReality());

// We need to know whether the player is holding R or not for the
// replicanti galaxy
GameKeyboard.bind("r", () => setHoldingR(true), "keydown");
GameKeyboard.bind("r", () => setHoldingR(false), "keyup");


const AUTOBUYER_NAMES = ["1st Dimension", "2nd Dimension", "3rd Dimension", "4th Dimension",
                         "5th Dimension", "6th Dimension", "7th Dimension", "8th Dimension",
                         "Tickspeed", "Dimension Boost", "Antimatter Galaxy", "Big Crunch", "Dimensional Sacrifice",
                         "Eternity", "Reality"];

// Toggle autobuyers
function toggleAutobuyer(id) {
  const buyer = Autobuyers.all[id];
  if (buyer.isUnlocked) {
    buyer.toggle();
    GameUI.notify.info(`${AUTOBUYER_NAMES[id]} Autobuyer toggled ${(buyer.isActive) ? "on" : "off"}`);
  }
  return false;
}

function toggleBuySingles(id) {
  const buyer = Autobuyers.all[id];
  if (buyer.isUnlocked && buyer.toggleMode !== null) {
    buyer.toggleMode();
    const bulkname = (id === 8 || buyer.hasUnlimitedBulk) ? "max" : "10";
    GameUI.notify.info(`${AUTOBUYER_NAMES[id]} Autobuyer set to buy ${(buyer.mode === 1) ? "singles" : bulkname}`);
  }
  return false;
}

GameKeyboard.bindHotkey("alt+t", () => toggleAutobuyer(8));
GameKeyboard.bindHotkey("shift+alt+t", () => toggleBuySingles(8));
GameKeyboard.bindHotkey("alt+d", () => toggleAutobuyer(9));
GameKeyboard.bindHotkey("alt+g", () => toggleAutobuyer(10));
GameKeyboard.bindHotkey("alt+c", () => toggleAutobuyer(11));
GameKeyboard.bindHotkey("alt+s", () => toggleAutobuyer(12));
GameKeyboard.bindHotkey("alt+e", () => toggleAutobuyer(13));
GameKeyboard.bindHotkey("alt+y", () => toggleAutobuyer(14));
GameKeyboard.bindHotkey("alt+r", () => {
  const buyer = Replicanti.galaxies.autobuyer;
  if (buyer.isUnlocked) {
    buyer.toggle();
    GameUI.notify.info(`Replicanti Galaxy autobuyer ${(buyer.isOn) ? "enabled" : "disabled"}`);
  }
  return false;
});

(function() {
  function bindDimensionHotkeys(tier) {
    GameKeyboard.bindRepeatableHotkey(`${tier}`, () => buyManyDimension(tier));
    GameKeyboard.bindRepeatableHotkey(`shift+${tier}`, () => buyOneDimension(tier));
    GameKeyboard.bindHotkey(`alt+${tier}`, () => toggleAutobuyer(tier - 1));
    GameKeyboard.bindHotkey(`shift+alt+${tier}`, () => toggleBuySingles(tier - 1));
  }
  for (let i = 1; i < 9; i++) bindDimensionHotkeys(i);
}());

// Requires Shift or Ctrl down to allow Konami Code
GameKeyboard.bindHotkey(["shift+up", "ctrl+up"], () => keyboardTabChange("up"));
GameKeyboard.bindHotkey(["shift+down", "ctrl+down"], () => keyboardTabChange("down"));
GameKeyboard.bindHotkey(["shift+left", "ctrl+left"], () => keyboardTabChange("left"));
GameKeyboard.bindHotkey(["shift+right", "ctrl+right"], () => keyboardTabChange("right"));

function keyboardTabChange(direction) {
  // Make an array of all the unlocked tabs
  const tabs = Tabs.all.filter(i => i.isAvailable && i.config.key !== "shop").map(i => i.config.key);
  const subtabs = Tabs.current.subtabs.filter(i => i.isAvailable).map(i => i.key);
  // Reconfigure the tab order if its New UI
  if (ui.view.newUI) {
    tabs.splice(1, 3);
    tabs.push("achievements", "statistics", "options");
  }
  if (Tab.shop.isAvailable) tabs.push("shop");
  // Find the index of the tab and subtab we are on
  let top = tabs.indexOf(Tabs.current.config.key);
  let sub = subtabs.indexOf(Tabs.current._currentSubtab.key);
  // Move in that direction, looping if needed
  if (direction === "up") {
    top -= 1;
    if (top < 0) top = tabs.length - 1;
  } else if (direction === "down") {
    top += 1;
    if (top > tabs.length - 1) top = 0;
  } else if (direction === "left") {
    sub -= 1;
    if (sub < 0) sub = subtabs.length - 1;
  } else if (direction === "right") {
    sub += 1;
    if (sub > subtabs.length - 1) sub = 0;
  }
  if (direction === "up" || direction === "down") {
    Tab[tabs[top]].show(true);
  } else {
    Tab[tabs[top]][subtabs[sub]].show(true);
  }
}

GameKeyboard.bindHotkey("a", () => {
  Autobuyers.toggle();
  GameUI.notify.info(`Autobuyers ${(player.auto.autobuyersOn) ? "enabled" : "disabled"}`);
});
GameKeyboard.bindHotkey("b", () => BlackHoles.togglePause());
GameKeyboard.bindHotkey("u", () => {
  // Automator must be unlocked
  if (player.realities >= 5) {
    if (AutomatorBackend.isRunning) {
      AutomatorBackend.pause();
    } else if (AutomatorBackend.isOn) {
      AutomatorBackend.mode = AUTOMATOR_MODE.RUN;
    } else {
      GameUI.notify.info(`Starting script "${AutomatorBackend.scriptName}"`);
      AutomatorBackend.restart();
      AutomatorBackend.start();
      return;
    }
    const action = AutomatorBackend.isRunning ? "Resuming" : "Pausing";
    const linenum = AutomatorBackend.currentLineNumber;
    GameUI.notify.info(`${action} script "${AutomatorBackend.scriptName}" at line ${linenum}`);

  }
});
GameKeyboard.bindHotkey("shift+u", () => {
  if (player.realities >= 5) {
    const action = AutomatorBackend.isOn ? "Restarting" : "Starting";
    GameUI.notify.info(`${action} script "${AutomatorBackend.scriptName}"`);

    AutomatorBackend.restart();
    AutomatorBackend.start();
  }
});

GameKeyboard.bindHotkey("esc", () => {
  if (ui.view.modal.queue.length === 0) {
    Tab.options.show(true);
  } else {
    Modal.hide();
  }
});

GameKeyboard.bindHotkey("?", () => {
  if (Modal.shortcuts.isOpen) {
    Modal.hide();
    return;
  }
  if (Modal.isOpen) return;
  Modal.shortcuts.show();
});

GameKeyboard.bindHotkey("h", () => {
  if (Modal.h2p.isOpen) {
    Modal.hide();
    return;
  }
  if (Modal.isOpen) return;
  Modal.h2p.show();
  ui.view.h2pActive = true;
});

GameKeyboard.bindHotkey(["ctrl+s", "meta+s"], () => {
  GameStorage.save(false, true);
  return false;
});
GameKeyboard.bindHotkey(["ctrl+e", "meta+e"], () => {
  GameStorage.export();
  return false;
});

GameKeyboard.bind("shift", () => setShiftKey(true), "keydown");
GameKeyboard.bind("shift", () => setShiftKey(false), "keyup");

GameKeyboard.bind("9", () => SecretAchievement(41).unlock());

GameKeyboard.bind(
  ["ctrl+shift+c", "ctrl+shift+i", "ctrl+shift+j", "f12"],
  () => SecretAchievement(23).unlock()
);

GameKeyboard.bind("up up down down left right left right b a", () => {
  SecretAchievement(17).unlock();
  Currency.antimatter.bumpTo(30);
});

GameKeyboard.bindRepeatable("f", () => {
  GameUI.notify.info("Paying respects");
  SecretAchievement(13).unlock();
});
