import aiService from '../services/aiService.js';
import { AppError } from '../middleware/error.js';

export const aiController = {
  async chat(req, res, next) {
    try {
      const { message, history } = req.body;
      if (!message) {
        return next(new AppError(400, 'Message is required.'));
      }

      const result = await aiService.chatWithAssistant(message, history || []);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

export default aiController;
