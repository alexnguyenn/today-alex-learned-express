const express = require('express')
const { gql, GraphQLClient } = require('graphql-request')
const bodyParser = require('body-parser')
const cors = require('cors')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const GRAPHCMS_API_URI = process.env.GRAPHCMS_API_URI
const GRAPHCMS_API_PAT = process.env.GRAPHCMS_API_PAT
const PASSWORD = process.env.PASSWORD
const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const client = new GraphQLClient(GRAPHCMS_API_URI, {
    headers: {
        Authorization: `Bearer ${GRAPHCMS_API_PAT}`
    }
})

const CreatePostMutation = gql`
    mutation createPost($title: String!, $description: RichTextAST!) {
        createPost(data: {title: $title, description: $description}) {
            id
            title
            description {
                markdown
            }
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
    // Check password
    if (req.body.password !== PASSWORD) {
        res.status(401).send("Invalid password")
        return
    }

    // Check if title and description are provided
    if (!req.body.title || !req.body.description) {
        res.status(400).send("Title and description are required")
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
            res.send(data)
        }
        ).catch(err => {
            res.status(500).send(err)
        })
    }).catch(err => {
        res.status(500).send(err)
    })
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})