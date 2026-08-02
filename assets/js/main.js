
(() => {
  "use strict";

  const config = window.PRAETORIAN_CONFIG || {};
  const repoPath = "Moicanox/Praetorian-C2-Vehicle";
  const apiBase = `https://api.github.com/repos/${repoPath}`;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const menuButton = qs(".menu-toggle");
  const nav = qs(".nav-links");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    qsa("a", nav).forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  qsa("[data-config-link]").forEach(element => {
    const key = element.dataset.configLink;
    const value = config[key];
    if (value) {
      element.href = value;
      element.classList.remove("btn-disabled");
      element.removeAttribute("aria-disabled");
      if (element.dataset.readyLabel) element.textContent = element.dataset.readyLabel;
    } else {
      element.href = "#";
      element.classList.add("btn-disabled");
      element.setAttribute("aria-disabled", "true");
    }
  });

  const trailer = qs("[data-trailer]");
  if (trailer && config.trailerEmbedUrl) {
    trailer.innerHTML = `<iframe src="${escapeHtml(config.trailerEmbedUrl)}" title="Praetorian C2 Vehicle trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  const qrBox = qs("[data-paypal-qr]");
  if (qrBox && config.paypalQrImage) {
    qrBox.innerHTML = `<img src="${escapeHtml(config.paypalQrImage)}" alt="PayPal donation QR code">`;
  }

  const fadeItems = qsa(".fade-up");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeItems.forEach(item => observer.observe(item));
  } else {
    fadeItems.forEach(item => item.classList.add("visible"));
  }

  const releaseTargets = qsa("[data-latest-release]");
  const assetTarget = qs("[data-release-assets]");
  const changelogTarget = qs("[data-changelog]");

  if (releaseTargets.length || assetTarget) loadLatestRelease();
  if (changelogTarget) loadChangelog();

  async function loadLatestRelease() {
    try {
      const response = await fetch(`${apiBase}/releases/latest`, {
        headers: { "Accept": "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error(`GitHub API ${response.status}`);
      const release = await response.json();
      renderReleaseSummary(release);
      if (assetTarget) renderAssets(release.assets || [], release);
    } catch (error) {
      releaseTargets.forEach(target => {
        target.innerHTML = `<span class="release-version">Release not published yet</span><br><span class="release-status">The download button opens the repository Releases page.</span>`;
      });
      if (assetTarget) {
        assetTarget.innerHTML = `<div class="status-message">No public release assets are available yet. Publish the installer, manuals, configuration spreadsheets and plugins in GitHub Releases; this page will list them automatically.</div>`;
      }
    }
  }

  function renderReleaseSummary(release) {
    const version = release.name || release.tag_name || "Latest release";
    const date = release.published_at ? new Intl.DateTimeFormat("en", { year:"numeric", month:"short", day:"numeric" }).format(new Date(release.published_at)) : "";
    releaseTargets.forEach(target => {
      target.innerHTML = `<span class="release-version">${escapeHtml(version)}</span>${date ? `<br><span class="release-status">Published ${escapeHtml(date)}</span>` : ""}`;
    });
  }

  function renderAssets(assets, release) {
    if (!assets.length) {
      assetTarget.innerHTML = `<div class="status-message">The latest release exists, but it has no downloadable assets yet.</div>`;
      return;
    }
    assetTarget.innerHTML = assets.map(asset => {
      const ext = fileExtension(asset.name);
      const size = formatBytes(asset.size || 0);
      const label = classifyAsset(asset.name, ext);
      return `
        <article class="download-item">
          <div class="file-type">${escapeHtml(ext || "FILE")}</div>
          <div>
            <span class="badge">${escapeHtml(label)}</span>
            <h3>${escapeHtml(asset.name)}</h3>
            <p>${escapeHtml(size)} · ${Number(asset.download_count || 0).toLocaleString()} downloads</p>
          </div>
          <a class="btn" href="${escapeHtml(asset.browser_download_url)}">Download</a>
        </article>`;
    }).join("");
  }

  async function loadChangelog() {
    try {
      const response = await fetch(`${apiBase}/releases?per_page=10`, {
        headers: { "Accept": "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error(`GitHub API ${response.status}`);
      const releases = await response.json();
      if (!releases.length) throw new Error("No releases");
      changelogTarget.innerHTML = releases.map(release => {
        const title = release.name || release.tag_name;
        const date = release.published_at ? new Intl.DateTimeFormat("en", { year:"numeric", month:"long", day:"numeric" }).format(new Date(release.published_at)) : "";
        const body = simpleMarkdown(release.body || "Release notes not provided.");
        return `
          <article class="timeline-item">
            <div class="card">
              <div class="timeline-meta">${escapeHtml(date)} · ${escapeHtml(release.tag_name || "")}</div>
              <h3>${escapeHtml(title)}</h3>
              <div class="timeline-body">${body}</div>
              <p><a class="btn" href="${escapeHtml(release.html_url)}">Open release</a></p>
            </div>
          </article>`;
      }).join("");
    } catch (error) {
      changelogTarget.innerHTML = `
        <article class="timeline-item">
          <div class="card">
            <div class="timeline-meta">Initial publication</div>
            <h3>Release history will appear here</h3>
            <div class="timeline-body"><p>When GitHub Releases are published, this page will load the latest release notes automatically.</p></div>
          </div>
        </article>`;
    }
  }

  function fileExtension(name) {
    const match = String(name).match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toUpperCase() : "FILE";
  }

  function classifyAsset(name, ext) {
    const lower = name.toLowerCase();
    if (["EXE", "MSI"].includes(ext)) return "Windows installer";
    if (ext === "APK") return "ATAK plugin";
    if (["XLSX", "XLS", "CSV"].includes(ext)) return "Configuration";
    if (ext === "PDF" && lower.includes("manual")) return "Manual";
    if (ext === "PDF" && (lower.includes("datasheet") || lower.includes("data-sheet"))) return "Data sheet";
    if (ext === "PDF") return "Document";
    if (["ZIP", "7Z"].includes(ext)) return "Package";
    return "Release asset";
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  function simpleMarkdown(text) {
    const escaped = escapeHtml(text);
    const lines = escaped.split(/\r?\n/);
    let html = "";
    let inList = false;
    for (const line of lines) {
      const item = line.match(/^[-*]\s+(.+)/);
      if (item) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${item[1]}</li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        if (line.trim()) html += `<p>${line}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    })[char]);
  }
})();
