const mongoose = require('mongoose');

const BlackListSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            maxLength: 50
        },
        remark: {
            type: String,
            trim: true,
            lowercase: true,
            maxLength: 200
        },
        owner: {
            type: mongoose.Schema.Types.ObjectID,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true
    });

// res.send 调用的时候会默认调用toJSON方法
BlackListSchema.methods.toJSON = function () {
    const BlackList = this;
    const BlackListObject = BlackList.toObject();

    delete BlackListObject.password;
    delete BlackListObject.tokens;

    return BlackListObject
};

BlackListSchema.methods.toJSON = function () {
    const page = this;
    const pageObject = page.toObject();

    pageObject.id = pageObject._id;
    return pageObject
};

const BlackList = mongoose.model('BlackList', BlackListSchema);

module.exports = BlackList;