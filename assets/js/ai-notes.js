/*
 * AI Notes — inline, sourced factual context that a reader can toggle on
 * per post. The post prose is never modified; notes are anchored to a
 * distinctive phrase (from front matter) and injected as yellow bubbles
 * after the paragraph that contains that phrase.
 *
 * Data comes from a <script type="application/json" id="ai-notes-data">
 * blob rendered by _includes/ai-notes.html. Fully client-side, no network.
 */
(function () {
  var BOT_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<rect x="4" y="8" width="16" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
    '<circle cx="9.5" cy="13.5" r="1.4" fill="currentColor"/>' +
    '<circle cx="14.5" cy="13.5" r="1.4" fill="currentColor"/>' +
    '<line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" stroke-width="1.8"/>' +
    '<circle cx="12" cy="3" r="1.4" fill="currentColor"/>' +
    '<line x1="2.5" y1="13" x2="4" y2="13" stroke="currentColor" stroke-width="1.8"/>' +
    '<line x1="20" y1="13" x2="21.5" y2="13" stroke="currentColor" stroke-width="1.8"/>' +
    '</svg>';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // Kramdown smartquotes turns straight ' " into curly ones in the rendered
  // HTML, so anchor phrases with apostrophes won't match. Normalize both sides
  // to straight quotes before searching. This is a 1:1, length-preserving swap,
  // so string offsets used for highlighting stay valid.
  function normQuotes(s) {
    return String(s)
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var dataEl = document.getElementById('ai-notes-data');
    var btn = document.querySelector('.post-ainotes-btn');
    var content = document.querySelector('.post-content');
    if (!dataEl || !btn || !content) return;

    var notes;
    try { notes = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!Array.isArray(notes) || !notes.length) return;

    var paras = Array.prototype.slice.call(content.querySelectorAll('p'));
    var built = false;
    var on = false;

    function highlight(p, quote, num) {
      var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
      var node;
      var nq = normQuotes(quote);
      while ((node = walker.nextNode())) {
        var i = normQuotes(node.nodeValue).indexOf(nq);
        if (i === -1) continue;
        var range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + quote.length);
        var mark = document.createElement('span');
        mark.className = 'ai-note-anchor';
        mark.setAttribute('data-ai-note', num);
        try { range.surroundContents(mark); return mark; } catch (e) { return null; }
      }
      return null;
    }

    function bubbleHtml(note, num) {
      var srcs = (note.sources || []).map(function (s) {
        return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' +
          escapeHtml(s.title) + '</a>';
      }).join('<span class="ai-note-src-sep">&middot;</span>');

      var verdict = note.rating
        ? '<span class="ai-note-verdict ai-note-verdict--' + slug(note.rating) + '">' + escapeHtml(note.rating) + '</span>'
        : '';

      return '' +
        '<div class="ai-note-avatar">' + BOT_SVG + '</div>' +
        '<div class="ai-note-body">' +
          '<p class="ai-note-head"><span class="ai-note-num">' + num + '</span><span class="ai-note-head-label">AI Note</span>' + verdict + '</p>' +
          '<p class="ai-note-text">' + escapeHtml(note.note) + '</p>' +
          (srcs ? '<p class="ai-note-sources"><span class="ai-note-src-label">Sources</span>' + srcs + '</p>' : '') +
        '</div>';
    }

    function build() {
      var num = 0;
      notes.forEach(function (note) {
        var target = null;
        var nq = normQuotes(note.quote);
        for (var i = 0; i < paras.length; i++) {
          if (normQuotes(paras[i].textContent).indexOf(nq) !== -1) { target = paras[i]; break; }
        }
        if (!target) return;
        num++;
        highlight(target, note.quote, num);
        var aside = document.createElement('aside');
        aside.className = 'ai-note';
        aside.setAttribute('data-ai-note', num);
        aside.innerHTML = bubbleHtml(note, num);
        target.parentNode.insertBefore(aside, target.nextSibling);
      });
    }

    var lead = btn.querySelector('.post-ainotes-lead');
    var labelOff = lead ? lead.textContent : '';

    function setOn(next) {
      on = next;
      if (on && !built) { build(); built = true; }
      content.classList.toggle('ai-notes-on', on);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (lead) lead.textContent = on ? 'Hide AI Notes' : labelOff;
    }

    // Notes always start closed on each page load — the reader must click to
    // open them; the state deliberately does not persist across pages.
    btn.addEventListener('click', function () { setOn(!on); });
  });
})();
