import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import RotatingCardImage from '../../components/RotatingCardImage';
import styles from '../menu/page.module.css';

export default async function ReadyToGoCakes({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .eq('category', 'Ready to Go Cakes');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Order alphabetically or by price
  const { data: products, error } = await query.order('name', { ascending: true });

  if (error) {
    console.error("Error fetching Ready to Go Cakes:", error);
    return <div>Failed to load cakes. Please try again later.</div>;
  }

  return (
    <main className={styles.main}>
      <div className={`container ${styles.menuContainer}`}>
        <h1 className={styles.title}>Ready to Go Cakes</h1>
        <p className={styles.subtitle}>Freshly baked and flavored cakes, ready for your celebration!</p>

        <div className={styles.tabs}>
          <Link href="/menu" className={styles.tab}>Everyday Treats</Link>
          <Link href="/ready-to-go-cakes" className={styles.activeTab}>Ready to Go Cakes</Link>
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
            <Link href="/ready-to-go-cakes" style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.95rem' }}>
              Clear Search
            </Link>
          </div>
        )}

        <div className={styles.grid}>
          {products && products.map((product) => {
            const nameLower = (product.name || '').toLowerCase();
            const isDessertCups = nameLower.includes('cup') || nameLower.includes('desert') || nameLower.includes('dessert');
            const dessertCupImages = ['/dessert-cake-cups-1.jpg', '/dessert-cake-cups-2.jpg', '/dessert-cake-cups-3.jpg'];
            const cardImg = product.image_url || ((nameLower.includes('jamun') || nameLower.includes('gulab')) ? '/gulab-jamun-cake.jpg' : (nameLower.includes('mango') ? '/mango-cake.jpg' : ((nameLower.includes('ras') || nameLower.includes('rasmalai')) ? '/rasmalai-cake.jpg' : ((nameLower.includes('tiramisu') || nameLower.includes('tiramissu')) ? '/tiramisu-cake.jpg' : ((nameLower.includes('mix fruit') || nameLower.includes('fruit')) ? '/mix-fruit-cake.jpg' : ((nameLower.includes('truffle') || nameLower.includes('dark chocolate')) ? '/dark-chocolate-truffle.jpg' : (nameLower.includes('coconut') ? '/coconut-cake.jpg' : (nameLower.includes('pineapple') ? '/tropical-pineapple-cake.jpg' : (nameLower.includes('velvety') ? '/velvety-chocolate-cake.jpg' : (nameLower.includes('vanilla') ? '/classic-vanilla-cake.jpg' : ((nameLower.includes('blue berry') || nameLower.includes('blueberry')) ? '/blueberry-cake.jpg' : ((nameLower.includes('biscoff') || nameLower.includes('lotus')) ? '/lotus-biscoff-cake.jpg' : ((nameLower.includes('strawberry')) ? '/garden-strawberry-cake.jpg' : ((nameLower.includes('caramel')) ? '/caramel-cake.jpg' : (nameLower.includes('pistachio') ? '/pistachio-cake.jpg' : (isDessertCups ? '/dessert-cake-cups-1.jpg' : null))))))))))))))));

            return (
              <div key={product.id} className={`glass-panel ${styles.card}`}>
                <div className={styles.imagePlaceholder} style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                  {isDessertCups ? (
                    <RotatingCardImage
                      images={dessertCupImages}
                      alt={product.name}
                      intervalMs={3500}
                    />
                  ) : cardImg ? (
                    <img 
                      src={cardImg} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', inset: 0 }}
                    />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8c766b' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎂</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{product.name}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <Link href={`/product/${product.id}`} className="btn-primary" style={{ background: 'var(--rose)', borderColor: 'var(--rose)' }}>
                    View Sizes & Prices
                  </Link>
                </div>
              </div>
            );
          })}
          {(!products || products.length === 0) && (
            <div style={{ textAlign: 'center', width: '100%', padding: '3rem 0', gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '1.1rem', color: '#66554d', marginBottom: '1rem' }}>No ready-to-go cakes found matching your search.</p>
              <Link href="/ready-to-go-cakes" className="btn-primary">View All Ready to Go Cakes</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
