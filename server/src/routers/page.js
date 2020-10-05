const express = require('express');
const Page = require('../db/models/page');
const router = new express.Router();
const path = require('path');
const fs = require('fs');
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + `_${file.originalname}`)
    }
})
const upload = multer({storage});
const auth = require('../middleware/auth');
const {formatOutput} = require('../util/appFunc');
const {genPageFile} = require("../genCode/page/genPageFile")

router.post('/page/add', auth, async (req,res) => {
    const page = new Page({
            ...req.body,
            owner: req.user._id
        });
    try {
        const err = await genPageFile({cfg: req.body});
        // await page.save();
        if (err) {
            res.status(500).send(formatOutput({data: err, code: -1}));
        } else {
            res.status(201).send(formatOutput({data: page, err}));
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/page/upload', auth,upload.single('file'), async (req,res) => {
    debugLog({info: req.file});
    res.status(200).send(formatOutput({data: req.file}));
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
