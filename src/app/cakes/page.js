import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import styles from '../menu/page.module.css';

export default async function Cakes() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('category', 'Cakes')
    .order('price', { ascending: true });

  if (error) {
    console.error("Error fetching cakes:", error);
    return <div>Failed to load cakes. Please try again later.</div>;
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.menuContainer}`}>
        <h1 className={styles.title}>Custom Cakes</h1>
        <p className={styles.subtitle}>Our highly customizable cakes. Make it uniquely yours!</p>

        <div className={styles.tabs}>
          <Link href="/menu" className={styles.tab}>Everyday Treats</Link>
          <Link href="/cakes" className={styles.activeTab}>Custom Cakes</Link>
          <Link href="/special-cakes" className={styles.tab}>Special Cakes</Link>
        </div>

        <div className={styles.grid}>
          {products && products.map((product) => (
            <div key={product.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.imagePlaceholder}>
                 {/* Once you have real photos, an <img /> tag goes here */}
              </div>
              <div className={styles.cardContent}>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <Link href={`/product/${product.id}`} className="btn-primary" style={{ background: 'var(--rose)', borderColor: 'var(--rose)' }}>
                  View Options
                </Link>
              </div>
            </div>
          ))}
          {(!products || products.length === 0) && <p>No custom cakes available right now. Please check back later!</p>}
        </div>
      </div>
    </main>
  );
}
