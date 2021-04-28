const { dateToString } = require('../../helpers/date');
const Image = require('../../models/Image');
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
        if(!req.isAuth){
            throw new Error('Not Authenticated!')
        }
        try {
            const image = new Image({
                name: args.imageInput.name,
                description: args.imageInput.description,
                price: +args.imageInput.price,
                date: args.imageInput.date,
                creator: "6089e185cee0211d5de91a52"
            });
            let createdImages;
            const res = await image.save();
            createdImages = transformImage(res);

            const creator = await User.findById('6089e185cee0211d5de91a52');

            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdImages.push(image);
            await creator.save();
            return createdImages;
        } catch (err) {
            throw err;
        }
    }
}