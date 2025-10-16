import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    countryCode: '+251',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const isValidPhone = (phone) => /^[0-9]{6,13}$/.test(phone);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!isValidPhone(formData.phoneNumber)) {
      setError('Enter a valid phone number (6–13 digits, without country code).');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Invalid email address.');
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError('Password must contain uppercase, lowercase, number, symbol, and at least 8 characters.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(userCredential.user);
      
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: formData.fullName.trim(),
        phoneNumber: fullPhone,
        email: formData.email.toLowerCase(),
        isAdmin: false,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });

      alert('Verification email sent! Please check your inbox to verify your email before signing in.');
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    }

    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return '#e53e3e';
    if (passwordStrength < 70) return '#d69e2e';
    return '#38a169';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePhoneInput = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  return (
    <div className="signup-page">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-logo">
            <div className="logo-icon">⚡</div>
            <h1>MInT</h1>
          </div>
          <h2>Create Your Account</h2>
          <p>Join the innovation community today</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button 
              className="error-close" 
              onClick={() => setError('')}
              aria-label="Close error message"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <form onSubmit={handleSignup} className="signup-form">
          {/* Full Name Field */}
          <div className="input-group">
            <div className="input-wrapper with-icon-left">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="form-input"
                disabled={loading}
              />
              <label className="form-label">Full Name</label>
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="input-group">
            <div className="phone-input-group">
              <div className="country-select-wrapper input-wrapper with-icon-left">
                <i className="fas fa-globe input-icon"></i>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="country-select"
                  disabled={loading}
                >
                  <option value="+251">🇪🇹 +251</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+254">🇰🇪 +254</option>
                </select>
                <label className="form-label">Code</label>
              </div>
              <div className="phone-number-wrapper input-wrapper with-icon-left">
                <i className="fas fa-phone input-icon"></i>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneInput}
                  placeholder="912345678"
                  required
                  className="form-input"
                  disabled={loading}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <label className="form-label">Phone Number</label>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="input-group">
            <div className="input-wrapper with-icon-left">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="form-input"
                disabled={loading}
              />
              <label className="form-label">Email Address</label>
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <div className="input-wrapper with-icon-left">
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="form-input"
                disabled={loading}
              />
              <label className="form-label">Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                ></div>
              </div>
              <div className="strength-text">
                Password strength: 
                <span style={{ color: getPasswordStrengthColor(), fontWeight: '600', marginLeft: '5px' }}>
                  {getPasswordStrengthText()}
                </span>
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className="password-requirements">
            <h4>Password must contain:</h4>
            <ul>
              <li className={formData.password.length >= 8 ? 'met' : ''}>
                <i className={`fas ${formData.password.length >= 8 ? 'fa-check' : 'fa-times'}`}></i>
                At least 8 characters
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                <i className={`fas ${/[a-z]/.test(formData.password) ? 'fa-check' : 'fa-times'}`}></i>
                One lowercase letter
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                <i className={`fas ${/[A-Z]/.test(formData.password) ? 'fa-check' : 'fa-times'}`}></i>
                One uppercase letter
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
                <i className={`fas ${/[0-9]/.test(formData.password) ? 'fa-check' : 'fa-times'}`}></i>
                One number
              </li>
              <li className={/[@$!%*?&]/.test(formData.password) ? 'met' : ''}>
                <i className={`fas ${/[@$!%*?&]/.test(formData.password) ? 'fa-check' : 'fa-times'}`}></i>
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>

          {/* Terms Agreement */}
          <div className="terms-agreement">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !agreedToTerms}
            className={`signup-button ${loading ? 'loading' : ''} ${!agreedToTerms ? 'disabled' : ''}`}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="login-redirect">
          <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;