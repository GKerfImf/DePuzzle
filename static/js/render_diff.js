/**
 * Generates a fake Git diff between two strings.
 * 
 * Looks a bit cryptic, but, essentially, this function fakes an input to [diff2html] as follows:
 *   diff --git a/answer b/answer
 *   index 0000001..fffffff
 *   --- a/answer
 *   +++ b/answer
 *   @@ -1 +1 @@
 *   - ${s1}
 *   + ${s2}
 * 
 * @param {string} s1 - The original string.
 * @param {string} s2 - The revised string.
 * @returns {string} A string representing a fake git-like diff between strings s1 and s2.
 */
function fakeDiff(s1, s2) { 
    return `diff --git a/answer b/answer\nindex 0000001..fffffff\n--- a/answer\n+++ b/answer\n@@ -1 +1 @@\n- ${s1}\n+ ${s2}`;
}

/**
 * Renders a visual representation of a diff between two strings in a specified HTML element.
 * @param {string} elementId - The ID of the HTML element to render the diff in.
 * @param {string} s1 - The original string.
 * @param {string} s2 - The revised string.
 */
function renderDiff(elementId, s1, s2) { 
    var diffString = fakeDiff(s1,s2)

    var targetElement = document.getElementById(elementId);
    var configuration = {
        drawFileList: false,
        fileListToggle: false,
        fileListStartVisible: false,
        fileContentToggle: false,
        matching: 'lines',
        outputFormat: 'line-by-line',
        synchronisedScroll: true,
        highlight: false,
        renderNothingWhenEmpty: false
    };
    var diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);
    diff2htmlUi.draw();
    diff2htmlUi.highlightCode();
}