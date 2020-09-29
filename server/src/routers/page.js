const express = require('express');
const Page = require('../db/models/page');
const router = new express.Router();
const auth = require('../middleware/auth');
const {formatOutput} = require('../util/appFunc');
const {genPage} = require("../genCode/page/genPage")

router.post('/page/add', auth, async (req,res) => {
    const page = new Page({
            ...req.body,
            owner: req.user._id
        });
    try {
        await genPage({cfg: req.body});
        // await page.save();
        res.status(201).send(formatOutput({data: page}));
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/page', auth, async (req,res) => {
    try {
        // const pages = await Page.find({owner: req.user._id});
        // res.status(200).send(formatOutput({data: {list: pages, totalCount: pages.length}}));
        const pages = await req.user.populate({
            path: 'pages',
            match: {
                // actionVisible: true
            },
            options: {
                limit: parseInt(req.query.limit || 10),
                skip: parseInt(req.query.skip || 0),
                sort: {
                    createdAt: -1
                }
            }
        }).execPopulate();  // 执行的功能等同于上一句
        res.send(req.user.pages);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/page/:id', auth, async (req,res) => {
    try {
        const page = await Page.findOne({_id: req.params.id, owner: req.user._id});
        if (page) {
            res.status(200).send(formatOutput({data: page}));
        } else {
            res.status(400).send({errMsg: 'not found search by ' + req.params.id});
        }
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/page/:id', auth, async (req,res) => {
    try {
        // const page = await Page.findByIdAndUpdate(req.params.id,req.body,{new: true,runValidators:true});
        let page = await Page.findOne({_id: req.params.id, owner: req.user._id});
        if (page) {
            await page.update(req.body);
            res.status(200).send(formatOutput({data: {msg: 'success'}}));
        } else {
            res.status(400).send('not found search by ' + req.params.id);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/page/:id', auth, async (req,res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, owner: req.user._id});
        if (page) {
            await page.remove();
            res.status(200).send(formatOutput({data: {msg: 'success'}}));
        }
        else res.status(400).send('not found item search by ' + req.params.id);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
