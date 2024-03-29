/* 
    Works for single small paragraph: v1
*/
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
    const errorMark = [];
    let html = "";
    badWords = [...new Set(badWords)];

    badWords.forEach((word, index) => {
        html = `<span>
                <div>
                    <span class="mark">${word}</span>
                    <span class="tiptext hidden">
                    </span>
                </div>
            </span>`;
        const str = badWords[index].replace(badWords[index], html);
        errorMark.push(str);
    });

    const render = renderData
        .replaceAll("<br>", " ")
        .split(" ")
        .filter((word) => word);

    // console.log(render, badWords);

    render.forEach((word, index) => {
        for (let i = 0; i < badWords.length; i++) {
            const w = badWords[i];
            const found = word.match(new RegExp(`\\b${w}\\b`));
            if (found) {
                render.splice(index, 1, errorMark[i]); // OR
                // render[index] =
                //     render[index].replace(word, errorMark[i]) +
                //     render[index].slice(word.length); // OR
                // word = word.replace(word, errorMark[i]);
                // render[index] = word;
                break;
            }
        }
    });

    // console.log(render);

    renderData = render.join(" ");

    $("main").html(renderData);
};

/**
 * Accepts File contents as String and filters out the unnecessary symbols prepares the string for display
 * @param {String} data File Content as String
 * @returns String
 */
const formatString = (data) => data.replaceAll(/[\n\r]/g, "<br>");

const getJSON = async (data) => {
    let scanText = data.replaceAll(/[\n\r]/g, " ");

    const URL = `https://api.textgears.com/spelling?text=${scanText}&language=en-GB&key=${APIKEY}`;

    return await (await fetch(URL)).json();
};

/**
 * Receives File Content as String and Performs the API call to check the Errors in content. After API call, it receives the suggestions for those error words. In case of error it renders Error Statement on page
 * @param {String} readData File Content as String
 */
const makeAPICall = async (fileData) => {
    try {
        let renderData = formatString(fileData);
        // let scanText = paragraph.replaceAll(/[\n\r]/g, " ");
        $("main").html(fileData);

        // const URL = `https://api.textgears.com/spelling?text=${scanText}&language=en-GB&key=${APIKEY}`;

        // const res = await (await fetch(URL)).json();
        const res = await getJSON(fileData);
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
        console.log(err);
    }
};

/* 
    READ FILE CONTENT
*/
$(".file").change(function (e) {
    e.preventDefault();
    fileContent = "";

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
    fileContent = "";

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
