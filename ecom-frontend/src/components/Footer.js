import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  background-size: 400% 400%;
  animation: ${gradientShift} 8s ease infinite;
  color: #e0e0e0;
  padding: 4rem 0 2rem;
  margin-top: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 80%, rgba(0, 120, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 100, 100, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(100, 255, 100, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  position: relative;
  z-index: 1;
`;

const FooterSection = styled.div`
  animation: ${fadeInUp} 0.8s ease-out;
  animation-fill-mode: both;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }

  h3 {
    color: #00d4ff;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    font-weight: 700;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, #00d4ff, #ff6b6b, #4ecdc4);
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }

  p, li {
    margin-bottom: 0.8rem;
    line-height: 1.7;
    color: #e0e0e0;
    transition: all 0.3s ease;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  a {
    color: #e0e0e0;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: inline-block;

    &::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #00d4ff, #ff6b6b);
      transition: width 0.3s ease;
    }

    &:hover {
      color: #00d4ff;
      transform: translateX(5px);

      &::before {
        width: 100%;
      }
    }
  }

  li {
    position: relative;
    padding-left: 1.2rem;

    &::before {
      content: '▶';
      position: absolute;
      left: 0;
      color: #00d4ff;
      font-size: 0.8rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::before {
      opacity: 1;
    }
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  justify-content: center;
  animation: ${slideInLeft} 0.8s ease-out 0.5s both;

  a {
    font-size: 1.8rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    padding: 0.8rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      transform: translateY(-5px) scale(1.1);
      color: #00d4ff;
      background: rgba(0, 212, 255, 0.2);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
      animation: ${bounce} 0.6s ease;
    }

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.3);
      transition: all 0.3s ease;
      z-index: -1;
    }

    &:hover::before {
      width: 50px;
      height: 50px;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(5px);
  }

  svg {
    color: #00d4ff;
    font-size: 1.2rem;
    margin-top: 0.2rem;
    transition: all 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.2) rotate(5deg);
    color: #ff6b6b;
  }

  span {
    line-height: 1.6;
    color: #e0e0e0;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 3rem;
  margin-top: 3rem;
  border-top: 2px solid rgba(0, 212, 255, 0.3);
  color: #aaa;
  position: relative;
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;

  p {
    margin: 0;
    font-size: 0.95rem;
    position: relative;
    display: inline-block;

    &::before,
    &::after {
      content: '✦';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #00d4ff;
      font-size: 0.8rem;
      opacity: 0.6;
    }

    &::before {
      left: -2rem;
    }

    &::after {
      right: -2rem;
    }
  }
`;

const NewsletterSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.8s ease-out 0.7s both;

  h4 {
    color: #00d4ff;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  p {
    color: #e0e0e0;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
`;

const NewsletterForm = styled.div`
  display: flex;
  gap: 0.5rem;
  max-width: 400px;

  input {
    flex: 1;
    padding: 0.8rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &::placeholder {
      color: #aaa;
    }

    &:focus {
      outline: none;
      border-color: #00d4ff;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
    }
  }

  button {
    padding: 0.8rem 1.5rem;
    background: linear-gradient(135deg, #00d4ff, #ff6b6b);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
    }
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Omegatec</h3>
          <p>Your trusted partner for all security and surveillance solutions. We provide advanced security systems, reliable products, and expert support to protect what matters most.</p>

          <NewsletterSection>
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for the latest security trends and exclusive offers.</p>
            <NewsletterForm>
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </NewsletterForm>
          </NewsletterSection>
        </FooterSection>

        <FooterSection>
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">All Products</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Product Categories</h3>
          <ul>
            <li><a href="/products?category=cctv">CCTV Camera</a></li>
            <li><a href="/products?category=alarm">Security Alarm System</a></li>
            <li><a href="/products?category=fire">Fire Alarm System</a></li>
            <li><a href="/products?category=attendance">Time Attendance System</a></li>
            <li><a href="/products?category=access">Access Control System</a></li>
            <li><a href="/products?category=door">Video Door Phone System</a></li>
            <li><a href="/products?category=theatre">Home Theatre</a></li>
            <li><a href="/products?category=cables">Cables</a></li>
            <li><a href="/products?category=accessories">Accessories</a></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Contact Information</h3>
          <p><strong>Head Office</strong></p>
          <ContactInfo>
            <FaMapMarkerAlt />
            <span>22A, 7th Street, 70 Feet Road, Nggo Colony, Erode – 638009, Tamil Nadu, IN</span>
          </ContactInfo>
          <ContactInfo>
            <FaEnvelope />
            <span>sales@omegatec.net</span>
          </ContactInfo>
          <ContactInfo>
            <FaEnvelope />
            <span>admin@omegatec.net</span>
          </ContactInfo>
          <ContactInfo>
            <FaPhone />
            <span>+91 99 43 991545</span>
          </ContactInfo>
          <ContactInfo>
            <FaPhone />
            <span>+91 95 00 61 4117</span>
          </ContactInfo>
          <ContactInfo>
            <FaPhone />
            <span>Landline: 0424 2270754</span>
          </ContactInfo>
          <p style={{ marginTop: "1.5rem" }}><strong>Branch Office</strong></p>
          <ContactInfo>
            <FaMapMarkerAlt />
            <span>198, Nehru Street, Ram Nagar, Coimbatore – 641009, Tamil Nadu, IN</span>
          </ContactInfo>
          <ContactInfo>
            <FaEnvelope />
            <span>sales@omegatec.net</span>
          </ContactInfo>
          <ContactInfo>
            <FaPhone />
            <span>+91 95 00 61 4117</span>
          </ContactInfo>
        </FooterSection>
      </FooterContent>

      <SocialIcons>
        <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin /></a>
      </SocialIcons>

      <Copyright>
        <p>&copy; 2025 Omegatec. All rights reserved. | Made with ❤️ for Security</p>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
