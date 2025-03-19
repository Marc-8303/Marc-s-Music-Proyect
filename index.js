const express = require('express');
const app = express(); // MOVER ESTA LÍNEA AQUÍ (2do lugar)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Crear el directorio 'uploads' si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Servir archivos estáticos desde 'public' y 'uploads'
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


// Ruta para subir archivos
app.post('/upload', upload.single('mp3file'), (req, res) => {
  res.send('Archivo subido exitosamente');
});

// Ruta para listar archivos MP3
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      res.status(500).send('Error al leer el directorio');
    } else {
      res.json(files.filter(file => file.endsWith('.mp3')));
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
