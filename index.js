const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // para usar MONGO_URI desde variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors()); // permite cualquier origen
// Si quieres restringir solo a tu frontend:
// app.use(cors({ origin: 'https://generadorequiposalkor11.netlify.app' }));

app.use(express.json());

// --- CONEXIÓN MONGO ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(()=>console.log('MongoDB conectado'))
.catch(err=>console.error('Error MongoDB:', err));

// --- MODELOS ---
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  players: [
    { name: String, pos: String, media: Number }
  ]
});

const User = mongoose.model('User', userSchema);

// --- RUTAS ---

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ message: 'Rellena todos los campos' });
  try {
    const exists = await User.findOne({ username });
    if(exists) return res.status(400).json({ message: 'Usuario ya existe' });

    const user = new User({ username, password, players: [] });
    await user.save();
    res.json({ message: 'Usuario registrado correctamente' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ message: 'Rellena todos los campos' });
  try {
    const user = await User.findOne({ username, password });
    if(!user) return res.status(400).json({ message: 'Usuario o contraseña incorrecta' });
    res.json(user); // devuelve info del usuario, incluyendo players
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// Añadir jugador
app.post('/addPlayer', async (req,res)=>{
  const { username, name, pos, media } = req.body;
  if(!username || !name || !pos || media == null) return res.status(400).json({ message: 'Datos incompletos' });
  try {
    const user = await User.findOne({ username });
    if(!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    user.players.push({ name, pos, media });
    await user.save();
    res.json({ message: 'Jugador añadido', players: user.players });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Error al añadir jugador' });
  }
});

// Obtener jugadores de un usuario
app.get('/players/:username', async (req,res)=>{
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if(!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user.players);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener jugadores' });
  }
});

// --- START SERVER ---
app.listen(PORT, ()=>console.log(`Servidor escuchando en puerto ${PORT}`));
