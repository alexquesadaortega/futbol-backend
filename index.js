import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// 📦 Conexión a MongoDB
// ---------------------------------------------
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

// ---------------------------------------------
// 📘 Modelo de Usuario
// ---------------------------------------------
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  players: [
    {
      name: String,
      pos: String,
      media: Number,
    },
  ],
});

const User = mongoose.model("User", userSchema);

// ---------------------------------------------
// 🔐 Registro de usuario
// ---------------------------------------------
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, message: "Faltan campos" });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.json({ success: false, message: "El usuario ya existe" });
    }

    const newUser = new User({ username, password, players: [] });
    await newUser.save();

    res.json({ success: true, message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error en el servidor" });
  }
});

// ---------------------------------------------
// 🔑 Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    // Devolver el usuario completo con los jugadores
    res.json({ success: true, message: "Login correcto", user });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error en el servidor" });
  }
});


// ---------------------------------------------
// ➕ Añadir jugador
// ---------------------------------------------
app.post("/add-player", async (req, res) => {
  try {
    console.log("📩 Datos recibidos en /add-player:", JSON.stringify(req.body, null, 2));

    const { username, player } = req.body;

    if (!username) {
      console.warn("⚠️ Falta username");
      return res.json({ success: false, message: "Falta el nombre de usuario" });
    }

    if (!player || !player.name || !player.pos || player.media === undefined) {
      console.warn("⚠️ Faltan datos del jugador:", player);
      return res.json({ success: false, message: "Faltan datos del jugador" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.warn("⚠️ Usuario no encontrado:", username);
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    user.players.push({
      name: player.name,
      pos: player.pos,
      media: Number(player.media),
    });

    await user.save();

    console.log("✅ Jugador guardado correctamente");
    res.json({ success: true, message: "Jugador agregado correctamente" });
  } catch (err) {
    console.error("❌ Error al guardar el jugador:", err.message);
    res.json({ success: false, message: "Error al guardar el jugador" });
  }
});

// ---------------------------------------------
// 📋 Obtener jugadores
// ---------------------------------------------
app.post("/get-players", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.json({ success: false, message: "Falta el nombre de usuario" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, players: user.players });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error en el servidor" });
  }
});

// ---------------------------------------------
// ❌ Borrar jugador
// ---------------------------------------------
app.post("/delete-player", async (req, res) => {
  try {
    const { username, playerName } = req.body;

    if (!username || !playerName) {
      return res.json({ success: false, message: "Faltan datos" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }

    user.players = user.players.filter((p) => p.name !== playerName);
    await user.save();

    res.json({ success: true, message: "Jugador eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error en el servidor" });
  }
});

// ---------------------------------------------
// 🚀 Servidor
// ---------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en el puerto ${PORT}`));




