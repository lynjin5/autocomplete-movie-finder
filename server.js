// README: 
// An app that allows you to search for movie titles 
// that autocompletes the search for you by hitting a mongodb database
// and gives you relevant suggestions

const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId, MongoKerberosError} = require('mongodb')
require('dotenv').config() //obscure data within a .env file

const PORT = 8100

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection 

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to db!`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

// Middleware
app.use(express.urlencoded( {extended: true}))
app.use(express.json())
app.use(cors())

//First GET: Brings back autocomplete stuff while user is typing
app.get('/search', async(req,res) => {
    try{
        let result = await collection.aggregate([
            {
                '$search': {
                    'autocomplete': {
                        'query': `${request.query.query}`,
                        'path': 'title',
                        'fuzzy': { // able to search even when the search term is a little off
                            'maxEdits': 2, //allows 2 character substitution
                            'prefixLength': 3 // user must type at least 3 letters before it starts the search
                        }
                    }
                }
            }
        ]).toArray()
        res.send(result)
    } catch (error) {
        res.status(500).send({message: error.message}) //sends back a msg so you know the app didn't work
    }
})

// Second GET: Brings back info about the specific movie, only runs 
// when user clicks on the title

app.get('/get/:id', async(req, res) => {
    try{
        let result = await collection.findOne({
            '_id:': ObjectId(req.params)
        })
        res.send(result)
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running!`)
})


Mongoose.connect(
    process.env.DB_CONNECTION,
    {useNewUrlParser: true},
    ()=> {console.log(`Connected to db!`)}
)