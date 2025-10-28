// =================================================================================
// CATEGORY PAGE SCRIPT - v9.0 (FINAL - ZERO CLS & HYDRATION RENDER)
// =================================================================================

(function() {
  // Global caches & state
  let allMatchesForSearch = [];
  let categoryMatchesCache = [];
  let currentFilters = { live: false, popular: false, source: 'all' };

  const CATEGORIES = ["all", "football", "basketball", "baseball","motor-sports", "american-football", "afl", "fight", "hockey", "tennis", "rugby", "golf", "billiards", "cricket", "darts", "other"];
  const SOURCES = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "intel"];
  const API_BASE = 'https://streamed.pk/api';

  // DOM Elements
  const matchesContainer = document.getElementById("matches-container");
  const messageContainer = document.getElementById("message-container");
  const titleElement = document.getElementById("category-title");
  const pageTitle = document.querySelector("title");
  const filterBar = document.getElementById("filter-bar");
  const filterToggleBtn = document.getElementById("filter-toggle");
  const activeFiltersContainer = document.getElementById("active-filters-container");
  const filterOptions = document.getElementById("filter-options");
  const categorySelect = document.getElementById("category-select");
  const sourceSelect = document.getElementById("source-select");
  const skeletonLoader = document.getElementById('skeleton-loader');

  // =========================================================================
  // === HELPER & RENDERING FUNCTIONS ===
  // =========================================================================

  const formatViewers = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num;
  };
  
  function buildPosterUrl(match) {
    const placeholder = "../Fallbackimage.webp";
    if (match.teams?.home?.badge && match.teams?.away?.badge) return `${API_BASE}/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`;
    if (match.poster) {
      const p = String(match.poster || "").trim();
      if (p.startsWith("http")) return p;
      if (p.startsWith("/")) return `https://streamed.pk${p.endsWith(".webp")?p:p+".webp"}`;
      return `${API_BASE}/images/proxy/${p}.webp`;
    }
    return placeholder;
  }

  function createMatchCard(match, options = {}) {
    if (!match || !match.id) return document.createDocumentFragment();
    const lazyLoad = options.lazyLoad !== false;
    const card = document.createElement("a");
    card.href = `../Matchinformation/?id=${match.id}`;
    card.classList.add("match-card");
    
    const poster = document.createElement("img");
    poster.classList.add("match-poster");
    poster.alt = match.title || "Match Poster";
    poster.onerror = () => { poster.onerror = null; poster.src = "../Fallbackimage.webp"; };
    if (lazyLoad) {
      poster.loading = "lazy";
      poster.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      poster.dataset.src = buildPosterUrl(match);
    } else {
      poster.src = buildPosterUrl(match);
    }
    
    const date = new Date(match.date);
    const now = new Date();
    const timeFormat = { hour: "numeric", minute: "2-digit", hour12: true };
    let metaText = date.toLocaleTimeString("en-US", timeFormat);
    let statusBadgeHTML;
    const isLive = match.date <= now.getTime();

    if (isLive && match.viewers > 0) {
        const eyeIconSVG = `<svg class="viewer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>`;
        statusBadgeHTML = `<div class="status-badge live viewer-badge"><span>${formatViewers(match.viewers)}</span>${eyeIconSVG}</div>`;
    } else if (isLive) {
        statusBadgeHTML = `<div class="status-badge live">LIVE</div>`;
    } else {
        let badgeText;
        if (date.toDateString() === now.toDateString()) {
            badgeText = date.toLocaleTimeString("en-US", timeFormat);
            metaText = "Today";
        } else {
            badgeText = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
        statusBadgeHTML = `<div class="status-badge date">${badgeText}</div>`;
    }
    
    card.append(poster);
    card.insertAdjacentHTML('beforeend', statusBadgeHTML);

    if (match.popular === true) {
      card.insertAdjacentHTML('beforeend', `<div class="popular-badge" title="Popular Match"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.83 2.33C12.5 1.5 11.5 1.5 11.17 2.33L9.45 7.1C9.33 7.44 9.04 7.7 8.69 7.78L3.65 8.63C2.8 8.75 2.47 9.71 3.06 10.27L6.92 13.9C7.17 14.14 7.28 14.49 7.2 14.85L6.15 19.81C5.97 20.66 6.77 21.3 7.55 20.89L11.79 18.53C12.11 18.35 12.49 18.35 12.81 18.53L17.05 20.89C17.83 21.3 18.63 20.66 18.45 19.81L17.4 14.85C17.32 14.49 17.43 14.14 17.68 13.9L21.54 10.27C22.13 9.71 21.8 8.75 20.95 8.63L15.91 7.78C15.56 7.7 15.27 7.44 15.15 7.1L13.43 2.33Z"/></svg></div>`);
    }
    
    const info = document.createElement("div");
    info.classList.add("match-info");
    info.innerHTML = `
      <div class="match-title">${match.title || "Untitled Match"}</div>
      <div class="match-meta-row">
        <span class="match-category">${match.category ? match.category.charAt(0).toUpperCase() + match.category.slice(1) : "Unknown"}</span>
        <span>${metaText}</span>
      </div>`;
    card.appendChild(info);
    
    return card;
  }

  function initiateDelayedImageLoading() {
    const lazyImages = matchesContainer.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: "200px" });
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // [NEW] Generates a skeleton that mirrors the final layout to prevent CLS
  function generateStructuralSkeleton() {
    let skeletonHTML = '';
    // Create 2 placeholder sections
    for (let i = 0; i < 2; i++) {
        skeletonHTML += `
            <div class="date-section">
                <h2 class="section-header is-loading">&nbsp;</h2>
                <div class="results-grid">
                    ${'<div class="match-card is-loading"></div>'.repeat(4)}
                </div>
            </div>`;
    }
    matchesContainer.innerHTML = skeletonHTML;
  }

  // Renders the full list of matches, replacing the skeleton
  function renderMatches() {
    // Logic from v5.7, but with new sorting from v8.0
    let matchesToRender = [...categoryMatchesCache];
    if (currentFilters.live) {
      matchesToRender = matchesToRender.filter(match => match.date <= Date.now());
    }
    if (currentFilters.source !== 'all') {
      matchesToRender = matchesToRender.filter(match => 
        match.sources && match.sources.some(s => s.source.toLowerCase() === currentFilters.source)
      );
    }
    if (currentFilters.popular) {
      matchesToRender = matchesToRender.filter(match => match.popular === true);
    }
    
    matchesContainer.innerHTML = "";
    messageContainer.style.display = 'none';

    if (matchesToRender.length === 0) {
      messageContainer.textContent = "No matches found with the selected filters.";
      messageContainer.style.display = 'block';
      return;
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const liveWithViewers = matchesToRender.filter(m => m.viewers > 0);
    const otherLiveNoViewers = matchesToRender.filter(m => m.date <= now.getTime() && !(m.viewers > 0));
    const upcoming = matchesToRender.filter(m => m.date > now.getTime());
    const old247 = otherLiveNoViewers.filter(m => m.date < todayStart.getTime());
    
    liveWithViewers.sort((a, b) => b.viewers - a.viewers);

    const groupedUpcoming = upcoming.reduce((acc, match) => {
        const dateKey = new Date(match.date).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(match);
        return acc;
    }, {});
    
    const fragment = document.createDocumentFragment();

    const todaySection = document.createElement('div');
    todaySection.className = 'date-section';
    todaySection.innerHTML = `<h2 class="section-header">TODAY <span class="date-day">${now.toLocaleDateString([], { day: 'numeric', month: 'short' }).toUpperCase()}</span></h2>`;
    const todayGrid = document.createElement('div');
    todayGrid.className = 'results-grid';
    
    liveWithViewers.forEach(match => todayGrid.appendChild(createMatchCard(match)));
    const todayKey = now.toISOString().split('T')[0];
    if (groupedUpcoming[todayKey]) {
        groupedUpcoming[todayKey].sort((a,b) => a.date - b.date).forEach(match => todayGrid.appendChild(createMatchCard(match)));
        delete groupedUpcoming[todayKey];
    }
    if (todayGrid.hasChildNodes()) {
      todaySection.appendChild(todayGrid);
      fragment.appendChild(todaySection);
    }

    Object.keys(groupedUpcoming).sort().forEach(dateKey => {
        const date = new Date(dateKey + 'T00:00:00');
        const dayLabel = date.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
        const dateLabel = date.toLocaleDateString([], { day: 'numeric', month: 'short' }).toUpperCase();
        const section = document.createElement('div');
        section.className = 'date-section';
        section.innerHTML = `<h2 class="section-header">${dayLabel} <span class="date-day">${dateLabel}</span></h2>`;
        const grid = document.createElement('div');
        grid.className = 'results-grid';
        groupedUpcoming[dateKey].sort((a,b) => a.date - b.date).forEach(match => grid.appendChild(createMatchCard(match)));
        section.appendChild(grid);
        fragment.appendChild(section);
    });

    if (old247.length > 0) {
        const section = document.createElement('div');
        section.className = 'date-section';
        section.innerHTML = `<h2 class="section-header">24/7 FREE</h2>`;
        const grid = document.createElement('div');
        grid.className = 'results-grid';
        old247.sort((a,b) => b.date - a.date).forEach(match => grid.appendChild(createMatchCard(match)));
        section.appendChild(grid);
        fragment.appendChild(section);
    }
    
    matchesContainer.appendChild(fragment);

    updateActiveFiltersUI();
    initiateDelayedImageLoading();
  }

  // URL & UI STATE MANAGEMENT (Restored from v5.7)
  function updateUrlWithFilters(){const params=new URLSearchParams;currentFilters.live&&params.set("live","true"),currentFilters.popular&&params.set("popular","true"),"all"!==currentFilters.source&&params.set("source",currentFilters.source);const queryString=params.toString(),newUrl=`${window.location.pathname}${queryString?`?${queryString}`:""}${window.location.hash}`;history.replaceState(null,"",newUrl)}
  function updateActiveFiltersUI(){activeFiltersContainer.innerHTML="";const createTag=(key,text)=>{const tag=document.createElement("div");tag.className="active-filter-tag",tag.dataset.filterKey=key,tag.innerHTML=`<span>${text}</span><button class="remove-filter-btn" data-filter-key="${key}">&times;</button>`,activeFiltersContainer.appendChild(tag)};currentFilters.live&&createTag("live","Live"),currentFilters.popular&&createTag("popular","Popular"),"all"!==currentFilters.source&&createTag("source",`${currentFilters.source}`)}

  // EVENT LISTENERS & ROUTING (Restored from v5.7)
  function setupEventListeners(){filterToggleBtn.addEventListener("click",()=>filterBar.classList.toggle("is-expanded")),filterOptions.addEventListener("click",e=>{const target=e.target.closest(".filter-btn");if(target){const filterKey=target.dataset.filter;currentFilters[filterKey]=!currentFilters[filterKey],target.classList.toggle("active",currentFilters[filterKey]),updateUrlWithFilters(),renderMatches()}}),sourceSelect.addEventListener("change",()=>{currentFilters.source=sourceSelect.value,updateUrlWithFilters(),renderMatches()}),
  categorySelect.addEventListener('change', () => {
    window.location.hash = `/${categorySelect.value.charAt(0).toUpperCase() + categorySelect.value.slice(1)}`;
  }),
  activeFiltersContainer.addEventListener("click",e=>{const target=e.target.closest(".remove-filter-btn");if(target){const key=target.dataset.filterKey;"boolean"==typeof currentFilters[key]?(currentFilters[key]=!1,document.querySelector(`.filter-btn[data-filter="${key}"]`)?.classList.remove("active")):(currentFilters[key]="all",sourceSelect.value="all"),updateUrlWithFilters(),renderMatches()}})}
  
  function populateFilterDropdowns(currentCategory){
    categorySelect.innerHTML = CATEGORIES.map(cat => {
      const isSelected = cat === currentCategory ? 'selected' : '';
      const displayText = cat === 'all' ? 'All Sports' : cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      return `<option value="${cat}" ${isSelected}>${displayText}</option>`;
    }).join('');
    sourceSelect.innerHTML='<option value="all">All Sources</option>',SOURCES.forEach(source=>{const capitalizedSource=source.charAt(0).toUpperCase()+source.slice(1);sourceSelect.innerHTML+=`<option value="${source}">${capitalizedSource}</option>`}),sourceSelect.value=currentFilters.source
  }
  
  // [OPTIMIZED] Main function with Hydration
  async function handleRouteChange() {
    let categoryName = window.location.hash.substring(2).toLowerCase() || "all";
    if (!CATEGORIES.includes(categoryName)) categoryName = "all";
    
    const urlParams = new URLSearchParams(window.location.search);
    currentFilters = { live: urlParams.get('live') === 'true', popular: urlParams.get('popular') === 'true', source: urlParams.get('source') || 'all' };

    const formattedName = (categoryName === 'all' ? 'All Sports' : categoryName.replace(/-/g, ' '));
    pageTitle.textContent = `buffstreams.world ${formattedName.replace(/\b\w/g, l => l.toUpperCase())} Matches`;
    titleElement.textContent = pageTitle.textContent;
    
    generateStructuralSkeleton(); // Use the structural skeleton to prevent CLS
    messageContainer.style.display = "none";
    document.querySelector('.filter-btn[data-filter="live"]').classList.toggle('active', currentFilters.live);
    document.querySelector('.filter-btn[data-filter="popular"]').classList.toggle('active', currentFilters.popular);
    updateActiveFiltersUI();

    try {
      // STAGE 1: Initial Fetch & Render
      const apiUrl = (categoryName === 'all') ? `${API_BASE}/matches/all` : `${API_BASE}/matches/${categoryName}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      categoryMatchesCache = (await response.json()).map(m => ({...m, viewers: 0 }));
      
      populateFilterDropdowns(categoryName);
      renderMatches(); // Initial render with date sorting is fast
      
      // STAGE 2: Background Hydration with Viewer Data
      const liveMatches = categoryMatchesCache.filter(match => match.date <= Date.now());
      if (liveMatches.length > 0) {
        // This process now runs in the background without blocking the view
        const streamPromises = liveMatches.flatMap(match => match.sources.map(source => fetch(`${API_BASE}/stream/${source.source}/${source.id}`).then(res => res.ok ? res.json() : []).then(streams => ({ matchId: match.id, streams }))));
        const results = await Promise.allSettled(streamPromises);
        const viewerCounts = {};
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const { matchId, streams } = result.value;
            if (!viewerCounts[matchId]) viewerCounts[matchId] = 0;
            streams.forEach(stream => { if (stream.viewers) viewerCounts[matchId] += stream.viewers; });
          }
        });

        let viewersFound = false;
        categoryMatchesCache.forEach(match => {
          if (viewerCounts[match.id] > 0) {
            match.viewers = viewerCounts[match.id];
            viewersFound = true;
          }
        });

        if (viewersFound) {
           renderMatches(); // Re-render ONLY if new viewer data requires a sort change
        }
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
      matchesContainer.innerHTML = ''; // Clear skeleton on error
      messageContainer.textContent = "Could not load matches. Please try again.",
      messageContainer.style.display = "block";
    }
  }

  // SEARCH FUNCTIONALITY (Restored from v5.7)
  async function fetchAllMatchesForSearch(){try{const res=await fetch(`${API_BASE}/matches/all`);if(!res.ok)throw new Error("Failed to fetch search data");const allMatches=await res.json();const map=new Map;allMatches.forEach(m=>map.set(m.id,m)),allMatchesForSearch=Array.from(map.values())}catch(err){console.error("Error fetching search data:",err)}}
  function setupSearch(){const searchInput=document.getElementById("search-input"),searchOverlay=document.getElementById("search-overlay"),overlayInput=document.getElementById("overlay-search-input"),overlayResults=document.getElementById("overlay-search-results"),searchClose=document.getElementById("search-close");if(searchInput){searchInput.addEventListener("focus",()=>{searchOverlay.style.display="flex",overlayInput.value=searchInput.value,overlayInput.focus(),overlayResults.innerHTML=""}),searchClose.addEventListener("click",()=>{searchOverlay.style.display="none"}),searchOverlay.addEventListener("click",e=>{e.target.closest(".search-overlay-content")||(searchOverlay.style.display="none")}),overlayInput.addEventListener("input",function(){const q=this.value.trim().toLowerCase();if(overlayResults.innerHTML="",!q)return;const filtered=allMatchesForSearch.filter(m=>(m.title||"").toLowerCase().includes(q)||(m.league||"").toLowerCase().includes(q)||(m.teams?.home?.name||"").toLowerCase().includes(q)||(m.teams?.away?.name||"").toLowerCase().includes(q));filtered.slice(0,12).forEach(match=>{const item=document.createElement("div");item.className="search-result-item",item.appendChild(createMatchCard(match,{lazyLoad:!1})),overlayResults.appendChild(item)})}),overlayInput.addEventListener("keydown",e=>{if("Enter"===e.key){const q=overlayInput.value.trim();q&&(window.location.href=`../SearchResult/?q=${encodeURIComponent(q)}`)}})}}

  // === START THE APP ===
  setupEventListeners();
  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('DOMContentLoaded', handleRouteChange);
  fetchAllMatchesForSearch().then(setupSearch);

})();
