import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import { OrderStatusSimulator } from './services/OrderStatusSimulator';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    const orderStatusSimulator = new OrderStatusSimulator();
    orderStatusSimulator.start();

    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server gracefully...');
      orderStatusSimulator.stop();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
