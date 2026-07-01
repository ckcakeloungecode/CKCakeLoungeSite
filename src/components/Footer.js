import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerGrid}>
          {/* Brand/About Section */}
          <div className={styles.footerCol}>
            <div className={styles.logoContainer}>
              <span className={styles.logoEmoji}>🍰</span>
              <span className={styles.logoText}>CK Cake Lounge</span>
            </div>
            <p className={styles.tagline}>
              Crafting premium eggless delicacies and bespoke custom cakes that make your special moments unforgettable.
            </p>
            <div className={styles.hoursBox}>
              <span className={styles.hoursTitle}>⏰ Hours of Operation:</span>
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p>Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className={styles.footerCol}>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.linksList}>
              <li><Link href="/menu">Full Menu</Link></li>
              <li><Link href="/ready-to-go-cakes">Ready to Go Cakes</Link></li>
              <li><Link href="/special-cakes">Special Cakes</Link></li>
              <li><Link href="/international-flavors">International Flavors</Link></li>
              <li><Link href="/custom-quote">Custom Cake Quote</Link></li>
              <li><Link href="/special-events">Special Events</Link></li>
              <li><Link href="/about">About Our Bakery</Link></li>
            </ul>
          </div>

          {/* Contact & Facility Section */}
          <div className={styles.footerCol}>
            <h4 className={styles.colTitle}>Get In Touch</h4>
            <div className={styles.contactInfo}>
              <p>📍 <strong>Pickup Location:</strong> Evans Blvd, London, ON N6M 0A8, Canada</p>
              <p>📞 <strong>Phone:</strong> <a href="tel:+15551234567" className={styles.contactLink}>(555) 123-4567</a></p>
              <p>✉️ <strong>Email:</strong> <a href="mailto:orders@ckcakelounge.com" className={styles.contactLink}>orders@ckcakelounge.com</a></p>
            </div>

            <div className={styles.mapContainer}>
              <iframe
                title="Bakery Location Map"
                src="https://maps.google.com/maps?q=CK+Cake+Lounge,+Evans+Blvd,+London,+ON+N6M+0A8,+Canada&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
                width="100%"
                height="130"
                style={{ border: 0, borderRadius: 'var(--radius-sm)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className={styles.trustBadge}>
              <span className={styles.badgeIcon}>🥚</span>
              <div>
                <strong className={styles.badgeTitle}>100% Eggless Facility</strong>
                <p className={styles.badgeSubtitle}>Strictly peanut & egg allergy safe environment.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} CK Cake Lounge. All rights reserved.
          </p>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              📸 Instagram
            </a>
            <span className={styles.divider}>•</span>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              📘 Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
