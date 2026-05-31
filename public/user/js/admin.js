// ================================================
// QBIT SPORTS - Admin Panel Logic
// Allows editing page content from the admin panel
// Content is stored in data/content.json
// ================================================

// Current content data loaded from JSON
let contentData = null;

// ================================================
// LOAD CONTENT - Fetch data/content.json
// ================================================
async function loadContent() {
    try {
        const response = await fetch('data/content.json');
        contentData = await response.json();
    } catch (e) {
        console.warn('Could not load content.json, using defaults');
        contentData = getDefaultContent();
    }
}
window.loadContent = loadContent;

// Default content fallback
function getDefaultContent() {
    return {
        appName: "QBIT SPORTS",
        tagline: "Play with Skill. Win Big.",
        logoText: "QS",
        pages: {
            home: { title: "Home", heading: "Welcome to QBIT SPORTS", subheading: "Join tournaments, win prizes!", heroImage: "", ctaButtonText: "Join Now", ctaButtonLink: "#matches" },
            matches: { title: "My Matches", heading: "Your Tournaments", subheading: "Track your matches", emptyJoined: "No joined matches yet", emptyCompleted: "No completed matches" },
            rank: { title: "Leaderboard", heading: "Tournament Results", subheading: "See who dominated", emptyState: "No results yet" },
            wallet: { title: "My Wallet", heading: "Your Balance", subheading: "Manage your earnings", minDeposit: "10", minWithdraw: "100", depositButton: "Deposit Money", withdrawButton: "Withdraw Money" },
            profile: { title: "My Profile", heading: "Your Profile", subheading: "Manage your account", editButton: "Edit Profile" },
            settings: { title: "Settings", heading: "App Settings", subheading: "Customize your experience", darkMode: "Dark Mode", clearCache: "Clear Cache", shareApp: "Share App", rateUs: "Rate Us", about: "About QBIT SPORTS", privacy: "Privacy Policy", help: "Help & Support", telegram: "Telegram Channel", logout: "Logout" }
        },
        footer: { copyright: "QBIT SPORTS. All rights reserved.", version: "v1.0" },
        ui: { primaryColor: "#007aff", successColor: "#34c759", dangerColor: "#ff3b30", warningColor: "#ff9500", maxWidth: "480px" }
    };
}

// ================================================
// OPEN / CLOSE ADMIN PANEL
// ================================================
function openAdminPanel() {
    loadContent().then(() => {
        renderContentEditor();
        renderPagesEditor();
        renderUIEditor();
        document.getElementById('admin-page').style.display = 'flex';
    });
}
window.openAdminPanel = openAdminPanel;

function closeAdminPanel() {
    document.getElementById('admin-page').style.display = 'none';
}
window.closeAdminPanel = closeAdminPanel;

// ================================================
// SWITCH ADMIN TABS
// ================================================
function switchAdminTab(tab, el) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById('admin-' + tab + '-section').classList.add('active');
}
window.switchAdminTab = switchAdminTab;

// ================================================
// RENDER CONTENT EDITOR - Edit app name, tagline, etc.
// ================================================
function renderContentEditor() {
    const container = document.getElementById('admin-content-section');
    if (!container || !contentData) return;
    container.innerHTML = `
        <div class="admin-card">
            <h3><i class="fas fa-tag"></i> App Identity</h3>
            <div class="admin-field">
                <label>App Name</label>
                <input type="text" id="ac-appName" value="${contentData.appName || ''}">
            </div>
            <div class="admin-field">
                <label>Tagline</label>
                <input type="text" id="ac-tagline" value="${contentData.tagline || ''}">
            </div>
            <div class="admin-field">
                <label>Logo Text (fallback)</label>
                <input type="text" id="ac-logoText" value="${contentData.logoText || ''}">
            </div>
            <button class="admin-save-btn" onclick="saveContentIdentity()"><i class="fas fa-save"></i> Save Identity</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-home"></i> Home Page</h3>
            <div class="admin-field"><label>Page Title</label><input type="text" id="ac-home-title" value="${contentData.pages?.home?.title || ''}"></div>
            <div class="admin-field"><label>Heading</label><input type="text" id="ac-home-heading" value="${contentData.pages?.home?.heading || ''}"></div>
            <div class="admin-field"><label>Subheading</label><input type="text" id="ac-home-subheading" value="${contentData.pages?.home?.subheading || ''}"></div>
            <div class="admin-field"><label>Hero Image URL</label><input type="text" id="ac-home-heroImage" value="${contentData.pages?.home?.heroImage || ''}" placeholder="https://..."></div>
            <div class="admin-field"><label>CTA Button Text</label><input type="text" id="ac-home-ctaText" value="${contentData.pages?.home?.ctaButtonText || ''}"></div>
            <div class="admin-field"><label>CTA Button Link</label><input type="text" id="ac-home-ctaLink" value="${contentData.pages?.home?.ctaButtonLink || ''}" placeholder="#matches"></div>
            <button class="admin-save-btn" onclick="savePageContent('home')"><i class="fas fa-save"></i> Save Home</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-gamepad"></i> Matches Page</h3>
            <div class="admin-field"><label>Page Title</label><input type="text" id="ac-matches-title" value="${contentData.pages?.matches?.title || ''}"></div>
            <div class="admin-field"><label>Heading</label><input type="text" id="ac-matches-heading" value="${contentData.pages?.matches?.heading || ''}"></div>
            <div class="admin-field"><label>Subheading</label><input type="text" id="ac-matches-subheading" value="${contentData.pages?.matches?.subheading || ''}"></div>
            <div class="admin-field"><label>Empty Joined Text</label><input type="text" id="ac-matches-emptyJoined" value="${contentData.pages?.matches?.emptyJoined || ''}"></div>
            <div class="admin-field"><label>Empty Completed Text</label><input type="text" id="ac-matches-emptyCompleted" value="${contentData.pages?.matches?.emptyCompleted || ''}"></div>
            <button class="admin-save-btn" onclick="savePageContent('matches')"><i class="fas fa-save"></i> Save Matches</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-trophy"></i> Rank Page</h3>
            <div class="admin-field"><label>Page Title</label><input type="text" id="ac-rank-title" value="${contentData.pages?.rank?.title || ''}"></div>
            <div class="admin-field"><label>Heading</label><input type="text" id="ac-rank-heading" value="${contentData.pages?.rank?.heading || ''}"></div>
            <div class="admin-field"><label>Subheading</label><input type="text" id="ac-rank-subheading" value="${contentData.pages?.rank?.subheading || ''}"></div>
            <div class="admin-field"><label>Empty State Text</label><input type="text" id="ac-rank-emptyState" value="${contentData.pages?.rank?.emptyState || ''}"></div>
            <button class="admin-save-btn" onclick="savePageContent('rank')"><i class="fas fa-save"></i> Save Rank</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-wallet"></i> Wallet Page</h3>
            <div class="admin-field"><label>Page Title</label><input type="text" id="ac-wallet-title" value="${contentData.pages?.wallet?.title || ''}"></div>
            <div class="admin-field"><label>Heading</label><input type="text" id="ac-wallet-heading" value="${contentData.pages?.wallet?.heading || ''}"></div>
            <div class="admin-field"><label>Subheading</label><input type="text" id="ac-wallet-subheading" value="${contentData.pages?.wallet?.subheading || ''}"></div>
            <div class="admin-field"><label>Min Deposit (₹)</label><input type="number" id="ac-wallet-minDeposit" value="${contentData.pages?.wallet?.minDeposit || ''}"></div>
            <div class="admin-field"><label>Min Withdraw (₹)</label><input type="number" id="ac-wallet-minWithdraw" value="${contentData.pages?.wallet?.minWithdraw || ''}"></div>
            <div class="admin-field"><label>Deposit Button Text</label><input type="text" id="ac-wallet-depositButton" value="${contentData.pages?.wallet?.depositButton || ''}"></div>
            <div class="admin-field"><label>Withdraw Button Text</label><input type="text" id="ac-wallet-withdrawButton" value="${contentData.pages?.wallet?.withdrawButton || ''}"></div>
            <button class="admin-save-btn" onclick="savePageContent('wallet')"><i class="fas fa-save"></i> Save Wallet</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-user"></i> Profile Page</h3>
            <div class="admin-field"><label>Page Title</label><input type="text" id="ac-profile-title" value="${contentData.pages?.profile?.title || ''}"></div>
            <div class="admin-field"><label>Heading</label><input type="text" id="ac-profile-heading" value="${contentData.pages?.profile?.heading || ''}"></div>
            <div class="admin-field"><label>Subheading</label><input type="text" id="ac-profile-subheading" value="${contentData.pages?.profile?.subheading || ''}"></div>
            <div class="admin-field"><label>Edit Button Text</label><input type="text" id="ac-profile-editButton" value="${contentData.pages?.profile?.editButton || ''}"></div>
            <button class="admin-save-btn" onclick="savePageContent('profile')"><i class="fas fa-save"></i> Save Profile</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-cog"></i> Settings Page</h3>
            <div class="admin-field"><label>Page Title</label><input type="text" id="ac-settings-title" value="${contentData.pages?.settings?.title || ''}"></div>
            <div class="admin-field"><label>Heading</label><input type="text" id="ac-settings-heading" value="${contentData.pages?.settings?.heading || ''}"></div>
            <div class="admin-field"><label>Subheading</label><input type="text" id="ac-settings-subheading" value="${contentData.pages?.settings?.subheading || ''}"></div>
            <button class="admin-save-btn" onclick="savePageContent('settings')"><i class="fas fa-save"></i> Save Settings</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-info-circle"></i> Footer</h3>
            <div class="admin-field"><label>Copyright Text</label><input type="text" id="ac-footer-copyright" value="${contentData.footer?.copyright || ''}"></div>
            <div class="admin-field"><label>Version</label><input type="text" id="ac-footer-version" value="${contentData.footer?.version || ''}"></div>
            <button class="admin-save-btn" onclick="saveFooterContent()"><i class="fas fa-save"></i> Save Footer</button>
        </div>
    `;
}

// ================================================
// RENDER PAGES EDITOR - Manage page sections
// ================================================
function renderPagesEditor() {
    const container = document.getElementById('admin-pages-section');
    if (!container || !contentData) return;
    container.innerHTML = `
        <div class="admin-card">
            <h3><i class="fas fa-file-alt"></i> Page Management</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:15px;">Edit the content and layout of each page section. Use the Content tab to edit text.</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f9f9fb; border-radius:10px;">
                    <div><strong style="font-size:14px;">Home</strong><div style="font-size:11px; color:var(--text-muted);">Tournaments, Polls, Hero</div></div>
                    <div style="color:var(--success); font-size:12px; font-weight:700;"><i class="fas fa-check-circle"></i> Active</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f9f9fb; border-radius:10px;">
                    <div><strong style="font-size:14px;">Matches</strong><div style="font-size:11px; color:var(--text-muted);">Joined & Completed</div></div>
                    <div style="color:var(--success); font-size:12px; font-weight:700;"><i class="fas fa-check-circle"></i> Active</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f9f9fb; border-radius:10px;">
                    <div><strong style="font-size:14px;">Rank</strong><div style="font-size:11px; color:var(--text-muted);">Leaderboard & Results</div></div>
                    <div style="color:var(--success); font-size:12px; font-weight:700;"><i class="fas fa-check-circle"></i> Active</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f9f9fb; border-radius:10px;">
                    <div><strong style="font-size:14px;">Wallet</strong><div style="font-size:11px; color:var(--text-muted);">Balance, Deposit, Withdraw</div></div>
                    <div style="color:var(--success); font-size:12px; font-weight:700;"><i class="fas fa-check-circle"></i> Active</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f9f9fb; border-radius:10px;">
                    <div><strong style="font-size:14px;">Profile</strong><div style="font-size:11px; color:var(--text-muted);">User info, Avatar, Stats</div></div>
                    <div style="color:var(--success); font-size:12px; font-weight:700;"><i class="fas fa-check-circle"></i> Active</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f9f9fb; border-radius:10px;">
                    <div><strong style="font-size:14px;">Settings</strong><div style="font-size:11px; color:var(--text-muted);">Dark mode, Links, About</div></div>
                    <div style="color:var(--success); font-size:12px; font-weight:700;"><i class="fas fa-check-circle"></i> Active</div>
                </div>
            </div>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-code"></i> JSON Content Data</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Raw content data (advanced). Edit and click Save.</p>
            <div class="admin-field">
                <label>Content JSON</label>
                <textarea id="ac-raw-json" style="min-height:300px; font-family:monospace; font-size:12px;">${JSON.stringify(contentData, null, 2)}</textarea>
            </div>
            <button class="admin-save-btn" onclick="saveRawJSON()"><i class="fas fa-save"></i> Save JSON</button>
        </div>
    `;
}

// ================================================
// RENDER UI SETTINGS EDITOR - Colors, layout
// ================================================
function renderUIEditor() {
    const container = document.getElementById('admin-ui-section');
    if (!container || !contentData) return;
    container.innerHTML = `
        <div class="admin-card">
            <h3><i class="fas fa-palette"></i> UI Colors</h3>
            <div class="admin-field"><label>Primary Color</label><input type="color" id="ac-ui-primary" value="${contentData.ui?.primaryColor || '#007aff'}" style="height:40px;"></div>
            <div class="admin-field"><label>Success Color</label><input type="color" id="ac-ui-success" value="${contentData.ui?.successColor || '#34c759'}" style="height:40px;"></div>
            <div class="admin-field"><label>Danger Color</label><input type="color" id="ac-ui-danger" value="${contentData.ui?.dangerColor || '#ff3b30'}" style="height:40px;"></div>
            <div class="admin-field"><label>Warning Color</label><input type="color" id="ac-ui-warning" value="${contentData.ui?.warningColor || '#ff9500'}" style="height:40px;"></div>
            <div class="admin-field"><label>Max Width (px)</label><input type="text" id="ac-ui-maxWidth" value="${contentData.ui?.maxWidth || '480px'}"></div>
            <button class="admin-save-btn" onclick="saveUIColors()"><i class="fas fa-save"></i> Save UI Colors</button>
        </div>
        <div class="admin-card">
            <h3><i class="fas fa-eye"></i> Preview</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Click to preview color changes on the site.</p>
            <button class="admin-save-btn" onclick="previewColors()" style="background:var(--primary);"><i class="fas fa-eye"></i> Preview Colors</button>
        </div>
    `;
}

// ================================================
// SAVE FUNCTIONS
// ================================================

// Save app identity (name, tagline, logo)
function saveContentIdentity() {
    contentData.appName = document.getElementById('ac-appName').value;
    contentData.tagline = document.getElementById('ac-tagline').value;
    contentData.logoText = document.getElementById('ac-logoText').value;
    saveToFile();
    // Apply changes instantly
    document.title = contentData.appName;
    const headerName = document.getElementById('header-app-name');
    if (headerName) headerName.innerText = contentData.appName;
    const logoText = document.getElementById('header-app-logo-text');
    if (logoText) logoText.innerText = contentData.logoText;
    showToast("Identity updated!");
}
window.saveContentIdentity = saveContentIdentity;

// Save page content for a specific page
function savePageContent(pageName) {
    const fields = ['title', 'heading', 'subheading', 'emptyJoined', 'emptyCompleted', 'emptyState', 'minDeposit', 'minWithdraw', 'depositButton', 'withdrawButton', 'editButton', 'heroImage', 'ctaButtonText', 'ctaButtonLink'];
    fields.forEach(field => {
        const el = document.getElementById('ac-' + pageName + '-' + field);
        if (el && contentData.pages && contentData.pages[pageName]) {
            contentData.pages[pageName][field] = el.value;
        }
    });
    saveToFile();
    showToast(pageName.charAt(0).toUpperCase() + pageName.slice(1) + ' page updated!');
}
window.savePageContent = savePageContent;

// Save footer content
function saveFooterContent() {
    contentData.footer.copyright = document.getElementById('ac-footer-copyright').value;
    contentData.footer.version = document.getElementById('ac-footer-version').value;
    saveToFile();
    showToast("Footer updated!");
}
window.saveFooterContent = saveFooterContent;

// Save UI colors
function saveUIColors() {
    contentData.ui.primaryColor = document.getElementById('ac-ui-primary').value;
    contentData.ui.successColor = document.getElementById('ac-ui-success').value;
    contentData.ui.dangerColor = document.getElementById('ac-ui-danger').value;
    contentData.ui.warningColor = document.getElementById('ac-ui-warning').value;
    contentData.ui.maxWidth = document.getElementById('ac-ui-maxWidth').value;
    saveToFile();
    showToast("UI colors updated!");
}
window.saveUIColors = saveUIColors;

// Save raw JSON
function saveRawJSON() {
    try {
        const raw = document.getElementById('ac-raw-json').value;
        contentData = JSON.parse(raw);
        saveToFile();
        showToast("JSON updated!");
        renderContentEditor();
        renderPagesEditor();
        renderUIEditor();
    } catch (e) {
        showToast("Invalid JSON: " + e.message, "error");
    }
}
window.saveRawJSON = saveRawJSON;

// Preview colors on the live site
function previewColors() {
    const root = document.documentElement;
    root.style.setProperty('--primary', contentData.ui.primaryColor);
    root.style.setProperty('--success', contentData.ui.successColor);
    root.style.setProperty('--danger', contentData.ui.dangerColor);
    root.style.setProperty('--warning', contentData.ui.warningColor);
    showToast("Colors previewed! Save to make permanent.");
}
window.previewColors = previewColors;

// ================================================
// SAVE TO FILE - Saves content to data/content.json
// In production, this would be a server API call.
// For static hosting, we use localStorage as a backup
// and show instructions to download the updated JSON.
// ================================================
function saveToFile() {
    // Save to localStorage as backup
    try {
        localStorage.setItem('qbit_content', JSON.stringify(contentData));
    } catch (e) {}

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(contentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Store the URL for download
    window._lastContentDownload = url;
}

// ================================================
// INITIALIZE - Load content on page load
// ================================================
document.addEventListener('DOMContentLoaded', function () {
    loadContent();
});
