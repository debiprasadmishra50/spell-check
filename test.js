const promise = new Promise(function (resolve, reject) {
    console.log("Promise Created");

    setTimeout(() => {
        resolve("Resolved");
    }, 1000);

    console.log("Promise Creation Complete");
});

/*
promise
    .then((res) => {
        console.log("Promise Resolved Value: ", res);
    })
    .catch((err) => {
        console.log("Promise Error: ", err);
    })
    .finally(() => {
        console.log("Promise Done");
    });
*/

(async () => {
    try {
        const res = await promise;
        console.log("Promise Resolved Value: ", res);
    } catch (err) {
        console.log("Promise Error: ", err);
    } finally {
        console.log("Promise Done");
    }
})();

console.log("Global Log");

setTimeout(() => {
    console.log("timeout");
}, 1000);

// console.log("Start");

// setTimeout(() => {
//     console.log("Timer 0 sec");
// }, 0);

// const demo = function () {
//     return new Promise((resolve, reject) => {
//         resolve("Resolved 1");
//         // reject("fail");
//     });
// };

// // Immediately Resolved
// Promise.resolve("Resolved 2").then((res) => {
//     for (let i = 0; i < 1000000000; i++) {}
//     console.log(res);
// });

// const a = demo();
// a.then((res) => {
//     console.log(res);
// });
