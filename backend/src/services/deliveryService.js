import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const deliveryService = {
  async claimDelivery(deliveryId, currentUser) {
    if (currentUser.role !== 'delivery_partner' && !currentUser.is_admin) {
      throw new AppError(403, 'Only authenticated Delivery Partners can claim a shipment.');
    }

    // 1. Fetch delivery
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single();

    if (error || !delivery) {
      throw new AppError(404, 'Delivery record not found.');
    }

    if (delivery.partner_id !== null) {
      throw new AppError(400, 'This delivery assignment has already been claimed.');
    }

    // 2. Claim delivery
    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update({
        partner_id: currentUser.id,
        status: 'picked_up',
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId)
      .select('*')
      .single();

    if (updateError) {
      throw new AppError(500, `Error claiming delivery: ${updateError.message}`);
    }

    // 3. Sync parent order status to Shipped
    await supabase
      .from('orders')
      .update({ status: 'Shipped' })
      .eq('id', delivery.order_id);

    return updatedDelivery;
  },

  async updateDeliveryStatus(deliveryId, status, currentUser) {
    // 1. Fetch delivery
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single();

    if (error || !delivery) {
      throw new AppError(404, 'Delivery record not found.');
    }

    // 2. Verify ownership
    if (delivery.partner_id !== currentUser.id && !currentUser.is_admin) {
      throw new AppError(403, 'You are not authorized to update this shipment.');
    }

    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'delivered') {
      updates.actual_delivery = new Date().toISOString();
    }

    // 3. Update delivery
    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', deliveryId)
      .select('*')
      .single();

    if (updateError) {
      throw new AppError(500, `Error updating delivery status: ${updateError.message}`);
    }

    // 4. Update parent order status to Delivered
    if (status === 'delivered') {
      await supabase
        .from('orders')
        .update({ status: 'Delivered' })
        .eq('id', delivery.order_id);
    }

    return updatedDelivery;
  }
};

export default deliveryService;
