const mongoose = require('mongoose');
const validator = require('validator');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Page = require('./page');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},
    {
        timestamps: true
    });

userSchema.virtual('pages', {
    ref: 'Page',
    localField: '_id',
    foreignField: 'owner'
});

// res.send 调用的时候会默认调用toJSON方法
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    userObject.id = userObject._id;

    return userObject
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'mycfgpage', {expiresIn: '24 hours'});

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token
};

userSchema.statics.findByCredentials = async (email, password) => {
    return await User.findOne({ email, password });

/*
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login')
    }
*/

};

/*
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
});
*/

// Delete user pages when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    await Page.deleteMany({ owner: user._id });
    next()
});

const User = mongoose.model('User', userSchema);

module.exports = User;