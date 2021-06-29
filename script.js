const dropArea = document.querySelector(".droparea");

const APIKEY = "kTcMLyWHun68kPn4"; // https://textgears.com
const reader = new FileReader();
let fileContent = "";

/**
 * Receives array of Wrong words and suggestions for those words and renders suggestion and perform the event handling
 * @param {String[]} badWords Array of String: Errors in content
 * @param {String[]} suggestions Array of Strings: Suggestions for the Errors
 */
const renderSuggestions = (badWords, suggestions) => {
    console.log(badWords, suggestions);
    const tips = [];
    badWords.map((word, index) => {
        let html = "";
        if (suggestions[index].length > 0) {
            html = "<ul>";
            suggestions[index].forEach((word) => {
                html += `<li>${word}</li>`;
            });
            html += `<li style="color: #8c0000" class="ignore">ignore</li></ul>`;
            tips.push(html);
        } else {
            html += `<ul><li style="color: #8c0000" class="ignore">no suggestion found</li></ul>`;
            tips.push(html);
        }
    });

    const errorWords = document.querySelectorAll(".mark");
    const allBoxes = [];

    errorWords.forEach((word, i) => {
        const suggestionBox = word.closest("div").querySelector(".tiptext");
        suggestionBox.innerHTML = tips[i];

        allBoxes.push(suggestionBox);

        $(word).click(function (e) {
            e.preventDefault();
            if ($(suggestionBox).hasClass("hidden")) {
                $(".tiptext").addClass("hidden");
                $(suggestionBox).removeClass("hidden");
            } else {
                $(suggestionBox).addClass("hidden");
            }
        });
    });

    allBoxes.map((box, index) => {
        const lists = box.querySelectorAll("li");
        lists.forEach((list, i) => {
            if (i === lists.length - 1) {
                $(list).hover(
                    () =>
                        $(list).css(
                            "text-decoration",
                            "underline #fb9300 solid"
                        ),
                    () => $(list).css("text-decoration", "none")
                );

                $(list).click(function (e) {
                    e.preventDefault();
                    errorWords[index].classList.remove("mark");
                    $(box).addClass("hidden");
                });
            } else {
                $(list).hover(
                    () =>
                        $(list).css(
                            "text-decoration",
                            "underline #68eb63 solid"
                        ),
                    () => $(list).css("text-decoration", "none")
                );
                $(list).click(function (e) {
                    e.preventDefault();
                    errorWords[index].textContent = list.textContent;
                    errorWords[index].classList.remove("mark");
                    $(box).addClass("hidden");
                });
            }
        });
    });
};

/**
 * Receives array of Wrong words and suggestions for those words and renders the file content on Page
 * @param {String[]} badWords Array of String: Errors in content
 * @param {String} renderData File Data
 */
const renderErrors = (badWords, renderData) => {
    let html = "";
    badWords.forEach((word) => {
        html = `
            <span>
                <div>
                    <span class="mark">${word}</span>
                    <span class="tiptext hidden">
                    </span>
                </div>
            </span>
        `;
        const re = new RegExp(`\\b${word}\\b`, "g");
        renderData = renderData.replace(re, html);
    });
    $("main").html(renderData);
};

/**
 * Accepts File contents as String and filters out the unnecessary symbols prepares the string for display
 * @param {String} data File Content as String
 * @returns String
 */
const formatString = (data) => data.replaceAll(/\n/g, "<br>");

/**
 * Receives File Content as String and Performs the API call to check the Errors in content. After API call, it receives the suggestions for those error words. In case of error it renders Error Statement on page
 * @param {String} readData File Content as String
 */
const makeAPICall = async (fileData) => {
    try {
        let renderData = formatString(fileData);
        $("main").html(renderData);

        const URL = `https://api.textgears.com/spelling?text=${fileData}&language=en-GB&key=${APIKEY}`;

        const res = await (await fetch(URL)).json();
        const words = res.response.errors;
        const badWords = [];
        const suggestions = [];

        words.forEach((word) => {
            badWords.push(word.bad);
            suggestions.push(word.better);
        });

        renderErrors(badWords, renderData);
        renderSuggestions(badWords, suggestions);
    } catch (err) {
        $("main").html("<h3 style='color: red'>Something Went Wrong!</h3>");
    }
};

/* 
    READ FILE CONTENT
*/
$(".file").change(function (e) {
    e.preventDefault();

    const file = this.files[0];
    reader.onload = function () {
        fileContent = reader.result;
        $("label").css("text-transform", "none").text(file.name);

        if (file.name.endsWith(".txt")) makeAPICall(fileContent);
        else {
            $("main").html(
                "<h3 style='color: red'>Please upload a '.txt' file.</h3>"
            );
            setTimeout(() => {
                $("label")
                    .css("text-transform", "uppercase")
                    .text("Select a .txt file to scan:");
                $("main").html("");
            }, 2000);
        }
    };
    reader.readAsText(file);
});

dropArea.addEventListener("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    dropArea.style.backgroundColor = "#423e3e";
});

dropArea.addEventListener("drop", function (e) {
    e.stopPropagation();
    e.preventDefault();

    setTimeout(() => {
        dropArea.style.backgroundColor = "#817b7b";
    }, 100);

    const file = e.dataTransfer.files[0];
    reader.onload = function () {
        fileContent = reader.result;
        $("label").css("text-transform", "none").text(file.name);

        if (file.name.endsWith(".txt")) makeAPICall(fileContent);
        else {
            $("main").html(
                "<h3 style='color: red'>Sorry! I can only read a '.txt' file.</h3>"
            );
            setTimeout(() => {
                $("label")
                    .css("text-transform", "uppercase")
                    .text("Select a .txt file to scan:");
                $("main").html("");
            }, 2000);
        }
    };
    reader.readAsText(file);
});

/* 
    console.log(e.target);
    console.log(dropArea.parentNode);
    console.log(dropArea.childNodes);
    dropArea == this
    e.target: Where you clicked / touched
*/

// !?"
