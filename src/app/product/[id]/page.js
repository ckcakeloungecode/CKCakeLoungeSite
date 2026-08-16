import { supabase } from '../../../utils/supabaseClient';
import ProductSelector from './ProductSelector';
import styles from './page.module.css';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CUSTOM_DESIGNS } from '../../../utils/customDesignsData';

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // Check if this is a custom design ID and redirect to custom design detail view
  const customDesignMatch = CUSTOM_DESIGNS.find(d => d.id === productId || d.id === `design-${productId}`);
  if (customDesignMatch) {
    redirect(`/custom-designs/${customDesignMatch.id}`);
  }

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
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);

  return (
    <main className={styles.main}>
      <div className={`container ${styles.productContainer}`}>
        <Link href="/menu" className={styles.backLink}>&larr; Back to Menu</Link>
        
        <div className={`glass-panel ${styles.productLayout}`}>
          <ProductSelector product={product} variants={variants || []} />
        </div>
      </div>
    </main>
  );
}
