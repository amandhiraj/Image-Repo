
const Image = require('../../models/Image');
const User = require('../../models/users');
const { dateToString } = require('../../helpers/date');

const transformImage = img => {
    return {
        ...img._doc,
        _id: img.id,
        date: dateToString(img._doc.date),
        creator: user.bind(this, img.creator)
    };
};

const image = async imageID => {
    try {
        const images = await Image.find({ _id: { $in: imageID } });
        return images.map(image => {
            return transformImage(image);
        });
    } catch (err) {
        throw err;
    }
}

const user = async userID => {
    try {
        const user = await User.findById(userID);
        return {
            ...user._doc,
            createdImages: image.bind(this, user._doc.createdImages),
        }
    } catch (err) {
        throw err;
    }
}

exports.transformImage = transformImage;

//exports.user = user;
//exports.image = image;
