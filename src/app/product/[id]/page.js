import { supabase } from '../../../utils/supabaseClient';
import ProductSelector from './ProductSelector';
import styles from './page.module.css';
import Link from 'next/link';

export default async function ProductPage({ params }) {
  // Await params first to satisfy Next.js 15+ constraints if any, or just use it.
  // Next 13+ params is a promise in newer versions, but we can treat it as object if Next < 15.
  // We'll safely await it just in case.
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // 1. Fetch the main product info
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return (
      <div className={styles.main}>
        <div className="container">
          <h2>Product Not Found</h2>
          <Link href="/menu" className="btn-primary">Return to Menu</Link>
        </div>
      </div>
    );
  }

  // 2. Fetch all pricing variants for this specific product
  const { data: variants, error: variantError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);

  // Note: variantError might be null even if array is empty, which is fine.
  
  return (
    <main className={styles.main}>
      <div className={`container ${styles.productContainer}`}>
        <Link href="/menu" className={styles.backLink}>&larr; Back to Menu</Link>
        
        <div className={`glass-panel ${styles.productLayout}`}>
          {/* We pass the fetched variants to a Client Component which now manages both the image and the dropdowns */}
          <ProductSelector product={product} variants={variants || []} />
        </div>
      </div>
    </main>
  );
}
