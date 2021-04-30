const Image = require('../../models/Image');
const User = require('../../models/users');
const { transformImage } = require('./merge')

module.exports = {
    images: async () => {
        try {
            const images = await Image.find();
            return images.map(image => {
                return transformImage(image);
            });
        } catch (err) {
            throw err;
        }
    },
    createImage: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Not Authenticated!')
        }
        const image = new Image({
            name: args.imageInput.name,
            description: args.imageInput.description,
            price: +args.imageInput.price,
            date: new Date(args.imageInput.date),
            creator: req.userID
        });
        let createdImages;
        try {
            const res = await image.save();
            createdImages = transformImage(res);

            const creator = await User.findById(req.userID);

            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdImages.push(image);
            await creator.save();
            return createdImages;
        } catch (err) {
            throw err;
        }
    },
    deleteImage: async args => {
        try {
            const image = await Image.findById(args.deleteImageId);
            if (!image) {
                throw new Error('Image not found.');
            }
            await Image.deleteOne({ _id: args.deleteImageId })
            return transformImage(image);
        } catch (error) {
            throw error;
        }
    }
}