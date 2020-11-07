const express = require('express');
const User = require('../db/models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const {formatOutput} = require('../util/appFunc');

router.post('/user/add', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send(formatOutput({data: {user,token}}));
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        if (user) {
            const token = await user.generateAuthToken();
            res.send(formatOutput({data: {user,token}}));
        } else {
            res.send(formatOutput({msg: '账号或密码错误', code: 2}));
        }
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send(formatOutput({data: {msg: 'success'}}));
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send(formatOutput());
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/user/list', auth, async (req, res) => {
    try {
        const {pageSize = 10,curPage = 1,email} = req.body;
        const reg = new RegExp(email, 'i');
        const query = {
            $or: [
                {email: {$regex: reg}}
            ]
        }
        User.find(query).limit(pageSize)
            .skip(pageSize * (curPage - 1))
            .sort({createdAt: -1})
            .exec((err, doc)  => {
                if (err) return res.json(err)
                User.countDocuments(query).exec((countErr, count) => {
                    if (countErr) return res.json(countErr);
                    const data = { total:count, curPage, pageSize, list: doc }
                    return res.json(formatOutput({data}))
                })
            })
    } catch (e) {
        res.status(500).send(formatOutput({data: e, code: 1}))
    }
});

router.get('/user/:id', auth, async (req, res,next) => {
    const user = await User.findById(req.params.id);
    res.send(formatOutput({data: user}));
    next();
});

router.patch('/user/:id', auth, async (req, res) => {

    try {
        const {email,password} = req.body;
        const user = await User.findByIdAndUpdate(req.body.id,{password,email},{useFindAndModify: false});
        res.send(formatOutput({data: {user}}));
    } catch (e) {
        res.status(400).send(e)
    }
});

router.delete('/user/:id', auth, async (req, res) => {
    try {
        // await req.user.remove();
        await User.findByIdAndDelete(req.params.id);
        res.send(formatOutput({data: {msg: 'success'}}));
    } catch (e) {
        res.status(500).send(e)
    }
});

module.exports = router;