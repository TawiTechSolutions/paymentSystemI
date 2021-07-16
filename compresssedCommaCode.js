console.log(
    ((e) => {
        let l,
            t,
            n = (e = e.toString()).indexOf(".");
        if (
            (n >= 0 ? ((l = e.slice(0, n)), (t = e.slice(n))) : ((l = e), (t = "")),
                l.length > 3)
        ) {
            let e = l.slice(0, l.length - 3) + "," + l.slice(l.length - 3);
            for (let l = 2; e.length - 4 - l > 0; l += 3)
                e = e.slice(0, e.length - 4 - l) + "," + e.slice(e.length - 4 - l);
            return e + t;
        }
        return e;
    })(100000000.234)
);