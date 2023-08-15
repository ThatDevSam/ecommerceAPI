require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
//Logging package.
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
var path = require('path');
//Security packages
const cors = require('cors')
//connect to the db.
const connectDB = require('./db/connect')
//Middleware
const notFoundMiddleare = require('./middleware/notFound')
const errorHandlerMiddleware = require('./middleware/errorHandler')
//Routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
//Logging package.
app.use(morgan('tiny'))
//Allows access to json data in req.body
app.use(express.json())
//The argument is what will be used to sign the cookie.
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('public'))
app.use(fileUpload())

//Security package implementation
app.use(cors());

//Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)

app.use('*', (req, res) => {
    res.status(404).send('Route does not exist.')
})

app.use(notFoundMiddleare)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000
const start = async (req, res) => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is lisenting on ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()