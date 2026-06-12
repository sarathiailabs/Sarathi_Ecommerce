import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const orderService = {
  async placeOrder(checkoutData, currentUser) {
    const orderId = uuidv4();
    const deliveryId = uuidv4();
    const trackingNumber = `TRK-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

    // Call Postgres RPC for atomic checkout
    const { data: orderData, error: rpcError } = await supabase.rpc('place_order', {
      p_order_id: orderId,
      p_delivery_id: deliveryId,
      p_user_id: currentUser.id,
      p_shipping_address: checkoutData.shipping_address,
      p_phone: checkoutData.phone,
      p_full_name: checkoutData.full_name,
      p_payment_method: checkoutData.payment_method || 'card',
      p_tracking_number: trackingNumber
    });

    if (rpcError) {
      throw new AppError(400, rpcError.message);
    }

    // Eager load relationships for API serialization compatibility
    const { data: finalOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', orderId)
      .single();

    if (fetchError || !finalOrder) {
      throw new AppError(500, `Error loading placed order details: ${fetchError?.message}`);
    }

    return finalOrder;
  },

  async cancelOrder(orderId, currentUser) {
    // 1. Fetch order with items
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new AppError(404, 'Order not found');
    }

    // 2. Validate ownership/role
    if (!currentUser.is_admin && order.user_id !== currentUser.id) {
      throw new AppError(403, 'You are not authorized to cancel this order');
    }

    // 3. Validate cancellable status
    const cancellableStatuses = ['Pending', 'Processing'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new AppError(400, `Cannot cancel an order with status '${order.status}'. Only orders in ${cancellableStatuses.join(', ')} can be cancelled.`);
    }

    // 4. Restore product stocks
    for (const item of order.items) {
      if (item.product_id) {
        // Fetch current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    // 5. Update order status to Cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', orderId)
      .select('*, items:order_items(*, product:products(*))')
      .single();

    if (updateError) {
      throw new AppError(500, `Error updating order status: ${updateError.message}`);
    }

    return updatedOrder;
  }
};

export default orderService;
