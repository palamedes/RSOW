// Laser Materials Library: the color finder. Opening a color family lights up
// its cells in every test grid (and closes the family that was open). The
// page works without this; it's only the highlight. Soft navigation re-runs
// this script after swapping in the new <main>, so it binds to whatever
// #lzr is on the page now, once.
(function () {
  function init() {
    var root = document.getElementById('lzr');
    if (!root || root.dataset.lzrReady) return;
    root.dataset.lzrReady = '1';

    var families = root.querySelectorAll('.lzr-family');
    var cells = root.querySelectorAll('.lzr-cell[data-color]');

    function highlight(color) {
      if (color) root.dataset.activeColor = color;
      else delete root.dataset.activeColor;
      for (var i = 0; i < cells.length; i++) {
        cells[i].classList.toggle('is-match', !!color && cells[i].dataset.color === color);
      }
    }

    for (var i = 0; i < families.length; i++) {
      families[i].addEventListener('toggle', function (e) {
        var el = e.currentTarget;
        var color = el.dataset.color;
        if (el.open) {
          for (var j = 0; j < families.length; j++) {
            if (families[j] !== el && families[j].open) families[j].open = false;
          }
          highlight(color);
        } else if (root.dataset.activeColor === color) {
          highlight(null);
        }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
