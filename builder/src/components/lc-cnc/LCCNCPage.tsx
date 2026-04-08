'use client';

import Head from 'next/head';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function CncIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="10" y="10" width="80" height="80" rx="4"/>
      <circle cx="50" cy="50" r="25"/>
      <circle cx="50" cy="50" r="10"/>
      <line x1="50" y1="25" x2="50" y2="10"/>
      <line x1="50" y1="75" x2="50" y2="90"/>
      <line x1="25" y1="50" x2="10" y2="50"/>
      <line x1="75" y1="50" x2="90" y2="50"/>
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M5 12h14m-7-7l7 7-7 7"/>
    </svg>
  );
}

export default function LCCNCWebsite() {
  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: '3C Machines', href: '#products' },
    { label: 'Custom Solutions', href: '#features' },
    { label: 'Cases', href: '#cases' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const products = [
    {
      title: '3C Phone-Frame Center',
      specs: 'Precision: ±0.005mm | Speed: 15,000 RPM | Work Area: 400×300mm',
    },
    {
      title: '3C Laptop-Shell Center',
      specs: 'Precision: ±0.003mm | Speed: 20,000 RPM | Work Area: 600×400mm',
    },
    {
      title: '3C Camera-Bezel Center',
      specs: 'Precision: ±0.002mm | Speed: 18,000 RPM | Work Area: 300×200mm',
    },
    {
      title: '3C Keypad Center',
      specs: 'Precision: ±0.004mm | Speed: 12,000 RPM | Work Area: 350×250mm',
    },
  ];

  const features = [
    { icon: '⚡', title: '10-Day Sample', desc: 'Fast Customization' },
    { icon: '🚢', title: '15-Day Shipment', desc: 'Short Lead-Time' },
    { icon: '💬', title: 'WhatsApp + Agent', desc: 'Local Support' },
  ];

  const cases = [
    { title: 'Phone Display Frame Machining', desc: 'High-precision CNC machining for smartphone frames' },
    { title: 'Laptop Shell Machining', desc: 'Premium aluminum alloy processing solutions' },
    { title: 'Camera Bezel Machining', desc: 'Ultra-thin bezels with mirror finish' },
    { title: 'Phone Keypad Machining', desc: 'Tactile feedback optimized keypads' },
  ];

  const certifications = ['ISO 9001', 'CE', 'SGS'];

  const footerLinks = {
    products: ['3C Machines', 'Custom Solutions', 'Case Studies'],
    support: ['Technical Docs', 'WhatsApp Support', 'Regional Agents'],
    company: ['About LC-CNC', 'Certifications', 'Contact'],
  };

  return (
    <>
      <Head>
        <title>LC-CNC™ | Precision 3C CNC Machines for Southeast Asia</title>
        <meta name="description" content="Professional CNC machining solutions for 3C electronics. 10-Day Prototype, 15-Day Delivery, 24/7 WhatsApp Support across Southeast Asia." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="nav-glass">
        <a href="#hero" className="nav-logo">LC-CNC<sup>™</sup></a>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        <a href="https://wa.me/8615813703777" className="nav-cta">
          <WhatsAppIcon />
          Get Quote
        </a>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero section-dark">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🇨🇳 Shenzhen Since 2013</span>
          </div>
          <h1 className="hero-title">Precision 3C CNC Machines for Southeast Asia</h1>
          <p className="hero-subtitle">10-Day Prototype • 15-Day Delivery • 24/7 WhatsApp Support</p>
          <div className="hero-cta">
            <a href="https://wa.me/8615813703777" className="btn-primary">
              <WhatsAppIcon />
              Get Quote on WhatsApp
            </a>
            <a href="#contact" className="btn-pill btn-pill-dark">
              <DocumentIcon />
              Request Catalog
            </a>
          </div>
        </div>
        <div className="hero-image">
          <CncIcon />
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="section-light">
        <div className="container">
          <h2 className="headline-section" style={{ textAlign: 'center', color: '#1d1d1f' }}>
            3C CNC Machining Centers
          </h2>
          <p className="body-text" style={{ textAlign: 'center', color: 'rgba(0,0,0,0.6)', marginTop: '8px' }}>
            Industrial-grade precision for consumer electronics manufacturing
          </p>
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.title} className="product-card">
                <div className="product-card-image">
                  <CncIcon />
                </div>
                <h3 className="product-card-title">{product.title}</h3>
                <p className="product-card-specs">{product.specs}</p>
                <a
                  href={`https://wa.me/8615813703777?text=Interested in ${encodeURIComponent(product.title)}`}
                  className="product-card-whatsapp"
                >
                  <WhatsAppIcon />
                  Inquire Now
                  <ArrowRightIcon />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section id="features" className="section-dark">
        <div className="container">
          <div className="features-strip">
            {features.map((feature) => (
              <div key={feature.title} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Slider */}
      <section id="cases" className="section-dark" style={{ paddingBottom: '120px' }}>
        <div className="container">
          <h2 className="headline-section" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Application Cases
          </h2>
          <p className="body-text" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
            Proven track record across Southeast Asia manufacturing facilities
          </p>
          <div className="case-slider">
            {cases.map((caseItem) => (
              <div key={caseItem.title} className="case-card">
                <div className="case-card-image">
                  <CncIcon />
                </div>
                <div className="case-card-content">
                  <h3 className="case-card-title">{caseItem.title}</h3>
                  <p className="case-card-desc">{caseItem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-light">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="headline-section" style={{ color: '#1d1d1f' }}>
                LC-CNC, Shenzhen since 2013
              </h2>
              <p className="body-text">
                Your trusted partner in precision CNC machining for the 3C electronics industry. 
                We specialize in high-precision machining centers designed specifically for 
                smartphone, laptop, camera, and keypad components.
              </p>
              <p className="body-text">
                Our ISO-certified plant combines advanced Japanese and German technology 
                with competitive local manufacturing, serving 200+ customers across 
                Southeast Asia.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-number">30+</div>
                  <div className="stat-label">R&D Engineers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">200+</div>
                  <div className="stat-label">Machines in SEA</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">12+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div style={{ 
                width: '100%', 
                height: '300px', 
                background: '#1d1d1f', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CncIcon />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section-dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="headline-section" style={{ marginBottom: '8px' }}>
            Certifications
          </h2>
          <p className="body-text" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
            Quality assured for international manufacturing standards
          </p>
          <div className="certifications">
            {certifications.map((cert) => (
              <div key={cert} className="cert-item">
                <div className="cert-icon">{cert}</div>
                <div className="cert-label">{cert}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-light">
        <div className="container">
          <h2 className="headline-section" style={{ textAlign: 'center', color: '#1d1d1f' }}>
            Get in Touch
          </h2>
          <p className="body-text" style={{ textAlign: 'center', color: 'rgba(0,0,0,0.6)', marginBottom: '32px' }}>
            Quick response via WhatsApp • Professional technical support
          </p>
          <div className="contact-grid">
            <div className="contact-whatsapp">
              <div className="whatsapp-icon">
                <WhatsAppIcon />
              </div>
              <h3 className="whatsapp-title">WhatsApp Chat</h3>
              <p className="whatsapp-number">+86-158-1370-3777</p>
              <a href="https://wa.me/8615813703777" className="btn-primary">
                Start Chat Now
              </a>
            </div>
            <div className="contact-form">
              <h3 className="form-title">Quick Quote Form</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input type="text" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input type="text" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp *</label>
                    <input type="tel" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Machine Model</label>
                    <select className="form-select">
                      <option value="">Select a model...</option>
                      {products.map((p) => (
                        <option key={p.title} value={p.title}>{p.title}</option>
                      ))}
                      <option value="custom">Custom Requirements</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-input" min="1" placeholder="e.g., 5" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Deadline / Additional Requirements</label>
                    <textarea className="form-textarea" placeholder="Any specific requirements..." />
                  </div>
                  <div className="form-group full-width">
                    <div className="form-consent">
                      <input type="checkbox" id="consent" required />
                      <label htmlFor="consent">I agree to receive follow-up via WhatsApp</label>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary form-submit">
                  Submit Quote Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">LC-CNC<sup>™</sup></div>
            <p className="footer-desc">
              Precision 3C CNC machining solutions for Southeast Asia manufacturers. 
              ISO-certified, cost-effective, and backed by 24/7 technical support.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Products</h4>
            <ul className="footer-links">
              {footerLinks.products.map((link) => (
                <li key={link}><a href="#products">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              {footerLinks.support.map((link) => (
                <li key={link}><a href="#contact">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              {footerLinks.company.map((link) => (
                <li key={link}><a href="#about">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>
            <div className="footer-contact-item">
              <WhatsAppIcon />
              <span>+86-158-1370-3777</span>
            </div>
            <div className="footer-contact-item">
              <MailIcon />
              <span>sales@lc-cnc.com</span>
            </div>
            <div className="footer-contact-item">
              <LocationIcon />
              <span>Bao'an, Shenzhen, China</span>
            </div>
          </div>
          <div>Copyright © 2024 LC-CNC. All rights reserved.</div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a href="https://wa.me/8615813703777" className="whatsapp-float" aria-label="Chat on WhatsApp">
        <WhatsAppIcon />
      </a>
    </>
  );
}
