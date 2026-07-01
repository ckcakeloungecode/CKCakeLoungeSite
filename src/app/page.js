import Link from 'next/link';
import Image from 'next/image';
import PromoCarousel from '../components/PromoCarousel';
import FruitSlider from '../components/FruitSlider';
import { supabase } from '../utils/supabaseClient';
import styles from './page.module.css';

export default async function Home() {
  // Fetch specific cakes for the India Sweets showcase
  const targetNames = ['Gulab Jamun', 'Metha paan', 'Pistachio', 'Rasmalai bliss'];
  let products = [];
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('name', targetNames)
      .eq('category', 'Ready to Go Cakes');
      
    if (!error && data) {
      // Sort to match requested order exactly: Gulab Jamun, Metha paan, Pistachio, Rasmalai bliss
      const orderMap = {
        'Gulab Jamun': 1,
        'Metha paan': 2,
        'Pistachio': 3,
        'Rasmalai bliss': 4
      };
      products = [...data].sort((a, b) => (orderMap[a.name] || 99) - (orderMap[b.name] || 99));
    }
  } catch (err) {
    console.error("Failed to load signature cakes from DB:", err);
  }

  // Fetch specific cakes for the Fruit Delight showcase
  const fruitNames = ['Mango', 'Tropical pineapple', 'Garden Strawberry', 'Blue berry', 'Mix fruit'];
  let fruitProducts = [];
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('name', fruitNames)
      .eq('category', 'Ready to Go Cakes');
      
    if (!error && data) {
      // Sort to match requested order exactly: Mango, Tropical pineapple, Garden Strawberry, Blue berry, Mix fruit
      const orderMap = {
        'Mango': 1,
        'Tropical pineapple': 2,
        'Garden Strawberry': 3,
        'Blue berry': 4,
        'Mix fruit': 5
      };
      fruitProducts = [...data].sort((a, b) => (orderMap[a.name] || 99) - (orderMap[b.name] || 99));
    }
  } catch (err) {
    console.error("Failed to load fruit cakes from DB:", err);
  }

  // Fetch specific cakes for the International Flavors showcase
  let intlProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'International Flavors')
      .eq('is_available', true);
      
    if (!error && data) {
      // Sort to match requested order or alphabetical: Tiramissu, Cheese Cake, Mousse Cake
      const orderMap = {
        'Tiramissu': 1,
        'Cheese Cake': 2,
        'Mousse Cake': 3
      };
      intlProducts = [...data].sort((a, b) => (orderMap[a.name] || 99) - (orderMap[b.name] || 99));
    }
  } catch (err) {
    console.error("Failed to load international flavors from DB:", err);
  }

  // Fetch specific cakes for the Special Cakes showcase
  let specialProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_special_cake', true)
      .eq('is_available', true);
      
    if (!error && data) {
      const orderMap = {
        'Piñata Cake': 1,
        'Doll Cake': 2
      };
      specialProducts = [...data].sort((a, b) => (orderMap[a.name] || 99) - (orderMap[b.name] || 99));
    }
  } catch (err) {
    console.error("Failed to load special cakes from DB:", err);
  }

  // Fallbacks in case DB isn't seeded or query fails
  if (!products || products.length === 0) {
    products = [
      { id: 'fallback-gulab', name: 'Gulab Jamun', description: 'A luscious cardamom-spiced cake layers embedded with soft, sugar-soaked gulab jamun pieces and decorated with roasted pistachios.', price: 40, isFallback: true },
      { id: 'fallback-paan', name: 'Metha paan', description: 'An exotic refreshing cake infused with real betel leaf extract, sweet gulkand (rose petal jam), and aromatic fennel seeds.', price: 40, isFallback: true },
      { id: 'fallback-pistachio', name: 'Pistachio', description: 'Rich roasted pistachio cake layers finished with silky pistachio cream and white chocolate shavings.', price: 40, isFallback: true },
      { id: 'fallback-rasmalai', name: 'Rasmalai bliss', description: 'Our crowd favorite signature cake soaked in rich saffron milk (rabri) and decorated with almonds, pistachios, and rose petals.', price: 45, isFallback: true }
    ];
  }

  if (!fruitProducts || fruitProducts.length === 0) {
    fruitProducts = [
      { id: 'fallback-mango', name: 'Mango', description: 'Fresh, succulent mango pieces layered with moist vanilla sponge cake and light cream.', price: 35, isFallback: true },
      { id: 'fallback-pineapple', name: 'Tropical pineapple', description: 'Classic tropical recipe with crushed sweet pineapple layered with soft cake and fluffy whipped cream.', price: 35, isFallback: true },
      { id: 'fallback-strawberry', name: 'Garden Strawberry', description: 'Bursting with fresh farm-picked strawberries and sweet whipped cream layers.', price: 40, isFallback: true },
      { id: 'fallback-blueberry', name: 'Blue berry', description: 'Sweet, tangy wild blueberries layered between rich cream and moist sponge cake.', price: 40, isFallback: true },
      { id: 'fallback-mixfruit', name: 'Mix fruit', description: 'An elegant vanilla cake packed with a fresh medley of seasonal fruits and berries.', price: 40, isFallback: true }
    ];
  }

  if (!intlProducts || intlProducts.length === 0) {
    intlProducts = [
      { id: 'fallback-tiramisu', name: 'Tiramissu', description: 'A classic Italian dessert made with espresso-soaked ladyfingers and rich mascarpone cream.', price: 39.99, isFallback: true },
      { id: 'fallback-cheesecake', name: 'Cheese Cake', description: 'Rich, creamy, and decadent cheese cakes in a variety of premium flavors.', price: 24.99, isFallback: true },
      { id: 'fallback-moussecake', name: 'Mousse Cake', description: 'Light, airy, and beautifully layered mousse cakes.', price: 19.99, isFallback: true }
    ];
  }

  if (!specialProducts || specialProducts.length === 0) {
    specialProducts = [
      { id: 'fallback-pinata', name: 'Piñata Cake', description: 'A fun, smashable Pinata Cake filled with delicious surprises!', price: 120, isFallback: true },
      { id: 'fallback-doll', name: 'Doll Cake', description: 'A beautifully custom-designed Doll Cake for your special occasion.', price: 110, isFallback: true }
    ];
  }

  return (
    <main className={styles.main}>
      {/* Premium background decorative shapes */}
      <div className={styles.backgroundBlob1}></div>
      <div className={styles.backgroundBlob2}></div>

      {/* Hero Section */}
      <section className={`container ${styles.heroSection}`}>
        <div className={styles.heroGrid}>
          {/* Left Column: Copy & Actions */}
          <div className={`animate-in ${styles.heroContent}`}>
            <span className={styles.heroBadge}>EST. 2024 • LONDON ON</span>
            <h1 className={styles.heroTitle}>
              Artisan Pastries <br />
              & Custom <span>Celebration Cakes</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Welcome to CK Cake Lounge. We blend exquisite natural ingredients, refined baking techniques, 
              and bespoke hand-detailed designs to create unforgettable desserts for life's sweetest milestones.
            </p>
            <div className={styles.buttonGroup}>
              <Link href="/menu" className="btn-primary">
                View Menu
              </Link>
              <Link href="/cakes" className={styles.btnSecondary}>
                Order Custom Cake
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className={`animate-in ${styles.heroVisual}`}>
            <div className={styles.imageFrameOuter}>
              <div className={styles.imageFrame}>
                <Image 
                  src="/hero_cake.png" 
                  alt="Signature Luxury Wedding and Celebration Cake" 
                  width={500} 
                  height={600}
                  className={styles.heroImage}
                  priority
                />
                <div className={styles.imageOverlay}></div>
              </div>
              {/* Gold Accent Corner highlights */}
              <div className={`${styles.cornerBorder} ${styles.topRight}`}></div>
              <div className={`${styles.cornerBorder} ${styles.bottomLeft}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Allergen & Dietary Trust Grid - Rashmi's Bakery Inspired */}
      <section className={`container ${styles.trustSection}`}>
        <div className={styles.trustGrid}>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🥚</span>
            <h4>100% Eggless Facility</h4>
            <p>Your safety is our absolute priority. We operate a strictly eggless facility with rigorous cross-contamination protocols. Parents and schools trust us for allergy-safe treats that never compromise on safety.</p>
          </div>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🌿</span>
            <h4>Inclusive Options</h4>
            <p>We want everyone to join the celebration. We have designed exquisite Vegan and Gluten-Free recipes that capture the rich, moist texture and decadent taste of traditional recipes.</p>
          </div>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🌾</span>
            <h4>Premium Ingredients</h4>
            <p>We bake exclusively with natural, high-quality ingredients. From organic unbleached flours and farm-fresh dairy to premium Madagascar vanilla and rich Belgian cocoa, quality guides every selection.</p>
          </div>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🎂</span>
            <h4>Bespoke Customization</h4>
            <p>No catalog limit. Our custom quote pipeline lets you share reference images, sketch ideas, and specify shapes, sizes, and dietary configurations to construct your perfect celebration piece.</p>
          </div>
        </div>
      </section>

      {/* Dynamic Promotion Carousel Widget */}
      <section className="container">
        <PromoCarousel />
      </section>

      {/* Signature India Sweets Cakes Showcase */}
      <section className={`container ${styles.showcaseSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Signature India Sweets Cakes</h2>
          <p className={styles.sectionSubtitle}>Indulge in our exquisite fusion of traditional Indian dessert flavors and premium cake layers</p>
        </div>

        <div className={styles.productGrid}>
          {products.map((product) => {
            // Determine emoji based on name
            let emoji = '🍰';
            const nameLower = product.name.toLowerCase();
            if (nameLower.includes('jamun')) emoji = '🍯';
            else if (nameLower.includes('paan')) emoji = '🍃';
            else if (nameLower.includes('pistachio')) emoji = '💚';
            else if (nameLower.includes('rasmalai')) emoji = '🥛';

            // Check if fallback URL is needed
            const productUrl = product.isFallback 
              ? '/ready-to-go-cakes' 
              : `/product/${product.id}`;

            return (
              <div key={product.id} className={`glass-panel ${styles.productCard}`}>
                <div className={`${styles.imagePlaceholder} ${styles[nameLower.replace(/\s+/g, '')]}`}>
                  <span className={styles.placeholderEmoji}>{emoji}</span>
                  <span className={styles.placeholderText}>Photo Coming Soon</span>
                </div>
                <div className={styles.productCardContent}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Starts from</span>
                    <span className={styles.priceValue}>${product.price.toFixed(2)}</span>
                  </div>
                  <Link href={productUrl} className="btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                    View Sizes & Prices
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Special Cakes Showcase */}
      <section className={`container ${styles.showcaseSection}`} style={{ paddingTop: '0' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Special Cakes</h2>
          <p className={styles.sectionSubtitle}>Custom, tiered, and spectacular cakes for your most important events</p>
        </div>

        <div className={styles.productGridCentered}>
          {specialProducts.map((product) => {
            // Determine emoji based on name
            let emoji = '🎂';
            const nameLower = product.name.toLowerCase();
            if (nameLower.includes('piñata') || nameLower.includes('pinata')) emoji = '🪅';
            else if (nameLower.includes('doll')) emoji = '👗';

            const productUrl = product.isFallback 
              ? '/special-cakes' 
              : `/product/${product.id}`;

            return (
              <div key={product.id} className={`glass-panel ${styles.productCard}`}>
                <div className={`${styles.imagePlaceholder} ${styles[nameLower.replace(/\s+/g, '').replace(/ñ/g, 'n')]}`}>
                  <span className={styles.placeholderEmoji}>{emoji}</span>
                  <span className={styles.placeholderText}>Photo Coming Soon</span>
                </div>
                <div className={styles.productCardContent}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Starts from</span>
                    <span className={styles.priceValue}>${product.price.toFixed(2)}</span>
                  </div>
                  <Link href={productUrl} className="btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                    View Sizes & Prices
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fruit Delight Showcase */}
      <section className={`container ${styles.showcaseSection}`} style={{ paddingTop: '0' }}>
        <div className={styles.sectionHeader} style={{ position: 'relative' }}>
          <h2 className={styles.sectionTitle}>Fruit Delight</h2>
          <p className={styles.sectionSubtitle}>Savor our selection of light, refreshing fruit-themed cakes crafted with premium ingredients</p>
        </div>

        <FruitSlider products={fruitProducts} />
      </section>

      {/* International Flavors Showcase */}
      <section className={`container ${styles.showcaseSection}`} style={{ paddingTop: '0' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>International Flavors</h2>
          <p className={styles.sectionSubtitle}>Discover our range of sophisticated, globally inspired dessert delicacies</p>
        </div>

        <div className={styles.productGridCentered}>
          {intlProducts.map((product) => {
            // Determine emoji based on name
            let emoji = '🍰';
            const nameLower = product.name.toLowerCase();
            if (nameLower.includes('tiramisu') || nameLower.includes('tiramissu')) emoji = '☕';
            else if (nameLower.includes('cheese')) emoji = '🧀';
            else if (nameLower.includes('mousse')) emoji = '🍫';

            const productUrl = product.isFallback 
              ? '/international-flavors' 
              : `/product/${product.id}`;

            return (
              <div key={product.id} className={`glass-panel ${styles.productCard}`}>
                <div className={`${styles.imagePlaceholder} ${styles[nameLower.replace(/\s+/g, '')]}`}>
                  <span className={styles.placeholderEmoji}>{emoji}</span>
                  <span className={styles.placeholderText}>Photo Coming Soon</span>
                </div>
                <div className={styles.productCardContent}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Starts from</span>
                    <span className={styles.priceValue}>${product.price.toFixed(2)}</span>
                  </div>
                  <Link href={productUrl} className="btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                    View Sizes & Prices
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Circular Shop by Category bubbles row */}
      <section className={`container ${styles.bubblesSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionSubtitle}>Quickly browse our collections to find your perfect treat</p>
        </div>
        <div className={styles.bubblesRow}>
          <Link href="/menu" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🥐</div>
            <span className={styles.bubbleLabel}>Everyday Treats</span>
          </Link>
          <Link href="/ready-to-go-cakes" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🍰</div>
            <span className={styles.bubbleLabel}>Ready to Go</span>
          </Link>
          <Link href="/cakes" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🎂</div>
            <span className={styles.bubbleLabel}>Custom Cakes</span>
          </Link>
          <Link href="/international-flavors" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🌎</div>
            <span className={styles.bubbleLabel}>International</span>
          </Link>
          <Link href="/special-cakes" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>✨</div>
            <span className={styles.bubbleLabel}>Special Cakes</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
