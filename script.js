// ==========================================
// HOLO PLAYER WEBSITE - Interactive Features
// ==========================================

document.addEventListener('DOMContentLoaded', function() {

  // ==========================================
  // FAQ Accordion Toggle
  // ==========================================

  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Close other open FAQs (optional - remove for multi-open)
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current FAQ
      item.classList.toggle('active');
    });
  });


  // ==========================================
  // Smooth Scroll for Anchor Links
  // ==========================================

  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#" or empty
      if (href === '#' || href === '') return;

      e.preventDefault();

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without triggering scroll
        history.pushState(null, null, href);
      }
    });
  });


  // ==========================================
  // Scroll-based Fade-in Animation (Optional)
  // ==========================================

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const fadeElements = document.querySelectorAll('.experience-card, .feature-row, .vp-feature, .future-card, .journey-step');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(20px)';

        // Trigger animation
        setTimeout(() => {
          entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);

        // Unobserve after animation
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(element => {
    fadeObserver.observe(element);
  });


  // ==========================================
  // Form Submission Handler
  // ==========================================

  const signupForm = document.querySelector('.signup-form');

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      // Formspree will handle the actual submission
      // This is just for client-side validation or custom handling

      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (!email) {
        e.preventDefault();
        alert('Please enter a valid email address.');
        return false;
      }

      // Show loading state (optional)
      const submitBtn = this.querySelector('.btn-submit');
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
    });
  }

});
