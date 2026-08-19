import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import styles from './page.module.css';

export default async function Menu({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  } else {
    // Default Everyday Treats filters
    query = query
      .eq('is_special_cake', false)
      .neq('category', 'Cakes')
      .neq('category', 'International Flavors')
      .neq('category', 'Ready to Go Cakes')
      .neq('category', 'Festive Cakes')
      .neq('category', 'Birthday Celebrations')
      .neq('category', 'Wedding & Anniversary')
      .neq('category', 'Fusion Cakes')
      .neq('category', 'Baby Shower & Kids');
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
          <Link href="/ready-to-go-cakes" className={styles.tab}>Ready to Go Cakes</Link>
          <Link href="/cakes" className={styles.tab}>Custom Cakes</Link>
          <Link href="/international-flavors" className={styles.tab}>International Flavors</Link>
          <Link href="/special-cakes" className={styles.tab}>Special Cakes</Link>
          <Link href="/custom-designs" className={styles.tab}>Signature Cake Designs</Link>
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
          {products && products.map((product) => {
            const cardImg = product.image_url || (product.name.toLowerCase().includes('cupcake') ? '/cupcakes.jpg' : (product.name.toLowerCase().includes('dry') ? '/dry-cakes.jpg' : null));

            return (
              <div key={product.id} className={`glass-panel ${styles.card}`}>
                <div className={styles.imagePlaceholder} style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                  {cardImg ? (
                    <img 
                      src={cardImg} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', inset: 0 }}
                    />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8c766b' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🧁</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{product.name}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <Link href={`/product/${product.id}`} className="btn-primary">
                    Customize
                  </Link>
                </div>
              </div>
            );
          })}
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
