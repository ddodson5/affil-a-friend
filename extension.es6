(function (appAPI) {
    "use strict";



    /************************************************************************************
     This is your Page Code. The appAPI.ready() code block will be executed on every page load.
     For more information please visit our docs site: http://docs.crossrider.com
     *************************************************************************************/


    appAPI.ready(function ($) {

        console.log("Crossrider running on page with url:\t", document.location.href); //DEBUG

        //Only continue if we're on an Amazon checkout page
        if (!appAPI.isMatchPages("www.amazon.com/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.ca/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.co.uk/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.de/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.es/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.fr/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.it/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.co.jp/gp/buy/spc/handlers/display.html*",
                                 "www.amazon.cn/gp/buy/spc/handlers/display.html*",
                                 "smile.amazon.com/gp/buy/spc/handlers/display.html*")) {
            return;
        }

        console.log("This is an Amazon checkout page!:\r\n" + document.location.href); //DEBUG: Show confirmation

        let $body = $("body");

        //console.log($affilafriendPopup);

        /*
         *   This is where we receive info from the background code
         *   The way Crossrider deals with communicating between the background and extension code doesn't allow for
         *   callbacks, so we've got to engage in an elaborate call-and-response to move information.
         *
         *
         * */
        appAPI.message.addListener(function (message) {

            if (message.key === "affiliateTagSuccessful") {

                if (message.value) {
                    console.log("TAG SUCCESSFUL! Here's the Affiliate ID you just tagged: ", message.value);

                }
                else {
                    console.log("DID NOT JUST TAG ANYTHING...");    //DEBUG
                }
            } else if (message.key === "browserButtonActivated") {

                console.log("VISIBLE");
                //Make room for our frame to appear by applying the 'push' style to the body
                $body.addClass("affilafriend-body-push");
                $affilafriendPopup.removeClass("hidden");

            } else if (message.key === "browserButtonDeactivated") {

                console.log("INVISIBLE");
                $affilafriendPopup.addClass("hidden");
                $body.removeClass("affilafriend-body-push");
                //console.log($affilafriendPopup);

            }
        });

        //Query the background to see if we just came from applying an affiliate tag
        appAPI.message.toBackground({ action: "checkAffiliateTagSuccessful" });

        //Globalize the jquery parameter, and cache the body for use in a few places
        //$ = jQuery;

        //  BEGIN: Inject

        //DEBUG: Turn the background red as an easy visual confirmation that the extension is working
        /* let elem = appAPI.dom.addInlineCSS({
         css: "body {background-color: red !important;}"
         });*/

        //Remove all outside css influences using cleanslate.css
        appAPI.resources.includeCSS("cleanslate.css");

        //Apply our css stylings
        appAPI.resources.includeCSS("inject.css");

        //Now make room for our frame to appear by applying the 'push' style to the body
        $body.addClass("affilafriend-body-push");

        let injectionHTML = appAPI.resources.get("inject.html");

        //console.log(injectionHTML);      //DEBUG

        $body.append(injectionHTML);

        //  END: Inject

        let $affilafriendPopup = $("#affilafriend").find(".popup");

        /*
         *   When the user clicks the close button, hide the frame
         * */
        $affilafriendPopup.find(".close").click(function ()
                                                {

                                                    //Let the background know that the frame was closed
                                                    appAPI.message.toBackground({action: "frameClosed"});
                                                    console.log("HIDE");
                                                    $affilafriendPopup.addClass("hidden");
                                                    $body.removeClass("affilafriend-body-push");
                                                    //console.log($affilafriendPopup);
                                                }
        );

        /*
         * Handle submission of affiliate link box.
         * */
        $affilafriendPopup.find("#linkForm").submit(function (event)
                                                    {
                                                        event.preventDefault();
                                                        let rawUserInput = event.target.affilafriend_link_input.value;
                                                        let decodedUserInput;
                                                        try
                                                        {
                                                            //In case the user-supplied affiliate link uses percent
                                                            // encoding, decode it
                                                             decodedUserInput = decodeURIComponent(rawUserInput);
                                                        }
                                                            //If the user-entered data has a lone '%' (and maybe some
                                                            // other characters?), it will throw an error
                                                        catch (e)
                                                        {
                                                            // console.warn("BAD DATES", e);
                                                            alert("The supplied string is invalid.");
                                                            //TODO: a styled in-page message
                                                        }
                                                        console.log("Decoded URL: ", decodedUserInput);
                                                        /*
                                                         *  Thanks to regexr.com for the assist in crafting this.
                                                         *  Should match any tag parameter of the form &tag=thing-20 or
                                                         *  ?tag=otherthing-401; use capture group 1
                                                         *  (ie,searchResult[1]) to fetch just the ID itself.
                                                         *  Hopefully Amazon is consistent about the format of their
                                                         *  associate ID's,
                                                         *  because I couldn't find anything
                                                         *  official on how they are validated.
                                                         */
                                                        let tagExpression = /(?:[&?]tag=)([-\w]+-\d+)(?=&|$)/;
                                                        //See if the user-supplied text contains an affiliate tag
                                                        let searchResult = tagExpression.exec(decodedUserInput);
                                                        //If nothing is found, complain about it and bail out
                                                        if (!searchResult)
                                                        {
                                                            alert(
                                                                "The supplied string doesn't seem to contain a valid affiliate tag"
                                                            );
                                                            //TODO: a styled in-page message
                                                        }
                                                        //Otherwise, grab the actual ID from the results
                                                        let foundID = searchResult[1];
                                                        console.log(foundID); //DEBUG
                                                        //Grab the current URL
                                                        let currentURL = document.location.href;

                                                        /*
                                                         *   A regex to match the first '?' found, or the end of the string, on the off-chance that there is no
                                                         *   query string already.
                                                         */
                                                        let insertExpression = /[?]|$/;

                                                        //Cobble together the string to insert into the current URL
                                                        let replaceString = "?tag=" + foundID + "&"; //The '&' may end up being superfluous,
                                                        // but doesn't hurt anything

                                                        //Get a new URL, with the specified ID inserted all nice-like
                                                        let taggedURL = currentURL.replace(insertExpression,
                                                                                           replaceString
                                                        );

                                                        console.log("Replacement URL: ", taggedURL);

                                                        appAPI.message.toBackground({
                                                                                        action: "setAffiliateTagSuccessful",
                                                                                        value: foundID
                                                                                    }
                                                        );

                                                        //Now, load the new URL!
                                                        appAPI.openURL({
                                                                           url: taggedURL,
                                                                           where: "current"
                                                                           //where: "tab"
                                                                       }
                                                        );
                                                        let successMessage = "Affiliate ID " + foundID + " applied successfully!"; //DEBUG
                                                    }
        );
    });


}(appAPI));