import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000; // Se toma PORT de Render o 5000 por defecto
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err));

app.use(cors());
app.use(express.json());

// --- MODELOS ---
const playerSchema = new mongoose.Schema({
  name: String,
  pos: String,
  media: Number
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  players: [playerSchema]
});

const User = mongoose.model('User', userSchema);

// --- RUTAS ---

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, message: 'Faltan datos' });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.json({ success: false, message: 'Usuario ya existe' });

    const user = new User({ username, password, players: [] });
    await user.save();
    res.json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error en registro' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, message: 'Faltan datos' });

  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.json({ success: false, message: 'Usuario o contraseña incorrecta' });
    res.json({ success: true, message: 'Login correcto', user });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error en login' });
  }
});

// Agregar jugador
app.post('/add-player', async (req, res) => {
  const { username, name, pos, media } = req.body;
  if (!username || !name || !pos || media === undefined) return res.json({ success: false, message: 'Faltan datos' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: 'Usuario no encontrado' });

    user.players.push({ name, pos, media });
    await user.save();
    res.json({ success: true, message: 'Jugador agregado', players: user.players });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error al agregar jugador' });
  }
});

// Servidor
app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));
