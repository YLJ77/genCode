const mongoose = require('mongoose');
const pageSchema = new mongoose.Schema({
    pageCfg: {
        type: JSON,
        trim: true,
        required: true
/*
        enum: ['page', 'form'],
        lowercase: true,
        default: 'page'
*/
    },
    translate: {  // translate文件内容
        type: JSON,
        trim: true,
        default: ''
    },
    serv: {  // serve文件内容
        type: String,
        trim: true,
        default: ''
    },
    less: {  // less文件内容
        type: String,
        trim: true,
        default: ''
    },
    view: {  // view文件内容
        type: String,
        trim: true,
        default: ''
    },
    mod: {  // mod文件内容
        type: String,
        trim: true,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectID,
        required: true,
        ref: 'User'
    }
},{timestamps:true});

pageSchema.methods.toJSON = function () {
    const page = this;
    const pageObject = page.toObject();

    pageObject.id = pageObject._id;
    return pageObject
};

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;
