function toggleDarkMode() {
    const isDark = document.getElementById('dark-mode-toggle').checked;
    if(isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('arena_theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('arena_theme', 'light');
    }
}
window.toggleDarkMode = toggleDarkMode;

function loadTheme() {
    const savedTheme = localStorage.getItem('arena_theme') || 'light';
    const toggle = document.getElementById('dark-mode-toggle');
    if(savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(toggle) toggle.checked = true;
    } else {
        document.documentElement.removeAttribute('data-theme');
        if(toggle) toggle.checked = false;
    }
}

function clearCache() {
    if(confirm("Clear all app data and reload?")) {
        localStorage.removeItem('arena_uid');
        localStorage.removeItem('arena_theme');
        window.location.reload();
    }
}
window.clearCache = clearCache;

function confirmLogout() { if(confirm("Are you sure you want to logout?")) logoutUser(); }
window.confirmLogout = confirmLogout;

function openAdminLink(type) {
    let url = "";
    if(type === 'telegram') url = window.adminSettings?.telegram;
    if(type === 'help') url = window.adminSettings?.help;
    if(url && url.trim() !== "") window.open(url, '_blank');
    else showToast("Link not updated by admin yet!", "error");
}
window.openAdminLink = openAdminLink;

function shareApp() {
    if(navigator.share) {
        navigator.share({ title: 'QBIT SPORTS', text: 'Check out QBIT SPORTS - Play & Win tournaments!', url: window.location.origin + '/user/home.html' })
        .catch(() => {});
    } else {
        const url = window.location.origin + '/user/home.html';
        navigator.clipboard.writeText(url).then(() => { showToast("Link copied to clipboard!"); }).catch(() => { showToast("Share not supported", "error"); });
    }
}
window.shareApp = shareApp;

function rateApp() {
    showToast("Rate us on the Play Store!");
    window.open('https://play.google.com/store', '_blank');
}
window.rateApp = rateApp;

function showAbout() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="background:var(--card-bg);width:90%;max-width:380px;border-radius:24px;padding:30px 24px;text-align:center;animation:slideUp 0.3s ease-out;">' +
        '<div style="width:70px;height:70px;border-radius:20px;background:linear-gradient(135deg,var(--primary),#34aeff);display:flex;align-items:center;justify-content:center;margin:0 auto 15px;box-shadow:0 8px 25px rgba(0,122,255,0.3);"><span style="color:white;font-weight:900;font-size:22px;">QS</span></div>' +
        '<h2 style="font-size:20px;font-weight:800;color:var(--text-main);margin-bottom:5px;">QBIT SPORTS</h2>' +
        '<p style="font-size:13px;color:var(--text-main);line-height:1.6;margin-bottom:20px;font-weight:500;">QBIT SPORTS is a competitive gaming tournament platform where you can play Free Fire tournaments, win prizes, and climb the leaderboard.</p>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;font-weight:600;">Made with <i class="fas fa-heart" style="color:var(--danger);"></i> for gamers</div>' +
        '<button onclick="this.closest(\'div[style]\').parentElement.remove()" style="background:var(--primary);color:white;border:none;padding:12px 30px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;">Close</button>' +
        '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });
}
window.showAbout = showAbout;

function showPrivacyPolicy() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="background:var(--card-bg);width:90%;max-width:380px;border-radius:24px;padding:24px;animation:slideUp 0.3s ease-out;max-height:80vh;overflow-y:auto;">' +
        '<h2 style="font-size:18px;font-weight:800;color:var(--text-main);margin-bottom:15px;">Privacy Policy</h2>' +
        '<p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:12px;font-weight:500;"><strong>Data Collection:</strong> We collect your name, phone number, and Free Fire gaming details for tournament management.</p>' +
        '<p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:12px;font-weight:500;"><strong>Data Usage:</strong> Your data is used solely for tournament participation, payments, and account management.</p>' +
        '<p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:12px;font-weight:500;"><strong>Data Security:</strong> All data is stored securely using Firebase (Google Cloud). We do not sell or share your data with third parties.</p>' +
        '<p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:20px;font-weight:500;"><strong>Contact:</strong> For any privacy concerns, reach out via Telegram or Help & Support.</p>' +
        '<button onclick="this.closest(\'div[style]\').parentElement.remove()" style="background:var(--primary);color:white;border:none;padding:12px 30px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;width:100%;">Close</button>' +
        '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.remove(); });
}
window.showPrivacyPolicy = showPrivacyPolicy;

async function loadSettings() {
    try { window.adminSettings = await FB.getSettings(); } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    if(FB.getCurrentUid()) {
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        loadTheme(); loadHeader(); loadSettings();
    } else { window.location.href = 'home.html'; }
});
