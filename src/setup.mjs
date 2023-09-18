export function setup(ctx) {
  ctx.onModsLoaded((ctx) => {
    // Utilize other mod APIs at character select
  });

  ctx.onCharacterLoaded((ctx) => {
    // Modify or hook into game objects to influence offline calculations
  });

  function msging(msg) {
    console.log("==>  New Automation: " + msg);
  }

  function claimMasteryTokens(msg) {
    msging(msg);
    for (const [k, v] of game.bank.items) {
      if (k.category === "Mastery" && k.type === "Token") {
        let quantity = v.quantity;
        game.bank.claimItemOnClick(k, quantity);
        game.notifications.createSuccessNotification(
          new Date().valueOf(),
          k._name + " Claimed",
          k._media,
          -1 * quantity
        );
      }
    }
  }

  ctx.onInterfaceReady((ctx) => {
    claimMasteryTokens("Claim the mastery tokens after interface ready.");
    ctx
      .patch(Bank, "addItem")
      .replace(function (
        _addItem_,
        item,
        quantity,
        logLost,
        found,
        ignoreSpace = false,
        notify = true,
        itemSource = "Game.Unknown"
      ) {
        // add item first
        let success = _addItem_(
          item,
          quantity,
          logLost,
          found,
          ignoreSpace,
          notify,
          itemSource
        );

        if (success) {
          // get item from the bank
          let bankItem = this.items.get(item);
          let _item = bankItem.item;
          let quantity = bankItem.quantity;
          // check item
          if (_item.category === "Mastery" && _item.type === "Token") {
            // claim the tokens
            msging(
              "Claim the mastery tokens after token is added to the bank."
            );
            game.bank.claimItemOnClick(_item, quantity);
            game.notifications.createSuccessNotification(
              new Date().valueOf(),
              _item._name + " Claimed",
              _item._media,
              -1 * quantity
            );
          }
        }
        return success;
      });

    ctx.patch(Game, "processOffline").after(() => {
      claimMasteryTokens("Claim the mastery tokens after offline processing.");
    });
  });
}
