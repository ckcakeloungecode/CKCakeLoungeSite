import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../utils/supabaseAdmin';

export async function GET(req) {
  try {
    // Basic Security: Check search param token or Authorization header
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'ck_lounge_janitor_secret';

    if (
      token !== expectedSecret &&
      authHeader !== `Bearer ${expectedSecret}`
    ) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token or secret.' }, { status: 401 });
    }

    // Favorable cleanup timeframe: 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Find all orders/quotes whose delivery date is older than 90 days
    const { data: oldOrders, error: fetchError } = await supabaseAdmin
      .from('store_orders')
      .select('id, cart_items')
      .lte('delivery_date', cutoffStr);

    if (fetchError) {
      console.error('Error fetching old orders for cleanup:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!oldOrders || oldOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No old orders to clean up.',
        deletedOrdersCount: 0,
        deletedPhotosCount: 0
      }, { status: 200 });
    }

    // 2. Extract reference photo filenames to delete from storage
    const fileNames = [];
    oldOrders.forEach(order => {
      if (Array.isArray(order.cart_items)) {
        order.cart_items.forEach(item => {
          if (item.photoUrl) {
            // E.g. URL: .../storage/v1/object/public/cake_photos/filename.png
            const parts = item.photoUrl.split('/cake_photos/');
            if (parts.length > 1) {
              const fileName = parts[1];
              if (fileName) {
                fileNames.push(fileName);
              }
            }
          }
        });
      }
    });

    // 3. Delete files from Supabase Storage
    let deletedPhotosCount = 0;
    if (fileNames.length > 0) {
      const { data: removedFiles, error: storageError } = await supabaseAdmin.storage
        .from('cake_photos')
        .remove(fileNames);

      if (storageError) {
        console.error('Error removing old cake photos from storage:', storageError);
      } else {
        deletedPhotosCount = removedFiles ? removedFiles.length : fileNames.length;
      }
    }

    // 4. Delete the orders/quotes from Supabase DB
    const orderIds = oldOrders.map(o => o.id);
    const { error: deleteError } = await supabaseAdmin
      .from('store_orders')
      .delete()
      .in('id', orderIds);

    if (deleteError) {
      console.error('Error deleting old orders from database:', deleteError);
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup job completed successfully.',
      deletedOrdersCount: oldOrders.length,
      deletedPhotosCount,
      cutoffDate: cutoffStr
    }, { status: 200 });

  } catch (error) {
    console.error('Cleanup Cron Route Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
