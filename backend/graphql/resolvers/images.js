const Image = require('../../models/Image');
const User = require('../../models/users');
const { transformImage } = require('./merge')
const aws = require('aws-sdk');

const ID = 'AKIAXQCKFQN3ZCBEQNUB';
const SECRET = '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';
const BUCKET_NAME = 'shopify-challenge-aman';
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
    },
    signS3: async (filename, filetype) => {
        // AWS_ACCESS_KEY_ID
        // AWS_SECRET_ACCESS_KEY
        const s3 = new aws.S3({
            accessKeyId: ID,
            secretAccessKey: SECRET,
            signatureVersion: 'v4',
            region: 'ca-central-1',
        });

        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Expires: 120,
            ContentType: filetype,
            ACL: 'public-read',
        };

        const signedRequest = await s3.getSignedUrl('putObject', s3Params);
        const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;

        return {
            signedRequest,
            url,
        };
    },
}