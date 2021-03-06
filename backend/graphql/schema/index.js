const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Image {
    _id : ID!
    name : String!
    description : String!
    price : Float!
    date : String!
    creator: User!
}

type AuthData {
    userID : ID!
    token : String!
    tokenExpiration: Int!
}

type User {
    _id : ID!
    email: String!
    password: String
    createdImages : [Image!]
}

type S3Payload {
    signedRequest : String!,
    url : String!
}
input UserInput {
    email: String!
    password: String
}

input ImageInput {
    name : String!
    description : String!
    price : Float!
    date : String!
}

type RootQuery {
    images : [Image!]!
    login(email: String!, password: String!) : AuthData!
}

type RootMutation {
    createImage(imageInput : ImageInput): Image
    createUser(userInput : UserInput) : User
    deleteImage(deleteImageId : ID!) : Image!
    signS3(filename : String!, filetype : String!) : S3Payload!
}

schema {
    query : RootQuery
    mutation : RootMutation
}
`);