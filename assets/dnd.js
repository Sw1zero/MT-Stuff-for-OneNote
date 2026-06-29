/* assets/dnd.js – MT-Lerntools gemeinsamer Drag-&-Drop-Layer
   ---------------------------------------------------------------
   Stellt MTDnD.touchStart() und MTDnD.shuffle() bereit.
   Ersetzt die duplizierten touchmove/touchend-Handler in jedem Tool.

   API:
     MTDnD.touchStart(event, element, word, isSlot, slotSel, onDrop)
       onDrop(box, word, source) wird aufgerufen wenn auf einem Slot losgelassen.
       source = { el, isSlot }

     MTDnD.shuffle(array) -> gemischtes Array (Original unverändert)
   --------------------------------------------------------------- */
(function(win) {
  var _w = null, _src = null, _ox = 0, _oy = 0, _slotSel = null, _onDrop = null, _clone = null;

  function getClone() {
    if (!_clone) {
      _clone = document.createElement('div');
      _clone.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;opacity:0.88;transform:scale(1.06);' +
        'border-radius:20px;padding:0.32rem 0.85rem;background:#134061;color:#fff;' +
        'font-family:inherit;font-size:0.82rem;font-weight:500;' +
        'box-shadow:0 4px 16px rgba(0,102,204,0.3);white-space:nowrap;display:none;';
      document.body.appendChild(_clone);
    }
    return _clone;
  }

  document.addEventListener('touchmove', function(e) {
    if (!_w) return;
    e.preventDefault();
    var t = e.touches[0], cl = getClone();
    cl.style.left = (t.clientX - _ox) + 'px';
    cl.style.top  = (t.clientY - _oy) + 'px';
  }, {passive: false});

  document.addEventListener('touchend', function(e) {
    if (!_w) return;
    var t = e.changedTouches[0];
    getClone().style.display = 'none';
    _src.el.style.opacity = '';
    var el = document.elementFromPoint(t.clientX, t.clientY);
    var box = el ? el.closest(_slotSel) : null;
    if (box && _onDrop) _onDrop(box, _w, _src);
    _w = _src = null;
  });

  win.MTDnD = {
    touchStart: function(e, el, word, isSlot, slotSel, onDrop) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      var t = e.touches[0], rect = el.getBoundingClientRect();
      _w = word; _src = {el: el, isSlot: isSlot};
      _ox = t.clientX - rect.left; _oy = t.clientY - rect.top;
      _slotSel = slotSel; _onDrop = onDrop;
      var cl = getClone();
      cl.textContent = word;
      cl.style.left = (t.clientX - _ox) + 'px';
      cl.style.top  = (t.clientY - _oy) + 'px';
      cl.style.display = 'block';
      el.style.opacity = '0.25';
    },

    shuffle: function(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };
})(window);
