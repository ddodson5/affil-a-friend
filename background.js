"use strict";

(function () {
    "use strict";

    var affiliateTagSuccessful = false;
    var mostRecentIdUsed = undefined;

    appAPI.ready(function () {

        // hold the toggle state of the button
        var buttonActive = true;

        // Sets the initial browser icon
        appAPI.browserAction.setResourceIcon("images/icon.png");
        // Sets the tooltip for the button
        appAPI.browserAction.setTitle("Affil-a-friend");
        // Sets the text and background color for the button
        // appAPI.browserAction.setBadgeText("Icon");
        appAPI.browserAction.setBadgeBackgroundColor([0, 0, 0, 0]);
        // Sets the initial onClick event handler for the button
        appAPI.browserAction.onClick(function () {
            if (buttonActive) {
                // Sets the text and background color for the button
                // using the optional background parameter
                //appAPI.browserAction.setBadgeText('Xrdr', [0, 0, 255, 255]);
                // Sets the icon to use for the button.
                appAPI.browserAction.setResourceIcon("images/icon2.png");
                //Alert the active page that the button was pressed
                appAPI.message.toActiveTab({ key: "browserButtonDeactivated" });
            } else {
                // Remove the badge from the button
                //appAPI.browserAction.removeBadge();
                // Reset the icon for the image
                appAPI.browserAction.setResourceIcon("images/icon.png");
                //Alert the active page that the button was pressed
                appAPI.message.toActiveTab({ key: "browserButtonActivated" });
            }
            // Toggle the state
            buttonActive = !buttonActive;
        });
        appAPI.message.toActiveTab({ string: "BACKGROUND LOADED, BAE" });

        /*
         *   This will be where we handle info that needs to persist between page loads, or would get lost in the
         *   extension.es6 stuff.
         * */

        appAPI.message.addListener(function (message) {

            if (message.action === "frameClosed") {
                //buttonActive = false;
                if (buttonActive) {
                    // Sets the text and background color for the button
                    // using the optional background parameter
                    //appAPI.browserAction.setBadgeText('Xrdr', [0, 0, 255, 255]);
                    // Sets the icon to use for the button.
                    appAPI.browserAction.setResourceIcon("images/icon2.png");
                    //Alert the active page that the button was pressed
                    appAPI.message.toActiveTab({ key: "browserButtonDeactivated" });
                } else {
                    // Remove the badge from the button
                    //appAPI.browserAction.removeBadge();
                    // Reset the icon for the image
                    appAPI.browserAction.setResourceIcon("images/icon.png");
                    //Alert the active page that the button was pressed
                    appAPI.message.toActiveTab({ key: "browserButtonActivated" });
                }
                // Toggle the state
                buttonActive = !buttonActive;
                return;
            }
            if (message.action === "setAffiliateTagSuccessful") {
                affiliateTagSuccessful = true;
                mostRecentIdUsed = message.value;
                console.log("setAffiliateTagSuccessful : " + affiliateTagSuccessful + "\n                                id used: " + mostRecentIdUsed + "\n                ");
                return;
            }
            if (message.action === "unsetAffiliateTagSuccessful") {
                affiliateTagSuccessful = false;
                mostRecentIdUsed = undefined;
                return;
            }
            if (message.action === "checkAffiliateTagSuccessful") {
                console.log("Tag success: ", affiliateTagSuccessful);
                if (affiliateTagSuccessful) {
                    console.log("tag success, unsetting tag!");

                    appAPI.message.toActiveTab({ key: "affiliateTagSuccessful", value: mostRecentIdUsed });

                    /*
                     *  We want to unset it now, so that it doesn't falsely tell the user that
                     *  they just used an affiliate tag on every following page load.
                     * */
                    affiliateTagSuccessful = false;
                } else {
                    appAPI.message.toActiveTab({ key: "affiliateTagSuccessful", value: false });
                }
            }

            // appAPI.message.toActiveTab({string: "Did someone try to contact the background?!"});
        });
    });

    //TODO: make a lovely api for messaging, complete with message object validation
})();

//# sourceMappingURL=background.js.map