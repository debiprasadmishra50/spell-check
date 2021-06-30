/* 
    Trying another way for async-await
*/

const dropArea = document.querySelector(".droparea");

const APIKEY = "kTcMLyWHun68kPn4"; // https://textgears.com
const reader = new FileReader();
let fileContent = "";

const newfunction = async (badWords, suggestions) => {
    // console.log(suggestions);
    console.log("NEWFUNC");
    console.log(await badWords);
    console.log([...new Set(await badWords)]);
};

const getJSON = async (data) => {
    let scanText = data.replaceAll(/[\n\r]/g, " ");

    const URL = `https://api.textgears.com/spelling?text=${scanText}&language=en-GB&key=${APIKEY}`;

    return await (await fetch(URL)).json();
};

/**
 * Receives File Content as String and Performs the API call to check the Errors in content. After API call, it receives the suggestions for those error words. In case of error it renders Error Statement on page
 * @param {String} readData File Content as String
 */
const makeAPICall = (fileData) => {
    const paragraphs = fileData
        .split("\n")
        .filter((para) => para !== "\r" && para !== "");
    console.log(paragraphs.length);
    let res;
    const badWords = [];
    const suggestions = [];

    paragraphs.forEach((paragraph, i) => {
        // console.log(paragraph);

        (async () => {
            // console.log(i);
            const res = await getJSON(paragraph);
            const words = res.response.errors;

            words.forEach((word) => {
                // console.log(word.bad);
                badWords.push(word.bad);
                suggestions.push(word.better);
            });

            if (i === paragraphs.length - 1) newfunction(badWords, suggestions);
        })();
    });

    // console.log(badWords);
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
