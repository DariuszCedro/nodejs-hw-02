import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import contactsRouter from'./routes/api/contacts.js';
import usersRouter from './routes/api/users.js';
const __dirname = import.meta.dirname;
import path from "path";

export const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(morgan(formatsLogger))
app.use(cors())
app.use(express.json())
//################################################
app.use(express.static(path.resolve(__dirname, "./public")))

app.use('/api/contacts', contactsRouter)

app.use('/api/users', usersRouter)


app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

export default app
