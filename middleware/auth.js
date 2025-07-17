const jwt=require('jsonwebtoken');

const authorizeSAdminCAdminAndDAdmin = (req, res, next) => {
    // console.debug("authorization --> " + req.headers["authorization"]);
    if (req.headers["authorization"]) {
        const token = req.headers["authorization"].split(" ")[1];
        const payload = jwt.verify(token, "secretkey")
        // console.log(payload);
        if (payload.role_id === 2000 || payload.role_id === 100 || payload.role_id === 3000 || payload.role_id === 4000 || payload.role_id === 6000) {
            const decode = jwt.decode(token);
            req.user=decode;
            next()
        } else {
            res.status(401).json({
                error: true,
                message: "Authorization failed",
                data: null
            })
        }
    } else {
        res.status(401).json({

            error: true,
            message: "Not Authorized",
            data: null
        })
    }
}

const authorizeSAdminAndCAdmin = (req, res, next) => {
    // console.debug("authorization --> " + req.headers["authorization"]);
    if (req.headers["authorization"]) {
        const token = req.headers["authorization"].split(" ")[1]
        const payload = jwt.verify(token, "secretkey")
        // console.log(payload);
        if (payload.role_id !== 1000 || payload.role_id !== 5000) {
            const decode = jwt.decode(token);
            req.user=decode;
            next()
        } else {
            res.status(401).json({
                error: true,
                message: "Authorization failed",
                data: null
            })
        }
    } else {
        res.status(401).json({
            error: true,
            message: "Not Authorized",
            data: null
        })
    }
}

const authorizeOnlySAdmin = (req, res, next) => {

    if (req.headers["authorization"]) {
        const token = req.headers["authorization"].split(" ")[1];
        // console.log("token for sadmin:",token);

        const payload = jwt.verify(token, "secretkey")
        // console.log("payload",payload);
        if (payload.role_id === 2000 || payload.role_id === 100) {
            const decode = jwt.decode(token);
            req.user=decode;
            next()
        } else {
            res.status(401).json({
                error: true,
                message: "Authorization failed",
                data: null
            })
        }
    } else {
        res.status(401).json({
            error: true,
            message: "Not Authorized",
            data: null
        })
    }
}

const allRolesAuthorization = (req, res, next) => {
    // console.debug("authorization --> " + req.headers["authorization"]);
    if (req.headers["authorization"]) {
        const token = req.headers["authorization"].split(" ")[1];
        const payload = jwt.verify(token, "secretkey")
        // console.log(payload);
        if (payload.role_id === 2000 || payload.role_id === 100 || payload.role_id === 3000 || payload.role_id === 4000 || payload.role_id === 5000 || payload.role_id === 6000) {
            const decode = jwt.decode(token);
            req.user=decode;
            next()
        } else {
            res.status(401).json({
                error: true,
                message: "Authorization failed",
                data: null
            })
        }
    } else {
        res.status(401).json({

            error: true,
            message: "Not Authorized",
            data: null
        })
    }
}

module.exports = {
    authorizeSAdminCAdminAndDAdmin,
    authorizeSAdminAndCAdmin,
    authorizeOnlySAdmin,
    allRolesAuthorization
}