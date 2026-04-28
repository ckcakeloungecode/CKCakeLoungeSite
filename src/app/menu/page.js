import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import styles from './page.module.css';

// This is a Server Component, so it securely fetches data before sending to the browser
export default async function Menu() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true);

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Failed to load menu. Please try again later.</div>;
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.menuContainer}`}>
        <h1 className={styles.title}>Our Menu</h1>
        <p className={styles.subtitle}>Select an item below to customize your order.</p>

        <div className={styles.grid}>
          {products && products.map((product) => (
            <div key={product.id} className={`glass-panel ${styles.card}`}>
              {/* Placeholder for images, currently we use a sleek gradient box */}
              <div className={styles.imagePlaceholder}>
                 {/* Once you have real photos, an <img /> tag goes here */}
              </div>
              <div className={styles.cardContent}>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <Link href={`/product/${product.id}`} className="btn-primary">
                  Customize
                </Link>
              </div>
            </div>
          ))}
          {products.length === 0 && <p>No products available right now.</p>}
        </div>
      </div>
    </main>
  );
}
