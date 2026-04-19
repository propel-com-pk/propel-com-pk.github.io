const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a, .footer-links a, .brand[href]');
const toast = document.getElementById('toast');
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const reveals = document.querySelectorAll('.reveal');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function closeNav() {
  if (!siteNav || !menuToggle) return;
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', () => {
  if (!siteNav) return;
  const isOpen = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => closeNav());
});

document.addEventListener('click', (event) => {
  if (!siteNav || !menuToggle) return;
  if (!siteNav.classList.contains('open')) return;
  const clickedInside = siteNav.contains(event.target) || menuToggle.contains(event.target);
  if (!clickedInside) closeNav();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNav();
});

const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
document.querySelectorAll('.site-nav a, .footer-links a').forEach(link => {
  const href = (link.getAttribute('href') || '').toLowerCase();
  const normalized = href === '/' ? 'index.html' : href;
  if (normalized === currentFile || (currentFile === '' && normalized === 'index.html')) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

if (window.lucide) {
  window.lucide.createIcons();
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));

function getFieldErrorEl(name) {
  return document.querySelector(`[data-error-for="${name}"]`);
}

function setFieldError(field, message) {
  const errorEl = getFieldErrorEl(field.name);
  if (errorEl) errorEl.textContent = message || '';
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearStatus() {
  if (formStatus) {
    formStatus.textContent = '';
    formStatus.style.color = '';
  }
}

function setSendingState(isSending) {
  if (!submitBtn) return;
  submitBtn.disabled = isSending;
  submitBtn.classList.toggle('is-loading', isSending);
  const label = submitBtn.querySelector('.btn-label');
  if (label) label.textContent = isSending ? 'Sending…' : 'Send Message';
}

function validateForm() {
  if (!form) return false;
  let isValid = true;
  const name = form.elements.name;
  const email = form.elements.email;
  const service = form.elements.service;
  const message = form.elements.message;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  [
    [name, !name.value.trim(), 'Please enter your name.'],
    [email, !email.value.trim(), 'Please enter your email.'],
    [email, email.value.trim() && !emailPattern.test(email.value.trim()), 'Please enter a valid email address.'],
    [service, !service.value.trim(), 'Please choose a service.'],
    [message, !message.value.trim(), 'Please add a short message.']
  ].forEach(([field, failed, msg]) => {
    if (failed) {
      isValid = false;
      setFieldError(field, msg);
    } else {
      setFieldError(field, '');
    }
  });

  return isValid;
}

if (form) {
  ['name', 'email', 'service', 'message'].forEach((fieldName) => {
    const field = form.elements[fieldName];
    if (!field) return;
    field.addEventListener('input', () => {
      setFieldError(field, '');
      clearStatus();
    });
    field.addEventListener('blur', () => validateForm());
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    if (!validateForm()) {
      if (formStatus) {
        formStatus.textContent = 'Please fix the highlighted fields.';
        formStatus.style.color = '#ffb0a6';
      }
      showToast('Please fix the highlighted fields.');
      return;
    }

    setSendingState(true);
    if (formStatus) formStatus.textContent = 'Sending your message…';

    await new Promise(resolve => setTimeout(resolve, 1400));

    form.reset();
    ['name', 'email', 'service', 'message'].forEach((fieldName) => {
      const field = form.elements[fieldName];
      if (!field) return;
      setFieldError(field, '');
      field.removeAttribute('aria-invalid');
    });

    setSendingState(false);
    if (formStatus) {
      formStatus.textContent = 'Message sent! We’ll reply within 24–48 hours.';
      formStatus.style.color = '#baf7e5';
    }
    showToast('Message sent! We’ll reply within 24–48 hours.');
  });
}
