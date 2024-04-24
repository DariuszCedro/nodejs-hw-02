import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import contactsRouter from'./routes/api/contacts.js';
import usersRouter from './routes/api/users.js';
import setJWTStrategy from './config/jwt.js';
import authMiddleware from './middlewares/jwt.js'

export const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(morgan(formatsLogger))
app.use(cors())
app.use(express.json())

setJWTStrategy();


app.use('/api/contacts', authMiddleware, contactsRouter)
//###########################################
app.use('/api/users', usersRouter)
//###########################################

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

export default app
