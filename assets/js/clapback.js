/*
 * Clap back — let a reader highlight text in the article, then quote it into the
 * comments to rebut it.
 *
 * giscus renders in a cross-origin iframe, so we can't inject text into its
 * comment box directly. Instead we copy the selection as a Markdown blockquote
 * ("> …") to the clipboard, scroll to the comments, and prompt a paste. The
 * reader pastes and types their reply under the quote.
 *
 * Only selections inside .post-content count, and only when comments exist.
 */
(function () {
  var ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 4-4h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>' +
    '<path fill="#2573da" d="M7.5 8.5h6M7.5 11.5h4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';

  document.addEventListener('DOMContentLoaded', function () {
    var content = document.querySelector('.post-content');
    var comments = document.querySelector('.post-comments');
    if (!content || !comments) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'clapback-btn';
    btn.setAttribute('aria-label', 'Quote this in a comment');
    btn.innerHTML = ICON + '<span>Clap back</span>';
    btn.style.display = 'none';
    document.body.appendChild(btn);

    var toast = document.createElement('div');
    toast.className = 'clapback-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);

    var currentText = '';
    var persistHL = null;

    function selectionInContent(sel) {
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false;
      var r = sel.getRangeAt(0);
      return content.contains(r.startContainer) && content.contains(r.endContainer);
    }

    function hideBtn() {
      btn.style.display = 'none';
      currentText = '';
    }

    function positionAndShow() {
      var sel = window.getSelection();
      if (!selectionInContent(sel)) { hideBtn(); return; }
      var text = sel.toString().trim();
      if (text.length < 2) { hideBtn(); return; }
      currentText = text;

      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) { hideBtn(); return; }

      btn.style.display = 'inline-flex';
      var top = window.scrollY + rect.top - btn.offsetHeight - 8;
      var left = window.scrollX + rect.left + rect.width / 2 - btn.offsetWidth / 2;
      var minLeft = window.scrollX + 8;
      var maxLeft = window.scrollX + document.documentElement.clientWidth - btn.offsetWidth - 8;
      left = Math.max(minLeft, Math.min(left, maxLeft));
      if (top < window.scrollY + 4) top = window.scrollY + rect.bottom + 8;
      btn.style.top = top + 'px';
      btn.style.left = left + 'px';
    }

    function toBlockquote(text) {
      var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      return lines.map(function (l) { return '> ' + l; }).join('\n') + '\n\n';
    }

    function copyText(str) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(str);
      }
      return new Promise(function (resolve, reject) {
        try {
          var ta = document.createElement('textarea');
          ta.value = str;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          resolve();
        } catch (e) { reject(e); }
      });
    }

    var toastTimer;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 4500);
    }

    // Persist a blue highlight of the disputed passage (CSS Custom Highlight API;
    // no-op where unsupported — the copy + scroll still work).
    function persistHighlight() {
      try {
        if (!window.CSS || !CSS.highlights || typeof Highlight === 'undefined') return;
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        var range = sel.getRangeAt(0).cloneRange();
        if (!persistHL) { persistHL = new Highlight(); CSS.highlights.set('clapback', persistHL); }
        persistHL.add(range);
      } catch (e) {}
    }

    // Keep the text selected when pressing the button.
    btn.addEventListener('mousedown', function (e) { e.preventDefault(); });

    btn.addEventListener('click', function () {
      if (!currentText) return;
      copyText(toBlockquote(currentText)).then(function () {
        persistHighlight();
        showToast('Quote copied — paste it (Ctrl / ⌘ + V) into the box below and type your clap back.');
        comments.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).catch(function () {
        showToast('Couldn’t copy automatically — select the text and copy it manually.');
      });
      hideBtn();
    });

    document.addEventListener('mouseup', function (e) {
      if (btn.contains(e.target)) return;
      window.setTimeout(positionAndShow, 0);
    });
    document.addEventListener('mousedown', function (e) {
      if (!btn.contains(e.target)) hideBtn();
    });
    document.addEventListener('selectionchange', function () {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) hideBtn();
    });
  });
})();
