const express = require('express');
const User = require('../db/models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const {formatOutput} = require('../util/appFunc');

router.post('/user', async (req, res) => {
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
        const token = await user.generateAuthToken();
        res.send(formatOutput({data: {user,token}}));
    } catch (e) {
        res.status(400).send({errMsg: '账号或密码错误'})
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
        res.send(formatOutput({data: {msg: 'success'}}));
    } catch (e) {
        res.status(400).send(e)
    }
});

router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.find({});
        res.send(formatOutput({data: {user}}));
    } catch (e) {
        res.status(500).send(e)
    }
});

router.get('/user/me', auth, async (req, res) => {
    res.send(req.user);
    res.send(formatOutput({data: {user:req.user}}));
});

router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ errMsg: 'Invalid updates!' })
    }

    try {
        const user = req.user;

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(formatOutput({data: {user}}));
    } catch (e) {
        res.status(400).send(e)
    }
});

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(formatOutput({data: {msg: 'success'}}));
    } catch (e) {
        res.status(500).send(e)
    }
});

module.exports = router;