const jwt = require("jsonwebtoken");

var JWTAuthMiddleware = function(req, res, next) {
    console.log(
        "\n-----[JWT MiddleWare] JWT Middleware " +
        req.url +
        "  ip= " +
        req.connection.remoteAddress
    );
    if (
        req.url == "/users/login" ||
        req.url == "/users/register" ||
        req.url == "/forgotPassword/:email"
    ) {
        next();
    } else {
        const token = req.headers.token;
        if (!token || token === "" || token.includes("object")) {
            console.log("[JWT MiddleWare] No token found");
            res.status(401).send("Unauthorized: Token not found ");
        } else {
            console.log("[JWT MiddleWare] token found");
            jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    res.status(401).send("Unauthorized: Invalid token");
                } else {
                    console.log(
                        "[JWT MiddleWare] user is autherised " +
                        JSON.stringify(decoded.userData)
                    );
                    req.headers.userData = decoded.userData;
                    next();
                }
            });
        }
    }
};

var GenerateJWT = function(data) {
    var user = { userData: data };
    payload = user;
    token = jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: "6h",
    });
    return token;
};

const getUserData = (token) => {
    return jwt.verify(token, process.env.TOKEN_SECRET).userData;
};

module.exports = {
    JWTAuthMiddleware,
    GenerateJWT,
    getUserData,
};