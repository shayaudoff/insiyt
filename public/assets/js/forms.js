/* =============================================================
   INSIYT — forms.js
   Reusable form validation utility.
   Loaded on pages that have forms (contact, book-a-class, etc).
   Pages call initForm(formId, onSuccess) from their own script.js.
   ============================================================= */

(function (global) {
  'use strict';


  /* ─────────────────────────────────────────
     HELPERS
     ───────────────────────────────────────── */

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isValidPhone(value) {
    /* Accepts formats: (123) 456-7890 | 123-456-7890 | +1 123 456 7890 etc. */
    return /^[\+]?[\d\s\-\(\)]{7,16}$/.test(value.trim());
  }

  function setError(field, message) {
    clearError(field);
    field.classList.add('error');
    const err = document.createElement('span');
    err.className   = 'form-error';
    err.textContent = message;
    field.insertAdjacentElement('afterend', err);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', 'err-' + field.id);
    err.id = 'err-' + field.id;
  }

  function clearError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const next = field.nextElementSibling;
    if (next && next.classList.contains('form-error')) {
      next.remove();
    }
  }

  function showSuccess(form, message) {
    /* Remove any existing success message */
    const existing = form.querySelector('.form-success');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className   = 'form-success';
    msg.textContent = message || 'Thank you! We\'ll be in touch soon.';
    msg.style.cssText = [
      'margin-top: 1rem',
      'padding: 1rem 1.25rem',
      'background: rgba(122, 140, 114, 0.12)',
      'border: 1px solid rgba(122, 140, 114, 0.3)',
      'border-radius: var(--radius)',
      'font-size: 0.85rem',
      'color: var(--color-sage)',
      'line-height: 1.5',
    ].join(';');

    form.appendChild(msg);
  }


  /* ─────────────────────────────────────────
     CORE VALIDATE FUNCTION
     Returns true if valid, false if not.
     Marks fields with .error and inserts messages.
     ───────────────────────────────────────── */

  function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.warn('validateForm: no form found with id "' + formId + '"');
      return false;
    }

    let isValid = true;

    /* Clear all previous errors first */
    form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(clearError);

    /* Check every required field */
    form.querySelectorAll('[required]').forEach(function (field) {
      const value = field.value.trim();

      if (!value) {
        setError(field, 'This field is required.');
        isValid = false;
        return;
      }

      if (field.type === 'email' && !isValidEmail(value)) {
        setError(field, 'Please enter a valid email address.');
        isValid = false;
        return;
      }

      if (field.type === 'tel' && value && !isValidPhone(value)) {
        setError(field, 'Please enter a valid phone number.');
        isValid = false;
        return;
      }

      /* Min-length check via data attribute */
      const minLen = parseInt(field.dataset.minlength, 10);
      if (minLen && value.length < minLen) {
        setError(field, 'Please enter at least ' + minLen + ' characters.');
        isValid = false;
      }
    });

    /* Scroll to first error */
    if (!isValid) {
      const firstError = form.querySelector('.error');
      if (firstError) {
        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
          10
        ) || 72;
        const top = firstError.getBoundingClientRect().top + window.scrollY - navHeight - 24;
        window.scrollTo({ top, behavior: 'smooth' });
        firstError.focus();
      }
    }

    return isValid;
  }


  /* ─────────────────────────────────────────
     INIT FUNCTION
     Called by each page's script.js:
       initForm('contact-form', function() { ... });
     ───────────────────────────────────────── */

  function initForm(formId, onSuccess, successMessage) {
    const form = document.getElementById(formId);
    if (!form) return;

    /* Real-time clear error on input */
    form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          clearError(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm(formId)) return;

      /* Disable submit button during processing */
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
      }

      /* Run caller's success handler (handles fetch/API call) */
      if (typeof onSuccess === 'function') {
        const result = onSuccess(form);

        /* If onSuccess returns a Promise, handle re-enable on settle */
        if (result && typeof result.then === 'function') {
          result
            .then(function () {
              showSuccess(form, successMessage);
              form.reset();
            })
            .catch(function (err) {
              console.error('Form submission error:', err);
              showSuccess(form, 'Something went wrong. Please try again or call us directly.');
            })
            .finally(function () {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.dataset.originalText;
              }
            });
        } else {
          /* Synchronous success */
          showSuccess(form, successMessage);
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText;
          }
        }
      } else {
        /* No handler provided — just show success */
        showSuccess(form, successMessage);
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
      }
    });
  }


  /* ─────────────────────────────────────────
     EXPOSE TO GLOBAL SCOPE
     ───────────────────────────────────────── */
  global.validateForm = validateForm;
  global.initForm     = initForm;

})(window);