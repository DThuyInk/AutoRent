const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental';
  
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let retries = 5;
  
  while (retries) {
    try {
      await mongoose.connect(mongoURI, options);
      console.log('✅ MongoDB kết nối thành công');
      return mongoose.connection;
    } catch (error) {
      retries -= 1;
      console.log(`⚠️  Lỗi kết nối MongoDB: ${error.message}`);
      console.log(`📍 Thử lại... (${retries} lần còn lại)`);
      
      if (retries === 0) {
        console.error('\n❌ Không thể kết nối MongoDB sau 5 lần thử');
        console.error('\n💡 Hướng dẫn khắc phục:');
        console.error('   1. Kiểm tra MongoDB có chạy không');
        console.error('   2. Nếu chưa cài, tải từ: https://www.mongodb.com/try/download/community');
        console.error('   3. Hoặc dùng MongoDB Atlas (Cloud): https://www.mongodb.com/cloud/atlas');
        console.error('   4. Kiểm tra connection string trong file .env');
        console.error('\n   Hoặc chạy MongoDB local:');
        console.error('   - Windows: mongod.exe');
        console.error('   - Mac: brew services start mongodb-community');
        console.error('   - Linux: sudo systemctl start mongod\n');
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = connectDB;
