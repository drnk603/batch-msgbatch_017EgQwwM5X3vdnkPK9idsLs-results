(function() {
  'use strict';

  window.__app = window.__app || {};

  const debounce = (func, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const throttle = (func, delay) => {
    let timer;
    return function(...args) {
      if (!timer) {
        func.apply(this, args);
        timer = setTimeout(() => { timer = null; }, delay);
      }
    };
  };

  class BurgerMenu {
    constructor() {
      this.toggle = document.querySelector('.navbar-toggler');
      this.collapse = document.querySelector('.navbar-collapse');
      this.navLinks = document.querySelectorAll('.nav-link');
      if (this.toggle && this.collapse) this.init();
    }

    init() {
      this.toggle.addEventListener('click', () => this.toggleMenu());
      this.navLinks.forEach(link => link.addEventListener('click', () => this.closeMenu()));
      document.addEventListener('click', (e) => this.handleOutsideClick(e));
      document.addEventListener('keydown', (e) => this.handleEscape(e));
      window.addEventListener('resize', debounce(() => this.handleResize(), 150));
    }

    toggleMenu() {
      const isOpen = this.collapse.classList.contains('show');
      if (isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }

    openMenu() {
      this.collapse.classList.add('show');
      this.toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      this.collapse.style.height = 'calc(100vh - var(--nav-h))';
    }

    closeMenu() {
      this.collapse.classList.remove('show');
      this.toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    handleOutsideClick(e) {
      if (!this.toggle.contains(e.target) && !this.collapse.contains(e.target)) {
        this.closeMenu();
      }
    }

    handleEscape(e) {
      if (e.key === 'Escape' && this.collapse.classList.contains('show')) {
        this.closeMenu();
        this.toggle.focus();
      }
    }

    handleResize() {
      if (window.innerWidth >= 768) {
        this.closeMenu();
      }
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('a[href*="#"]').forEach(link => {
        link.addEventListener('click', (e) => this.handleClick(e, link));
      });
      if (location.hash) {
        setTimeout(() => this.scrollToHash(location.hash), 100);
      }
    }

    handleClick(e, link) {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      
      if (href.startsWith('#')) {
        e.preventDefault();
        this.scrollToHash(href);
      } else if (href.includes('#')) {
        const [path, hash] = href.split('#');
        if (location.pathname === path || path === '') {
          e.preventDefault();
          this.scrollToHash('#' + hash);
        }
      }
    }

    scrollToHash(hash) {
      const target = document.querySelector(hash);
      if (!target) return;
      
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 72;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('section[id]');
      this.navLinks = document.querySelectorAll('.nav-link');
      if (this.sections.length && this.navLinks.length) this.init();
    }

    init() {
      window.addEventListener('scroll', throttle(() => this.updateActiveLink(), 100));
      this.updateActiveLink();
    }

    updateActiveLink() {
      const scrollPos = window.scrollY + 100;
      
      this.sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < top + height) {
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }
  }

  class FormValidator {
    constructor() {
      this.forms = document.querySelectorAll('form');
      this.init();
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      });
    }

    handleSubmit(e, form) {
      e.preventDefault();
      this.clearErrors(form);
      
      const isValid = this.validateForm(form);
      
      if (!isValid) {
        return false;
      }
      
      this.submitForm(form);
    }

    validateForm(form) {
      let isValid = true;
      const fields = form.querySelectorAll('input, textarea, select');
      
      fields.forEach(field => {
        if (field.hasAttribute('required') && !field.value.trim()) {
          this.showError(field, 'Это поле обязательно для заполнения');
          isValid = false;
        } else if (field.type === 'email' && field.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            this.showError(field, 'Введите корректный email адрес');
            isValid = false;
          }
        } else if (field.type === 'tel' && field.value) {
          const phoneRegex = /^[\d\s+\-()]{10,20}$/;
          if (!phoneRegex.test(field.value)) {
            this.showError(field, 'Введите корректный номер телефона');
            isValid = false;
          }
        } else if (field.name && field.name.toLowerCase().includes('name') && field.value) {
          const nameRegex = /^[a-zA-ZА-Яа-яЁёÀ-ÿ\s-']{2,50}$/;
          if (!nameRegex.test(field.value)) {
            this.showError(field, 'Имя должно содержать от 2 до 50 символов и только буквы');
            isValid = false;
          }
        } else if (field.tagName === 'TEXTAREA' && field.value && field.value.length < 10) {
          this.showError(field, 'Сообщение должно содержать минимум 10 символов');
          isValid = false;
        }
      });
      
      return isValid;
    }

    showError(field, message) {
      field.classList.add('is-invalid');
      field.style.borderColor = 'var(--color-error)';
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      errorDiv.style.color = 'var(--color-error)';
      errorDiv.style.fontSize = 'var(--font-size-sm)';
      errorDiv.style.marginTop = 'var(--space-xs)';
      
      field.parentNode.appendChild(errorDiv);
    }

    clearErrors(form) {
      form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
      form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
        el.style.borderColor = '';
      });
    }

    submitForm(form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Отправляется...';
      }

      const style = document.createElement('style');
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
      
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        
        window.location.href = 'thank_you.html';
      }, 1500);
    }
  }

  class ScrollAnimations {
    constructor() {
      this.elements = document.querySelectorAll('.card, .btn, .c-button, img, h1, h2, h3, p, .hero-section');
      this.init();
    }

    init() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);
      
      this.elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.8s ease-out ${index * 0.05}s, transform 0.8s ease-out ${index * 0.05}s`;
        observer.observe(el);
      });
    }
  }

  class ButtonEffects {
    constructor() {
      this.buttons = document.querySelectorAll('.btn, .c-button, a[class*="btn"]');
      this.init();
    }

    init() {
      this.buttons.forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        
        btn.addEventListener('mouseenter', (e) => this.handleHover(e, btn));
        btn.addEventListener('mouseleave', (e) => this.handleLeave(e, btn));
        btn.addEventListener('click', (e) => this.createRipple(e, btn));
      });
    }

    handleHover(e, btn) {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = 'var(--shadow-lg)';
    }

    handleLeave(e, btn) {
      btn.style.transform = '';
      btn.style.boxShadow = '';
    }

    createRipple(e, btn) {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        top: ${y}px;
        left: ${x}px;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      if (!document.querySelector('style[data-ripple]')) {
        style.setAttribute('data-ripple', '');
        document.head.appendChild(style);
      }
      
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  }

  class CardHoverEffects {
    constructor() {
      this.cards = document.querySelectorAll('.card');
      this.init();
    }

    init() {
      this.cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-8px) scale(1.02)';
          card.style.boxShadow = 'var(--shadow-xl)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.boxShadow = '';
        });
      });
    }
  }

  class CountUp {
    constructor() {
      this.counters = document.querySelectorAll('[data-count]');
      this.init();
    }

    init() {
      if (this.counters.length === 0) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            this.animateCount(entry.target);
            entry.target.classList.add('counted');
          }
        });
      }, { threshold: 0.5 });
      
      this.counters.forEach(counter => observer.observe(counter));
    }

    animateCount(element) {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    }
  }

  class ScrollToTop {
    constructor() {
      this.createButton();
      this.init();
    }

    createButton() {
      const btn = document.createElement('button');
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--color-accent);
        color: var(--color-text-inverse);
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease-in-out;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
      `;
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(btn);
      this.btn = btn;
    }

    init() {
      window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 300) {
          this.btn.style.opacity = '1';
          this.btn.style.transform = 'translateY(0)';
        } else {
          this.btn.style.opacity = '0';
          this.btn.style.transform = 'translateY(20px)';
        }
      }, 100));
    }
  }

  class ImageAnimations {
    constructor() {
      this.images = document.querySelectorAll('img');
      this.init();
    }

    init() {
      this.images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'scale(1)';
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        
        observer.observe(img);
      });
    }
  }

  class AccordionAnimations {
    constructor() {
      this.accordions = document.querySelectorAll('.accordion-button');
      this.init();
    }

    init() {
      this.accordions.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = document.querySelector(btn.getAttribute('data-bs-target'));
          if (target) {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
              target.style.maxHeight = target.scrollHeight + 'px';
              setTimeout(() => {
                target.style.maxHeight = '0';
              }, 10);
              btn.setAttribute('aria-expanded', 'false');
              btn.classList.add('collapsed');
            } else {
              target.style.maxHeight = target.scrollHeight + 'px';
              btn.setAttribute('aria-expanded', 'true');
              btn.classList.remove('collapsed');
            }
          }
        });
      });
    }
  }

  class LinkHoverEffects {
    constructor() {
      this.links = document.querySelectorAll('a:not(.btn):not(.c-button)');
      this.init();
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          link.style.transform = 'translateX(4px)';
          link.style.transition = 'transform 0.2s ease-out';
        });
        
        link.addEventListener('mouseleave', () => {
          link.style.transform = '';
        });
      });
    }
  }

  const init = () => {
    new BurgerMenu();
    new SmoothScroll();
    new ScrollSpy();
    new FormValidator();
    new ScrollAnimations();
    new ButtonEffects();
    new CardHoverEffects();
    new CountUp();
    new ScrollToTop();
    new ImageAnimations();
    new AccordionAnimations();
    new LinkHoverEffects();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();