const mongoose = require('mongoose');
const pageSchema = new mongoose.Schema({
    pageType: {
        type: String,
        enum: ['page', 'form'],
        trim: true,
        lowercase: true,
        default: 'page'
    },
    actionVisible: {
        type: Boolean,
        default: true
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
