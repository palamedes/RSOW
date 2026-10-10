// /build/start/ — the four-step project request form.
//
// Steps are <fieldset data-step> panels; Next validates the current one
// before moving on. Step 4 shows a review of everything entered. Submitting
// posts the form as FormData to data-endpoint (a form service such as
// Formspree). With no endpoint configured, nothing is sent: the form says so
// plainly and offers the request as text to copy, or as an email if
// data-email is set. Prefill: ?need=<service key>, ?ref=<case study slug>.
(function(){
  var form = document.getElementById('bld-form');
  if(!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var dots = Array.prototype.slice.call(form.querySelectorAll('[data-step-dot]'));
  var backBtn = document.getElementById('bld-back');
  var nextBtn = document.getElementById('bld-next');
  var submitBtn = document.getElementById('bld-submit');
  var stepLabel = document.getElementById('bld-step-label');
  var review = document.getElementById('bld-review');
  var done = document.getElementById('bld-done');
  var endpoint = (form.dataset.endpoint || '').trim();
  var email = (form.dataset.email || '').trim();
  var total = panels.length;
  var step = 1;

  // ── prefill from the URL ───────────────────────────────────────────────
  var params = new URLSearchParams(location.search);
  var need = params.get('need');
  if(need){
    var box = form.querySelector('input[name="needs"][data-key="' + CSS.escape(need) + '"]');
    if(box) box.checked = true;
  }
  var ref = params.get('ref');
  if(ref){
    var refs = {};
    try { refs = JSON.parse(document.getElementById('bld-refs').textContent); } catch(e){}
    if(refs[ref]){
      var refEl = document.getElementById('bld-ref');
      refEl.textContent = 'You came from the ' + refs[ref] + ' case study. I\'ll keep that in mind.';
      refEl.hidden = false;
      document.getElementById('bld-ref-input').value = refs[ref];
    }
  }

  // ── validation ─────────────────────────────────────────────────────────
  function showError(name, on){
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if(el) el.hidden = !on;
    var field = form.querySelector('[name="' + name + '"]');
    if(field && field.type !== 'checkbox' && field.type !== 'radio'){
      field.setAttribute('aria-invalid', on ? 'true' : 'false');
    }
  }
  function validate(n){
    var ok = true, first = null;
    function fail(name, focusEl){ showError(name, true); ok = false; if(!first) first = focusEl; }
    if(n === 1){
      var any = form.querySelectorAll('input[name="needs"]:checked').length > 0;
      showError('needs', false);
      if(!any) fail('needs', form.querySelector('input[name="needs"]'));
    }
    if(n === 2){
      var desc = form.elements.description;
      showError('description', false);
      if(!desc.value.trim()) fail('description', desc);
    }
    if(n === 4){
      var nm = form.elements.name, em = form.elements.email;
      showError('name', false); showError('email', false);
      if(!nm.value.trim()) fail('name', nm);
      if(!em.value.trim() || !em.checkValidity()) fail('email', em);
    }
    if(first) first.focus();
    return ok;
  }

  // ── the request as plain text (review + copy/email fallback) ───────────
  function values(name){
    return Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]'))
      .filter(function(el){ return (el.type !== 'checkbox' && el.type !== 'radio') || el.checked; })
      .map(function(el){ return el.value.trim(); })
      .filter(Boolean);
  }
  function summary(){
    var rows = [
      ['Needs', values('needs').join(', ')],
      ['Stage', values('stage').join('')],
      ['Project', values('description').join('')],
      ['Existing site', values('existing_url').join('')],
      ['Timeline', values('timeline').join('')],
      ['Budget', values('budget').join('')],
      ['Name', values('name').join('')],
      ['Email', values('email').join('')],
      ['Company', values('company').join('')],
      ['Found me via', values('heard_about').join('')],
      ['Referred by', values('referred_by').join('')]
    ];
    return rows.filter(function(r){ return r[1]; });
  }
  function renderReview(){
    var rows = summary().filter(function(r){ return ['Name','Email','Company','Found me via'].indexOf(r[0]) === -1; });
    review.innerHTML = '';
    if(!rows.length) return;
    var h = document.createElement('h3'); h.className = 'bld-side-h'; h.textContent = 'Your request so far';
    var dl = document.createElement('dl');
    rows.forEach(function(r){
      var dt = document.createElement('dt'); dt.textContent = r[0];
      var dd = document.createElement('dd'); dd.textContent = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    review.appendChild(h); review.appendChild(dl);
  }

  // ── stepping ───────────────────────────────────────────────────────────
  function go(n, opts){
    step = n;
    panels.forEach(function(p){ p.hidden = Number(p.dataset.step) !== n; });
    dots.forEach(function(d){
      var k = Number(d.dataset.stepDot);
      d.classList.toggle('is-current', k === n);
      d.classList.toggle('is-done', k < n);
    });
    backBtn.hidden = n === 1;
    nextBtn.hidden = n === total;
    submitBtn.hidden = n !== total;
    stepLabel.textContent = 'Step ' + n + ' of ' + total;
    if(n === total) renderReview();
    if(!(opts && opts.quiet)){
      var legend = panels[n - 1].querySelector('legend');
      if(legend){ legend.setAttribute('tabindex', '-1'); legend.focus(); }
      var top = form.getBoundingClientRect().top + window.scrollY - 90;
      if(window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }
  nextBtn.addEventListener('click', function(){ if(validate(step)) go(step + 1); });
  backBtn.addEventListener('click', function(){ go(step - 1); });
  // Enter in a single-line field moves forward instead of submitting early
  form.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && e.target.tagName === 'INPUT' && step < total){
      e.preventDefault(); if(validate(step)) go(step + 1);
    }
  });
  form.addEventListener('change', function(e){
    if(e.target.name) showError(e.target.name, false);
  });

  // ── submit ─────────────────────────────────────────────────────────────
  function finish(sent){
    form.hidden = true;
    done.hidden = false;
    if(!sent){
      document.getElementById('bld-done-title').textContent = 'Almost there.';
      document.getElementById('bld-done-text').hidden = true;
      var text = summary().map(function(r){ return r[0] + ': ' + r[1]; }).join('\n');
      var off = document.getElementById('bld-offline');
      document.getElementById('bld-offline-text').value = text;
      off.hidden = false;
      if(email){
        var mail = document.getElementById('bld-mailto');
        mail.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Project request') + '&body=' + encodeURIComponent(text);
        mail.hidden = false;
      }
      document.getElementById('bld-copy').addEventListener('click', function(){
        var ta = document.getElementById('bld-offline-text');
        var btn = this;
        (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject())
          .catch(function(){ ta.select(); document.execCommand('copy'); })
          .then(function(){ btn.textContent = 'Copied'; });
      });
    }
    done.focus();
    window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate(step)) return;
    if(form.elements._gotcha && form.elements._gotcha.value) return; // a bot
    if(!endpoint){ finish(false); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function(r){ if(!r.ok) throw new Error(r.status); finish(true); })
      .catch(function(){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send request';
        finish(false);
        document.getElementById('bld-done-title').textContent = 'That didn\'t go through.';
        document.querySelector('#bld-offline p').textContent = 'Something went wrong sending the form, so here is your request to copy instead. Nothing you typed is lost.';
      });
  });

  go(1, { quiet: true });
})();
