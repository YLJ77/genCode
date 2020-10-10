const express = require('express');
const Page = require('../db/models/page');
const router = new express.Router();
const path = require('path');
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
const {formatOutput, delDirFiles} = require('../util/appFunc');
const {genPageFile} = require("../genCode/page/genPageFile")
const {replacePageField} = require('../genCode/page/index')

router.post('/page/add', auth, async (req,res) => {
    try {
        const {translate,serv,less,view,mod, err} = await genPageFile({cfg: req.body});
        const page = new Page({
            pageCfg: req.body.pageCfg,
            translate,
            serv,
            less,
            view,
            mod,
            owner: req.user._id
        });
        if (err) {
            res.status(500).send(formatOutput({data: err, code: -1}));
        } else {
            await page.save();
            res.status(201).send(formatOutput({data: page, err}));
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

function clearUploadDir(req,res,next) {
    const outputPath = path.join(__dirname, '../../public/upload');
    delDirFiles(outputPath);
    next();
}

router.post('/page/upload', auth, clearUploadDir, upload.array('file',), (req,res) => {
    res.status(200).send(formatOutput({data: req.files}));
});

router.post('/page/fieldReplace', auth, clearUploadDir, upload.array('file',), async (req,res) => {
    await replacePageField({cfg:req.body,files:req.files});
    res.status(200).send(formatOutput({data: req.files}));
});

router.post('/page/list', auth, async (req,res) => {
    try {
        const {pageSize = 10,curPage = 1} = req.body;
        const pages = await Page.find({
            owner: req.user._id
        }).limit(pageSize)
            .skip(pageSize * (curPage - 1));

        res.status(200).send(formatOutput({
            data: {
                list: pages,
                totalCount: pages.length,
                pageSize,
                curPage
            }
        }));
/*
        const pages = await req.user.populate({
            path: 'pages',
            match: {
                // actionVisible: true
            },
            options: {
                limit: parseInt(req.body.limit || 10),
                skip: parseInt(req.body.skip || 0),
                sort: {
                    createdAt: -1
                }
            }
        }).execPopulate();  // 执行的功能等同于上一句
        res.send(req.user.pages);
*/
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/page/:id', auth, async (req,res) => {
    try {
        const page = await Page.findOne({_id: req.params.id, owner: req.user._id});
        if (page) {
            await genPageFile({cfg: {pageCfg: page.pageCfg}});
            res.status(200).send(formatOutput({data: page}));
        } else {
            res.status(400).send(formatOutput({
                data: page,
                code: -1,
                msg: '未找到相关页面'
            }));
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/page/:id', auth, async (req,res) => {
    try {
        // const page = await Page.findByIdAndUpdate(req.params.id,req.body,{new: true,runValidators:true});
        let page = await Page.findOne({_id: req.params.id, owner: req.user._id});
        if (page) {
            const {translate,serv,less,view,mod, err} = await genPageFile({cfg: req.body});
            const data = {
                pageCfg: req.body.pageCfg,
                translate,
                serv,
                less,
                view,
                mod,
                owner: req.user._id
            };
            if (err) {
                res.status(500).send(formatOutput({data: err, code: -1}));
            } else {
                await page.update(data);
                res.status(200).send(formatOutput({data:page}));
            }
        } else {
            res.status(400).send(formatOutput({
                data: page,
                code: -1,
                msg: '未找到相关页面'
            }));
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
