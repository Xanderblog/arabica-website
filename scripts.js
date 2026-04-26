/**
 * Arabica — scripts.js
 * Header interactions: search, panels, scroll, mobile
 */

(function () {
  'use strict';

  /* ── Element refs ── */
  const header          = document.querySelector('.site-header');
  const searchInput     = document.getElementById('searchInput');
  const searchInputMob  = document.getElementById('searchInputMobile');
  const searchForm      = document.getElementById('searchForm');
  const searchFormMob   = document.getElementById('searchFormMobile');
  const searchClear     = document.getElementById('searchClear');
  const searchClearMob  = document.getElementById('searchClearMobile');
  const btnInfo         = document.getElementById('btnInfo');
  const btnMenu         = document.getElementById('btnMenu');
  const btnSearchMobile = document.getElementById('btnSearchMobile');
  const infoPanel       = document.getElementById('infoPanel');
  const menuPanel       = document.getElementById('menuPanel');
  const mobileSearchBar = document.getElementById('mobileSearchBar');

  /* ═══════════════════════════════════════
     SCROLL — sticky shadow
  ═══════════════════════════════════════ */
  if (header && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;right:0;height:1px;pointer-events:none;';
    document.body.insertBefore(sentinel, document.body.firstChild);

    new IntersectionObserver(([e]) => {
      header.classList.toggle('is-scrolled', !e.isIntersecting);
    }, { threshold: 1 }).observe(sentinel);
  }

  /* ═══════════════════════════════════════
     SEARCH — desktop/tablet
  ═══════════════════════════════════════ */
  function handleSearchInput(input, clearBtn) {
    if (!input || !clearBtn) return;
    input.addEventListener('input', function () {
      clearBtn.classList.toggle('visible', this.value.length > 0);
    });
    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.remove('visible');
      input.focus();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        clearBtn.classList.remove('visible');
        this.blur();
        closeMobileSearch();
        closeAllPanels();
      }
    });
  }

  handleSearchInput(searchInput, searchClear);
  handleSearchInput(searchInputMob, searchClearMob);

  function handleFormSubmit(form, getInput) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = getInput().value.trim();
      if (q) {
        document.dispatchEvent(new CustomEvent('arabica:search', { detail: { query: q } }));
        console.log('[Arabica] Search:', q);
      }
    });
  }

  handleFormSubmit(searchForm, () => searchInput);
  handleFormSubmit(searchFormMob, () => searchInputMob);

  /* ── Global "/" shortcut focuses search ── */
  document.addEventListener('keydown', function (e) {
    const active = document.activeElement;
    const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    if (e.key === '/' && !isTyping) {
      e.preventDefault();
      const target = isVisible(searchInput) ? searchInput : searchInputMob;
      target && target.focus();
    }
  });

  /* ═══════════════════════════════════════
     MOBILE SEARCH TOGGLE
  ═══════════════════════════════════════ */
  function openMobileSearch() {
    if (!mobileSearchBar) return;
    mobileSearchBar.classList.add('open');
    btnSearchMobile && btnSearchMobile.setAttribute('aria-expanded', 'true');
    // Focus after animation
    setTimeout(() => searchInputMob && searchInputMob.focus(), 100);
  }

  function closeMobileSearch() {
    if (!mobileSearchBar) return;
    mobileSearchBar.classList.remove('open');
    btnSearchMobile && btnSearchMobile.setAttribute('aria-expanded', 'false');
    if (searchInputMob) {
      searchInputMob.value = '';
      searchClearMob && searchClearMob.classList.remove('visible');
    }
  }

  if (btnSearchMobile) {
    btnSearchMobile.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = mobileSearchBar && mobileSearchBar.classList.contains('open');
      isOpen ? closeMobileSearch() : openMobileSearch();
    });
  }

  /* ═══════════════════════════════════════
     DROPDOWN PANELS
  ═══════════════════════════════════════ */
  function openPanel(panel, btn) {
    if (!panel) return;
    panel.classList.add('open');
    btn && btn.setAttribute('aria-expanded', 'true');
  }

  function closePanel(panel, btn) {
    if (!panel) return;
    panel.classList.remove('open');
    btn && btn.setAttribute('aria-expanded', 'false');
  }

  function closeAllPanels() {
    closePanel(infoPanel, btnInfo);
    closePanel(menuPanel, btnMenu);
  }

  function togglePanel(panel, btn, otherPanel, otherBtn) {
    const isOpen = panel && panel.classList.contains('open');
    if (otherPanel && otherPanel.classList.contains('open')) closePanel(otherPanel, otherBtn);
    isOpen ? closePanel(panel, btn) : openPanel(panel, btn);
  }

  if (btnInfo) {
    btnInfo.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel(infoPanel, btnInfo, menuPanel, btnMenu);
    });
  }

  if (btnMenu) {
    btnMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel(menuPanel, btnMenu, infoPanel, btnInfo);
    });
  }

  /* ── Close panels on outside click ── */
  document.addEventListener('click', function (e) {
    const inInfo = infoPanel && (infoPanel.contains(e.target) || btnInfo.contains(e.target));
    const inMenu = menuPanel && (menuPanel.contains(e.target) || btnMenu.contains(e.target));
    const inMobSearch = mobileSearchBar && (
      mobileSearchBar.contains(e.target) || (btnSearchMobile && btnSearchMobile.contains(e.target))
    );

    if (!inInfo) closePanel(infoPanel, btnInfo);
    if (!inMenu) closePanel(menuPanel, btnMenu);
    if (!inMobSearch && mobileSearchBar && mobileSearchBar.classList.contains('open')) {
      closeMobileSearch();
    }
  });

  /* ── Close on Escape ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllPanels();
      closeMobileSearch();
    }
  });

  /* ─────────────────────────────────────
     UTILITY
  ───────────────────────────────────── */
  function isVisible(el) {
    return el && el.offsetParent !== null;
  }

  console.log('[Arabica] scripts.js initialized ✓');

  /* ═══════════════════════════════════════
     PICKED FOR YOU — load more
  ═══════════════════════════════════════ */
  const btnLoadMore   = document.getElementById('btnLoadMore');
  const hiddenItems   = document.querySelectorAll('.picked-item--hidden');
  let   loadedCount   = 0;
  const batchSize     = 2;

  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', function () {
      let shown = 0;
      for (let i = loadedCount; i < hiddenItems.length && shown < batchSize; i++) {
        hiddenItems[i].classList.add('visible');
        // Insert divider before newly shown item
        const divider = document.createElement('div');
        divider.className = 'picked-divider';
        divider.setAttribute('aria-hidden', 'true');
        hiddenItems[i].parentNode.insertBefore(divider, hiddenItems[i]);
        loadedCount++;
        shown++;
      }
      if (loadedCount >= hiddenItems.length) {
        btnLoadMore.classList.add('all-loaded');
        btnLoadMore.setAttribute('aria-disabled', 'true');
      }
    });
  }

  /* ═══════════════════════════════════════
     SHORT ENTRIES — load more (adds new row)
  ═══════════════════════════════════════ */
  const btnEntriesMore = document.getElementById('btnEntriesMore');
  const entriesGrid    = document.querySelector('.entries-grid');

  const moreEntries = [
    { title: 'معاهدة ماستريخت (1992)', author: 'فريق التحرير', img: 'https://images.unsplash.com/photo-1467912407355-245f30185020?w=600&q=80' },
    { title: 'إعلان شومان (1950)',      author: 'فريق التحرير', img: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?w=600&q=80' },
    { title: 'معاهدة روما (1957)',       author: 'فريق التحرير', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80' },
  ];

  let entriesLoaded = false;

  if (btnEntriesMore && entriesGrid) {
    btnEntriesMore.addEventListener('click', function () {
      if (entriesLoaded) return;
      moreEntries.forEach(function (data) {
        const card = document.createElement('a');
        card.href = '#';
        card.className = 'entry-card';
        card.style.animation = 'fadeUp 0.4s ease both';
        card.innerHTML = `
          <div class="entry-img-wrap">
            <img src="${data.img}" alt="${data.title}" loading="lazy" />
          </div>
          <div class="entry-info">
            <h3 class="entry-title">${data.title}</h3>
            <span class="entry-author">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${data.author}
            </span>
          </div>`;
        entriesGrid.appendChild(card);
      });
      entriesLoaded = true;
      btnEntriesMore.classList.add('all-loaded');
    });
  }
  /* ═══════════════════════════════════════
     LATEST ENTRIES — load more rows
  ═══════════════════════════════════════ */
  const btnLatestMore = document.getElementById('btnLatestMore');
  const latestGrid    = document.querySelector('.latest-grid');

  const moreLatestRows = [
    [
      { title: 'الثورة الصناعية',  category: 'تاريخ ومجتمعات', img: 'https://images.unsplash.com/photo-1467912407355-245f30185020?w=200&q=80' },
      { title: 'معاهدة ويستفاليا', category: 'تاريخ ومجتمعات', img: 'https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?w=200&q=80' },
      { title: 'الحرب الباردة',    category: 'تاريخ ومجتمعات', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&q=80' },
    ],
    [
      { title: 'نظرية النسبية',  category: 'علوم وتكنولوجيا', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80' },
      { title: 'الجينوم البشري', category: 'علوم وتكنولوجيا', img: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=200&q=80' },
      { title: 'اختراع المطبعة', category: 'ثقافة وفنون',     img: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=200&q=80' },
    ],
  ];

  let latestLoaded = false;

  if (btnLatestMore && latestGrid) {
    btnLatestMore.addEventListener('click', function () {
      if (latestLoaded) return;
      moreLatestRows.forEach(function (rowData) {
        const row = document.createElement('div');
        row.className = 'latest-row';
        row.style.animation = 'fadeUp 0.35s ease both';
        rowData.forEach(function (data) {
          const item = document.createElement('a');
          item.href = '#';
          item.className = 'latest-item';
          item.innerHTML = `
            <div class="latest-img-wrap">
              <img src="${data.img}" alt="${data.title}" loading="lazy"/>
            </div>
            <div class="latest-meta">
              <span class="latest-category">${data.category}</span>
              <h3 class="latest-title">${data.title}</h3>
            </div>`;
          row.appendChild(item);
        });
        latestGrid.appendChild(row);
      });
      latestLoaded = true;
      btnLatestMore.classList.add('all-loaded');
    });
  }
})();

/* ═══════════════════════════════════════
     CATEGORIES — active state on click
  ═══════════════════════════════════════ */
  document.querySelectorAll('.cat-item').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelectorAll('.cat-item').forEach(function (el) {
        el.classList.remove('active');
      });
      this.classList.add('active');
    });
  });