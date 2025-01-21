(function replaceExpressionsScript() {
    var scriptName = "Find and Replace Expressions";

    // Custom trim function to remove leading and trailing whitespace
    function trimString(str) {
        return str.replace(/^\s+|\s+$/g, "");
    }

    // Create the UI
    function createUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, { resizeable: true });

        // From Expression
        panel.add("statictext", undefined, "From Expression:");
        var fromTextBox = panel.add("edittext", undefined, "", { multiline: true, scrollable: true });
        fromTextBox.size = [400, 100]; // Multi-line box size

        // To Expression
        panel.add("statictext", undefined, "To Expression:");
        var toTextBox = panel.add("edittext", undefined, "", { multiline: true, scrollable: true });
        toTextBox.size = [400, 100]; // Multi-line box size

        // Apply Button
        var applyButton = panel.add("button", undefined, "Apply to Selected Comps");

        applyButton.onClick = function () {
            try {
                app.beginUndoGroup("Find and Replace Expressions");

                var fromExpression = trimString(fromTextBox.text);
                var toExpression = trimString(toTextBox.text);

                if (!fromExpression || !toExpression) {
                    alert("Both 'From' and 'To' expressions must be filled out.");
                    return;
                }

                var selectedItems = app.project.selection;

                if (!selectedItems || selectedItems.length === 0) {
                    alert("No compositions selected.");
                    return;
                }

                var matchCount = 0;

                for (var i = 0; i < selectedItems.length; i++) {
                    if (selectedItems[i] instanceof CompItem) {
                        var comp = selectedItems[i];
                        matchCount += findAndReplaceExpressionsInComp(comp, fromExpression, toExpression);
                    }
                }

                app.endUndoGroup();

                if (matchCount > 0) {
                    alert("Replaced " + matchCount + " matching expressions successfully!");
                } else {
                    alert("No matching expressions were found.");
                }
            } catch (error) {
                alert("An error occurred: " + error.message);
            }
        };

        panel.layout.layout(true);
        return panel;
    }

    // Find and replace expressions in the specified composition
    function findAndReplaceExpressionsInComp(comp, fromExpression, toExpression) {
        var matchCount = 0;

        if (comp.numLayers === 0) {
            return matchCount;
        }

        for (var i = 1; i <= comp.layers.length; i++) {
            var layer = comp.layers[i];
            matchCount += findAndReplaceExpressionsInPropertyGroup(layer, fromExpression, toExpression);
        }

        return matchCount;
    }

    // Find and replace expressions in a property or property group
    function findAndReplaceExpressionsInPropertyGroup(propertyGroup, fromExpression, toExpression) {
        var matchCount = 0;

        for (var i = 1; i <= propertyGroup.numProperties; i++) {
            var property = propertyGroup.property(i);

            if (property.canSetExpression && property.expression) {
                var normalizedExpression = property.expression.replace(/\r?\n|\r/g, "\n").replace(/^\s+|\s+$/g, "");
                var normalizedFromExpression = fromExpression.replace(/\r?\n|\r/g, "\n").replace(/^\s+|\s+$/g, "");

                if (normalizedExpression === normalizedFromExpression) {
                    property.expression = toExpression;
                    matchCount++;
                }
            }

            if (property.numProperties) {
                matchCount += findAndReplaceExpressionsInPropertyGroup(property, fromExpression, toExpression);
            }
        }

        return matchCount;
    }

    // Run the script
    var uiPanel = createUI(this);
    if (uiPanel instanceof Window) {
        uiPanel.center();
        uiPanel.show();
    }
})();
