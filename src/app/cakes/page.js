import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import styles from '../menu/page.module.css';

export default async function Cakes({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('category', 'Cakes');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data: products, error } = await query.order('price', { ascending: true });

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
          <Link href="/ready-to-go-cakes" className={styles.tab}>Ready to Go Cakes</Link>
          <Link href="/cakes" className={styles.activeTab}>Custom Cakes</Link>
          <Link href="/international-flavors" className={styles.tab}>International Flavors</Link>
          <Link href="/special-cakes" className={styles.tab}>Special Cakes</Link>
          <Link href="/custom-designs" className={styles.tab}>Custom Designs Gallery</Link>
        </div>

        {/* Premium Marketing Callout Banner for Custom Reference Photos */}
        <div style={{
          width: '100%',
          maxWidth: '850px',
          margin: '0 auto 3rem auto',
          padding: '1.75rem 2rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(253,246,242,0.96) 100%)',
          border: '1.5px dashed var(--accent)',
          boxShadow: '0 10px 30px rgba(89, 53, 46, 0.08)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>✨ 📸 🎨</div>
          <h3 style={{ 
            fontFamily: 'var(--font-playfair)', 
            fontSize: '1.45rem', 
            color: 'var(--primary)', 
            marginBottom: '0.5rem',
            fontWeight: '700'
          }}>
            Have a Specific Dream Design in Mind?
          </h3>
          <p style={{ 
            color: '#6e5c54', 
            fontSize: '1rem', 
            lineHeight: '1.6', 
            margin: '0 auto',
            maxWidth: '680px'
          }}>
            Bring your vision to life! Simply select your preferred cake size below to customize your flavor and upload your reference photo, Pinterest inspiration, or custom sketch directly.
          </p>
        </div>

        {search && (
          <div style={{ marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
            <p style={{ color: '#66554d', fontSize: '1.1rem' }}>
              Showing results for "<strong>{search}</strong>"
            </p>
            <Link href="/cakes" style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.95rem' }}>
              Clear Search
            </Link>
          </div>
        )}

        <div className={styles.grid}>
          {products && products.map((product) => {
            const lowerName = (product.name || '').toLowerCase();
            const match = lowerName.match(/(\d+(\.\d+)?)/);
            const num = match ? parseFloat(match[1]) : null;
            const isTiered = lowerName.includes('6 lb') || lowerName.includes('7 lb') || lowerName.includes('6lb') || lowerName.includes('7lb') || lowerName.includes('tier') || (num && num >= 6);
            const cardImg = product.image_url || (isTiered ? '/custom-cake-tiered.jpg' : '/custom-cake-single.jpg');

            return (
              <div key={product.id} className={`glass-panel ${styles.card}`}>
                <div className={styles.imagePlaceholder}>
                  <img 
                    src={cardImg} 
                    alt={product.name} 
                  />
                </div>
                <div className={styles.cardContent}>
                  <span style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', background: 'var(--rose-light)', border: '1px solid var(--accent-light)', padding: '3px 10px', borderRadius: '12px', marginBottom: '0.5rem' }}>
                    📷 Reference Photo Upload Allowed
                  </span>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <Link href={`/product/${product.id}`} className="btn-primary" style={{ background: 'var(--rose)', borderColor: 'var(--rose)' }}>
                    Starts at ${product.price}
                  </Link>
                </div>
              </div>
            );
          })}
          {(!products || products.length === 0) && (
            <div style={{ textAlign: 'center', width: '100%', padding: '3rem 0', gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '1.1rem', color: '#66554d', marginBottom: '1rem' }}>No custom cakes found matching your search.</p>
              <Link href="/cakes" className="btn-primary">View All Custom Cakes</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
