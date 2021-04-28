const User = require('../../models/users');
const bcrypt = require('bcryptjs')
const { dateToString } = require('../../helpers/date');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async args => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('User already exists.');
            }
            const hashedPass = await bcrypt.hash(args.userInput.password, 12);

            const user = new User({
                email: args.userInput.email,
                password: hashedPass,
            });
            const res = await user.save()
            return { ...res._doc, password: "null" }
        } catch (err) {
            throw err;
        }
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User does not exist!');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect!');
        }
        const token = jwt.sign(
            { userID: user.id, email: user.email },
            'thisisastringforshopifychallenge',
            {
                expiresIn: '1h'
            }
        );
        return { userID: user.id, token: token, tokenExpiration: 1 };
    }
}

