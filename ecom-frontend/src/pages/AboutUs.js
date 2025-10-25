import React, { useEffect, useState } from "react";
import "./AboutUs.css";
import bulletImg from "../assets/bullet.jpg";
import domeImg from "../assets/dome.jpg";

// --- Featured Products Data ---
const featuredProducts = [
  {
    name: "Bullet CCTV Camera",
    image: bulletImg,
    desc: "High-definition outdoor surveillance camera with night vision and weatherproof design. Ideal for perimeter security."
  },
  {
    name: "Dome CCTV Camera",
    image: domeImg,
    desc: "Discreet indoor camera with wide-angle lens and motion detection. Perfect for homes, offices, and retail spaces."
  },
  {
    name: "Fire Alarm System",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    desc: "Advanced fire detection and alarm system for early warning and rapid response in emergencies."
  }
];

// --- Animated Counter Component ---
function AnimatedCounter({ end, duration }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
}

const AboutUs = () => (
  <div className="aboutus2-container">
    {/* --- Hero Section --- */}
    <section className="aboutus2-hero">
      <h1>Welcome to OmegaaTec</h1>
      <p>
        Your trusted partner for security, automation, and surveillance solutions. We combine technology, expertise, and care to protect what matters most to you.
      </p>
    </section>

    {/* --- Info Cards Section --- */}
    <section className="aboutus2-cards">
      <div className="aboutus2-card">
        <h2>Who We Are</h2>
        <p>
          Founded in 2009, OmegaaTec has grown from a small family business into a leading provider of security and automation systems. Our mission is to deliver peace of mind through reliable products and outstanding service.
        </p>
      </div>
      <div className="aboutus2-card">
        <h2>What We Do</h2>
        <ul>
          <li>• CCTV & Video Surveillance</li>
          <li>• Fire & Intrusion Alarms</li>
          <li>• Access Control & Time Attendance</li>
          <li>• Smart Home & Office Automation</li>
          <li>• Industrial Automation</li>
        </ul>
      </div>
      <div className="aboutus2-card">
        <h2>Why Choose Us?</h2>
        <ul>
          <li>✔️ 15+ Years of Experience</li>
          <li>✔️ 2500+ Happy Customers</li>
          <li>✔️ Fast, Reliable Support</li>
          <li>✔️ Real-time Stock & Delivery</li>
          <li>✔️ Trusted Brands & Genuine Products</li>
        </ul>
      </div>
    </section>

    {/* --- Featured Products Section --- */}
    <section className="aboutus2-products">
      <h2>Featured Products</h2>
      <div className="aboutus2-products-list">
        {featuredProducts.map((prod, idx) => (
          <div className="aboutus2-product-card" key={idx}>
            <img src={prod.image} alt={prod.name} />
            <h3>{prod.name}</h3>
            <p>{prod.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* --- Call to Action --- */}
    <section className="aboutus2-cta">
      <h2>Want to join our journey?</h2>
      <p>Contact us or follow us on social media to stay updated!</p>
      <button
        onClick={() => window.open("mailto:info@example.com")}
        className="aboutus2-contact-btn"
      >
        Contact Us
      </button>
    </section>
  </div>
);

export default AboutUs;