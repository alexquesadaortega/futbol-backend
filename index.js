import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// --- CORS ---
app.use(cors({ origin: 'https://generadorequiposalkor11.netlify.app' })); 
// Para desarrollo puedes usar: app.use(cors());

// --- Middleware ---
app.use(express.json());

// --- Schemas y modelos ---
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

// --- Rutas ---

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.json({ success:false, message:'Faltan datos' });

  try {
    const exists = await User.findOne({ username });
    if(exists) return res.json({ success:false, message:'Usuario ya existe' });

    const newUser = new User({ username, password, players: [] });
    await newUser.save();
    res.json({ success:true, message:'Usuario registrado correctamente' });
  } catch(err) {
    console.error(err);
    res.json({ success:false, message:'Error al registrar' });
  }
});

// Login
app.post('/login', async (req,res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.json({ success:false, message:'Faltan datos' });

  try {
    const user = await User.findOne({ username, password });
    if(!user) return res.json({ success:false, message:'Usuario o contraseña incorrecta' });

    res.json({ success:true, user });
  } catch(err) {
    console.error(err);
    res.json({ success:false, message:'Error al iniciar sesión' });
  }
});

// Añadir jugador
app.post('/addPlayer', async (req,res) => {
  const { username, player } = req.body;
  if(!username || !player) return res.json({ success:false, message:'Faltan datos' });

  try {
    const user = await User.findOne({ username });
    if(!user) return res.json({ success:false, message:'Usuario no encontrado' });

    user.players.push(player);
    await user.save();
    res.json({ success:true, message:'Jugador añadido correctamente' });
  } catch(err) {
    console.error(err);
    res.json({ success:false, message:'Error al añadir jugador' });
  }
});

// --- Conectar MongoDB y levantar servidor ---
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(()=>app.listen(PORT, ()=>console.log(`Servidor en marcha en puerto ${PORT}`)))
  .catch(err=>console.error('Error MongoDB:', err));

