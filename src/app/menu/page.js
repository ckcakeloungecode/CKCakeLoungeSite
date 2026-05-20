import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import styles from './page.module.css';

export default async function Menu({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('is_special_cake', false)
    .neq('category', 'Cakes')
    .neq('category', 'International Flavors');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Failed to load menu. Please try again later.</div>;
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.menuContainer}`}>
        <h1 className={styles.title}>Our Menu</h1>
        <p className={styles.subtitle}>Select an item below to customize your order.</p>

        <div className={styles.tabs}>
          <Link href="/menu" className={styles.activeTab}>Everyday Treats</Link>
          <Link href="/cakes" className={styles.tab}>Custom Cakes</Link>
          <Link href="/special-cakes" className={styles.tab}>Special Cakes</Link>
          <Link href="/international-flavors" className={styles.tab}>International Flavors</Link>
        </div>

        {search && (
          <div style={{ marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
            <p style={{ color: '#66554d', fontSize: '1.1rem' }}>
              Showing results for "<strong>{search}</strong>"
            </p>
            <Link href="/menu" style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.95rem' }}>
              Clear Search
            </Link>
          </div>
        )}

        <div className={styles.grid}>
          {products && products.map((product) => (
            <div key={product.id} className={`glass-panel ${styles.card}`}>
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
          {(!products || products.length === 0) && (
            <div style={{ textAlign: 'center', width: '100%', padding: '3rem 0', gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '1.1rem', color: '#66554d', marginBottom: '1rem' }}>No products found matching your search.</p>
              <Link href="/menu" className="btn-primary">View All Menu Items</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
