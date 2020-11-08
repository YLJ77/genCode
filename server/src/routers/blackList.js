const express = require('express');
const BlackList = require('../db/models/blackList');
const router = new express.Router();
const auth = require('../middleware/auth');
const {formatOutput} = require('../util/appFunc');

router.post('/blackList/add', async (req, res) => {
    const blackList = new BlackList(req.body);

    try {
        await blackList.save();
        res.status(201).send(formatOutput({data: {blackList}}));
    } catch (e) {
        res.status(400).send(e)
    }
});


router.post('/blackList/list', auth, async (req, res) => {
    try {
        const {pageSize = 10,curPage = 1,name,remark} = req.body;
        const query = {
            $or: [
                {name: {$regex: new RegExp(name, 'i')}},
                {remark: {$regex: new RegExp(remark, 'i')}},
            ]
        }
        BlackList.find(query).limit(pageSize)
            .skip(pageSize * (curPage - 1))
            .sort({createdAt: -1})
            .exec((err, doc)  => {
                if (err) return res.json(err)
                BlackList.countDocuments(query).exec((countErr, count) => {
                    if (countErr) return res.json(countErr);
                    const data = { total:count, curPage, pageSize, list: doc }
                    return res.json(formatOutput({data}))
                })
            })
    } catch (e) {
        res.status(500).send(formatOutput({data: e, code: 1}))
    }
});

router.get('/blackList/:id', auth, async (req, res,next) => {
    const blackList = await BlackList.findById(req.params.id);
    res.send(formatOutput({data: blackList}));
    next();
});

router.patch('/blackList/:id', auth, async (req, res) => {

    try {
        const {name,remark} = req.body;
        const blackList = await BlackList.findByIdAndUpdate(req.body.id,{remark,name},{useFindAndModify: false});
        res.send(formatOutput({data: {blackList}}));
    } catch (e) {
        res.status(400).send(e)
    }
});

router.delete('/blackList/:id', auth, async (req, res) => {
    try {
        await BlackList.findByIdAndDelete(req.params.id);
        res.send(formatOutput({data: {msg: 'success'}}));
    } catch (e) {
        res.status(500).send(e)
    }
});

module.exports = router;