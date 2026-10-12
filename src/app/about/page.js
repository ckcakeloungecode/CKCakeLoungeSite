import styles from './page.module.css';
import { ShieldCheckIcon, CakeSelectionIcon, LeafIngredientsIcon, PaletteCustomIcon } from '../../components/TrustIcons';

export const metadata = {
  title: "About Us | CK Cake Lounge",
  description: "Learn more about CK Cake Lounge, our eggless facility, dietary offerings, and our commitment to artisan craftsmanship.",
};

export default function AboutPage() {
  return (
    <main className={styles.aboutContainer}>
      {/* Title Section */}
      <section className={styles.titleSection}>
        <h1 className={styles.title}>About CK Cake Lounge</h1>
        <p className={styles.subtitle}>
          Blending organic local ingredients, refined French baking techniques, and bespoke details to celebrate your sweetest milestones.
        </p>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={`glass-panel ${styles.storyCard}`}>
          <div className={styles.storyContent}>
            <h2>Crafting Sweet Memories Since 2024</h2>
            <div className={styles.storyText}>
              <p>
                CK Cake Lounge was founded with a single, clear vision: to elevate dessert culture by crafting cakes and pastries that are as breathtakingly beautiful as they are delicious. Located in the heart of London, Ontario, we have grown from a boutique pastry kitchen into a cherished destination for local celebrations.
              </p>
              <p>
                We believe that every cake tells a story. Whether it is a whimsical birthday smash cake, a grand tiered wedding centerpiece, or a delicate everyday pastry box, we invest the same level of care, artistry, and culinary excellence into every batch we bake.
              </p>
              <p>
                Every flower, gold leaf accent, and chocolate shard is hand-placed by our expert bakers. We pride ourselves on creating bespoke designs tailored strictly to your individual aesthetic and flavor preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Commitments Grid */}
      <section className={styles.commitmentsSection}>
        <h2>Our Core Commitments</h2>
        <div className={styles.commitmentsGrid}>
          
          <div className={`glass-panel ${styles.commitmentCard}`}>
            <div className={styles.iconBadge}>
              <ShieldCheckIcon size={28} />
            </div>
            <h3>100% Eggless Facility</h3>
            <p>
              Baking 100% eggless is at the heart of our kitchen. We maintain a strictly egg-free bakehouse with dedicated care, so families, parents, and schools can celebrate with complete peace of mind.
            </p>
          </div>

          <div className={`glass-panel ${styles.commitmentCard}`}>
            <div className={styles.iconBadge}>
              <CakeSelectionIcon size={28} />
            </div>
            <h3>Wide Selection of Products</h3>
            <p>
              From ready-to-go daily favorites and rich cheesecakes to exotic Indian sweets fusions and tea-time dry cakes, there is always a fresh confection waiting to make your celebration special.
            </p>
          </div>

          <div className={`glass-panel ${styles.commitmentCard}`}>
            <div className={styles.iconBadge}>
              <LeafIngredientsIcon size={28} />
            </div>
            <h3>Premium Ingredients</h3>
            <p>
              We believe great baking starts with honest ingredients. Farm-fresh dairy, slow-roasted nuts, velvety cocoa, and real fruit compotes — every batch is prepared fresh with nothing artificial.
            </p>
          </div>

          <div className={`glass-panel ${styles.commitmentCard}`}>
            <div className={styles.iconBadge}>
              <PaletteCustomIcon size={28} />
            </div>
            <h3>Bespoke Customization</h3>
            <p>
              Have a dream design in mind? Share your Pinterest pins, sketches, or event colors with us. We hand-craft custom multi-tier tiers, personalized toppers, and unique flavor pairings just for you.
            </p>
          </div>

        </div>
      </section>

      {/* Visit Us Section */}
      <section className={styles.visitSection}>
        <div className={`glass-panel ${styles.visitCard}`}>
          <h2>Visit Our Lounge</h2>
          <p>We invite you to drop by, explore our daily selection of fresh treats, and chat with our head designer about your upcoming events.</p>
          
          <div className={styles.detailsGrid}>
            <div className={styles.detailCol}>
              <h4>📍 Address</h4>
              <p>
                CK Cake Lounge<br />
                Evans Blvd, London, ON N6M 0A8, Canada
              </p>
            </div>
            <div className={styles.detailCol}>
              <h4>⏰ Operating Hours</h4>
              <p>
                Open Daily: 9:00 AM - 6:00 PM<br />
                Pickup scheduling available at checkout
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
