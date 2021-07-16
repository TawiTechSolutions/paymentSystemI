const addCommas = (num) => {
    num = num.toString();
    let dotAt = num.indexOf(".");
    let old_string;
    let restOfString;
    if (dotAt >= 0) {
        old_string = num.slice(0, dotAt);
        restOfString = num.slice(dotAt);
    } else {
        old_string = num;
        restOfString = "";
    }
    if (old_string.length > 3) {
        let new_string =
            old_string.slice(0, old_string.length - 3) +
            "," +
            old_string.slice(old_string.length - 3);
        for (let i = 2; new_string.length - 4 - i > 0; i = i + 3) {
            new_string =
                new_string.slice(0, new_string.length - 4 - i) +
                "," +
                new_string.slice(new_string.length - 4 - i);
        }
        return new_string + restOfString;
    } else {
        return num;
    }
};

console.log(addCommas(100000.001));