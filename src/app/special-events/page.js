'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import styles from './page.module.css';

export default function SpecialEventsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const orderType = 'pickup';
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occasion: 'wedding', // wedding, baby shower, anniversary, retirement, others
    date: '',
    time: '',
    notes: ''
  });

  // Calculate 2-day lead time constraint
  const today = new Date();
  const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  const year = twoDaysFromNow.getFullYear();
  const month = String(twoDaysFromNow.getMonth() + 1).padStart(2, '0');
  const day = String(twoDaysFromNow.getDate()).padStart(2, '0');
  const minDateString = `${year}-${month}-${day}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleUploadWrapperClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email || !formData.phone || !formData.date || !formData.time) {
      alert("Please fill out all required fields.");
      return;
    }

    // Double check date constraint
    if (formData.date < minDateString) {
      alert("Orders for Special Events must be requested at least 2 days in advance.");
      return;
    }

    // Enforced Store Pickup Only

    setIsSubmitting(true);
    let finalPhotoUrl = null;

    try {
      // 1. Upload file if selected
      if (photoFile) {
        setIsUploading(true);
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `special-events-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('cake_photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          alert("Failed to upload reference photo. Please try submitting again.");
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }

        const { data: publicData } = supabase.storage.from('cake_photos').getPublicUrl(fileName);
        finalPhotoUrl = publicData.publicUrl;
        setIsUploading(false);
      }

      // 2. Submit to API
      const cartItems = [
        {
          name: `Special Event Cake Request (${formData.occasion.toUpperCase()})`,
          quantity: 1,
          price: 0,
          flavor: 'Custom Specifications',
          size: 'Bespoke Event Size',
          isPhotoCake: !!finalPhotoUrl,
          photoUrl: finalPhotoUrl,
          category: 'Special Events'
        }
      ];

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isQuoteOnly: true,
          isSpecialEventQuoteRequest: true,
          amount: 0,
          formData: {
            ...formData,
            notes: `[Occasion: ${formData.occasion.toUpperCase()}] ${formData.notes}`
          },
          cartItems,
          orderType,
          distanceKm: 0 // Will be evaluated by bakery in final invoice
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 3. Save ticket to sessionStorage for the success redirection screen
        const quoteTicket = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          receiptId: data.receiptId,
          isQuote: true,
          isSpecialEvent: true
        };
        sessionStorage.setItem('lastOrderTicket', JSON.stringify(quoteTicket));
        
        router.push('/success');
      } else {
        alert(data.error || "Failed to submit quote request. Please try again.");
      }
    } catch (err) {
      console.error("Special Event Quote submission error:", err);
      alert("Network error submitting quote request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.eventsContainer}>
      <h1 className={styles.eventsTitle}>Special Events Cake Inquiry</h1>
      <p className={styles.eventsSubtitle}>
        Hosting a wedding, baby shower, or retirement? Share your details below. We require at least 2 days advance notice to review your request and send a custom quote.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Contact Info */}
        <div className={`glass-panel ${styles.formSection}`}>
          <h2>Contact Information</h2>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>First Name *</label>
              <input 
                type="text" 
                name="firstName" 
                required 
                value={formData.firstName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>Email Address *</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className={`glass-panel ${styles.formSection}`}>
          <h2>Event Specifications</h2>
          <div className={styles.inputGroup}>
            <label>Occasion Type *</label>
            <select 
              name="occasion" 
              value={formData.occasion} 
              onChange={handleInputChange}
            >
              <option value="wedding">Wedding</option>
              <option value="baby shower">Baby Shower</option>
              <option value="anniversary">Anniversary</option>
              <option value="retirement">Retirement</option>
              <option value="others">Others (describe below)</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Event Description & Cake Specifications *</label>
            <textarea 
              name="notes" 
              rows="5" 
              required
              placeholder="Provide event details, estimated guest count, theme/color preferences, flavor choices, and any design layout ideas."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Upload Reference Design Photo (Optional)</label>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className={styles.uploadWrapper} onClick={handleUploadWrapperClick}>
              <span className={styles.uploadIcon}>📷</span>
              <span className={styles.uploadText}>
                {photoFile ? "Change Chosen Image" : "Select Inspiration Image"}
              </span>
              <span className={styles.uploadSubtext}>JPG, PNG, WebP (Max 10MB)</span>
            </div>
            {photoFile && (
              <div className={styles.fileName}>
                ✓ File selected: {photoFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment Section */}
        <div className={`glass-panel ${styles.formSection}`}>
          <h2>Fulfillment</h2>
          <p style={{ fontWeight: '600', color: '#4a3f39', marginBottom: '0.8rem' }}>Store Pickup Only</p>
          <div className={styles.infoBox}>
            <strong>Pickup Location:</strong>
            <span>CK Cake Lounge, Evans Blvd, London, ON N6M 0A8, Canada</span>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className={`glass-panel ${styles.formSection}`}>
          <h2>Scheduling Details</h2>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label>Requested Pickup Date *</label>
              <input 
                type="date" 
                name="date" 
                required 
                min={minDateString}
                value={formData.date} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Requested Pickup Time *</label>
              <input 
                type="time" 
                name="time" 
                required 
                value={formData.time} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          <div className={styles.infoBox} style={{ background: '#ecfdf5', borderColor: '#10b981' }}>
            <span>🔒 Enforced: Minimum of 2 days (48 hours) advance notice required. Date selector will restrict selections to {minDateString} and beyond.</span>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.submitRow}>
          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Uploading & Submitting..." : "Submit Inquiry"}
          </button>
          <span className={styles.disclaimer}>
            ✓ No payment required at this step. We will contact you via email and phone to confirm availability and complete your booking.
          </span>
        </div>
      </form>
    </main>
  );
}
