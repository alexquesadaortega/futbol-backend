// index.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

let db;
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('futbol');
    console.log('Conectado a MongoDB Atlas');
  })
  .catch(err => console.error('Error conectando a MongoDB Atlas:', err));

// --- REGISTRO ---
app.post('/register', async (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.json({ message: 'Faltan datos' });
  const exists = await db.collection('users').findOne({ username });
  if(exists) return res.json({ message: 'Usuario ya existe' });
  const result = await db.collection('users').insertOne({ username, password, players: [] });
  res.json({ message: 'Usuario registrado correctamente' });
});

// --- LOGIN ---
app.post('/login', async (req,res)=>{
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username, password });
  if(!user) return res.json({ message: 'Usuario o contraseña incorrecta' });
  // Creamos un token simple (para prototipo)
  const token = user._id.toString();
  res.json({ token });
});

// --- OBTENER JUGADORES DEL USUARIO ---
app.post('/mis-jugadores', async (req,res)=>{
  const { token } = req.body;
  if(!token) return res.json([]);
  const user = await db.collection('users').findOne({ _id: new ObjectId(token) });
  if(!user) return res.json([]);
  res.json(user.players || []);
});

// --- AÑADIR JUGADOR ---
app.post('/jugadores', async (req,res)=>{
  const { token, nombre, posicion, media } = req.body;
  if(!token || !nombre || !posicion || media==null) return res.status(400).json({message:'Faltan datos'});
  const userId = new ObjectId(token);
  const player = { nombre, posicion, media };
  await db.collection('users').updateOne(
    { _id: userId },
    { $push: { players: player } }
  );
  res.json(player);
});

app.listen(PORT, ()=>console.log(`Servidor listo en https://futbol-backend-0gnv.onrender.com`));
