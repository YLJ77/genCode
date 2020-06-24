const jwt = require('jsonwebtoken');
const User = require('../db/models/user');

const auth = async (req, res, next) => {
    try {
        console.log(req.header('Authorization'));
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.decode(token);
        jwt.verify(token, 'mycfgpage', async (err) => {
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
            if (err || !user) {
                res.status(401).send({errMsg: '登录已过期，请重新登录'});
            } else {
                req.token = token;
                req.user = user;
                next()
            }

        });
    } catch (e) {
        res.status(500).send(e);
    }
};

module.exports = auth;