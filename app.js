require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const routes = require('./routes');
const htmlRoutes = require('./htmlRoutes');
const connectDB = require('./config/db');
const { checkAuthSession } = require('./htmlControllers/sessionMiddleware');

const app = express();

const PORT = process.env.PORT || 3000;

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressLayouts);
app.use(checkAuthSession);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect DB
connectDB();

// API Routes
app.use('/api/v1', routes);

// HTML Routes (Web Interface)
app.use('/', htmlRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('shared/404', {
    pageTitle: '404 - Trang Không Tìm Thấy',
    message: 'Trang bạn tìm kiếm không tồn tại'
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
