(function replacePrecompsScript() {
    var scriptName = "Find and Replace Precomps";

    // Custom trim function to remove leading and trailing whitespace
    function trimString(str) {
        return str.replace(/^\s+|\s+$/g, "");
    }

    // Find precomp by name in the project panel
    function findPrecompByName(projectItems, precompName) {
        for (var i = 1; i <= projectItems.length; i++) {
            var item = projectItems[i];
            if (item instanceof CompItem && item.name === precompName) {
                return item;
            }
        }
        return null;
    }

    // Replace precomps in the specified composition
    function replacePrecompsInComp(comp, fromPrecomp, toPrecomp) {
        var replaceCount = 0;

        if (comp.numLayers === 0) {
            return replaceCount;
        }

        for (var i = 1; i <= comp.layers.length; i++) {
            var layer = comp.layers[i];

            // Check if layer has a valid source and matches the fromPrecomp
            if (layer.source && layer.source instanceof CompItem && layer.source.name === fromPrecomp.name) {
                layer.replaceSource(toPrecomp, false); // Replace with the new precomp
                replaceCount++;
            }
        }

        return replaceCount;
    }

    // Create the UI
    function createUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, { resizeable: true });

        // From Precomp
        panel.add("statictext", undefined, "From Precomp Name:");
        var fromTextBox = panel.add("edittext", undefined, "");
        fromTextBox.size = [400, 30]; // Single-line box size

        // To Precomp
        panel.add("statictext", undefined, "To Precomp Name:");
        var toTextBox = panel.add("edittext", undefined, "");
        toTextBox.size = [400, 30]; // Single-line box size

        // Apply Button
        var applyButton = panel.add("button", undefined, "Apply to Selected Comps");

        applyButton.onClick = function () {
            try {
                app.beginUndoGroup("Find and Replace Precomps");

                var fromPrecompName = trimString(fromTextBox.text);
                var toPrecompName = trimString(toTextBox.text);

                if (!fromPrecompName || !toPrecompName) {
                    alert("Both 'From' and 'To' precomp names must be filled out.");
                    return;
                }

                var projectItems = app.project.items;
                var fromPrecomp = findPrecompByName(projectItems, fromPrecompName);
                var toPrecomp = findPrecompByName(projectItems, toPrecompName);

                if (!fromPrecomp || !toPrecomp) {
                    alert("Failed to find one or both precomps in the project panel.");
                    return;
                }

                var selectedItems = app.project.selection;

                if (!selectedItems || !selectedItems.length) {
                    alert("No compositions selected.");
                    return;
                }

                var replaceCount = 0;

                for (var i = 0; i < selectedItems.length; i++) {
                    if (selectedItems[i] instanceof CompItem) {
                        var comp = selectedItems[i];
                        replaceCount += replacePrecompsInComp(comp, fromPrecomp, toPrecomp);
                    }
                }

                app.endUndoGroup();

                if (replaceCount > 0) {
                    alert("Successfully replaced " + replaceCount + " precomp instances.");
                } else {
                    alert("No matching precomp instances were found.");
                }
            } catch (error) {
                alert("An error occurred: " + error.message);
            }
        };

        panel.layout.layout(true);
        return panel;
    }

    // Run the script
    var uiPanel = createUI(this);
    if (uiPanel instanceof Window) {
        uiPanel.center();
        uiPanel.show();
    }
})();
