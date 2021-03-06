const express = require('express')
const { gql, GraphQLClient } = require('graphql-request')
const bodyParser = require('body-parser')
const cors = require('cors')
const basicAuth = require('express-basic-auth')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const GRAPHCMS_API_URI = process.env.GRAPHCMS_API_URI
const GRAPHCMS_API_PAT = process.env.GRAPHCMS_API_PAT
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(basicAuth({
    users: { [USERNAME]: PASSWORD },
    unauthorizedResponse: req => {
        return req.auth ? "Invalid username or password" : "No credentials provided"
    }
}))

const client = new GraphQLClient(GRAPHCMS_API_URI, {
    headers: {
        Authorization: `Bearer ${GRAPHCMS_API_PAT}`
    }
})

const CreatePostMutation = gql`
    mutation createPost($title: String!, $description: RichTextAST!) {
        createPost(data: {title: $title, description: $description}) {
            id
        }
    }
`

const PublishPostMutation = gql`
    mutation publishPost($id: ID!) {
        publishPost(where: { id: $id } to: PUBLISHED) {
            id
        }
    }
`

app.post("/create-post", (req, res) => {
    // Check if title and description are provided
    if (!req.body.title || !req.body.description) {
        res.status(400).json({
            message: "Title and description are required."
        })
        return
    }

    // Create post
    client.request(CreatePostMutation, {
        title: req.body.title,
        description: req.body.description
    }).then(data => {
        // Publish post
        client.request(PublishPostMutation, {
            id: data.createPost.id
        }).then(data => {
            res.json({
                message: "Post created and published.",
                postId: data.publishPost.id
            })
        }
        ).catch(err => {
            res.status(500).json({
                message: "Successfully created post, but failed to publish it."
            })
        })
    }).catch(err => {
        res.status(500).json({
            message: "Failed to create post."
        })
        
    })
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})