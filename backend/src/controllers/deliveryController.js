import deliveryService from '../services/deliveryService.js';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const deliveryController = {
  async getUnassignedShipments(req, res, next) {
    try {
      const { data: deliveries, error } = await supabase
        .from('deliveries')
        .select('*, order:orders(*)')
        .eq('status', 'assigned')
        .is('partner_id', null);

      if (error) {
        return next(new AppError(500, `Error fetching unassigned deliveries: ${error.message}`));
      }

      res.status(200).json(deliveries || []);
    } catch (error) {
      next(error);
    }
  },

  async getClaimedShipments(req, res, next) {
    try {
      const { data: deliveries, error } = await supabase
        .from('deliveries')
        .select('*, order:orders(*)')
        .eq('partner_id', req.user.id);

      if (error) {
        return next(new AppError(500, `Error fetching claimed deliveries: ${error.message}`));
      }

      res.status(200).json(deliveries || []);
    } catch (error) {
      next(error);
    }
  },

  async claimShipment(req, res, next) {
    try {
      const { delivery_id } = req.params;
      const delivery = await deliveryService.claimDelivery(delivery_id, req.user);
      res.status(200).json(delivery);
    } catch (error) {
      next(error);
    }
  },

  async updateShipmentStatus(req, res, next) {
    try {
      const { delivery_id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next(new AppError(400, 'Status field is required.'));
      }

      const delivery = await deliveryService.updateDeliveryStatus(delivery_id, status, req.user);
      res.status(200).json(delivery);
    } catch (error) {
      next(error);
    }
  }
};

export default deliveryController;
