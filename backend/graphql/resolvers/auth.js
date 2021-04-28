const User = require('../../models/users');
const bcrypt = require('bcryptjs')
const { dateToString } = require('../../helpers/date');

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
    }
}

