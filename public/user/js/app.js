// ================================================
// QBIT SPORTS - SPA Application Logic
// Handles routing, Firebase, and all page logic
// ================================================

// ---------- GLOBAL STATE ----------
let currentPage = 'home';
let appContent = {};
let allTournamentsData = {};
let myJoinedTournaments = new Set();
window.userBalance = 0;
window.userSavedUpi = null;
window.userSavedBank = null;
window.adminSettings = {};
window.currentTID = null;
window.currentEntryFee = 0;

// ================================================
// SPA ROUTING - Navigate between sections without reload
// ================================================
function navigateTo(page) {
    const target = document.getElementById('section-' + page);
    if (!target) return;
    document.querySelectorAll('.page-section').forEach(s => {
        if (s.id !== 'section-' + page) s.classList.remove('active');
    });
    target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (navItem) navItem.classList.add('active');
    currentPage = page;
    loadPageData(page);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;
}
window.navigateTo = navigateTo;
window.navigateToSpa = navigateTo;

// Load data for the current page
function loadPageData(page) {
    switch (page) {
        case 'home': loadHomeData(); break;
        case 'matches': loadMatchesData(); break;
        case 'rank': loadRankData(); break;
        case 'wallet': loadWalletData(); break;
        case 'profile': loadProfileData(); break;
        case 'settings': loadSettingsData(); break;
    }
}

// ================================================
// COMMON UTILITIES
// ================================================
function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = msg;
    toast.style.background = type === "error" ? "rgba(255, 59, 48, 0.95)" : "rgba(52, 199, 89, 0.95)";
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 3000);
}
window.showToast = showToast;

function btnLoading(btn, isLoading) {
    const textSpan = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    if (isLoading) { btn.disabled = true; if (textSpan) textSpan.style.display = 'none'; if (spinner) spinner.style.display = 'block'; }
    else { btn.disabled = false; if (textSpan) textSpan.style.display = 'block'; if (spinner) spinner.style.display = 'none'; }
}
window.btnLoading = btnLoading;

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
}
window.openModal = openModal;

function closeModal(event, id) {
    if (event.target.id === id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    }
}
window.closeModal = closeModal;

function forceCloseModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
}
window.forceCloseModal = forceCloseModal;

function copyText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => { showToast("Copied!"); }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast("Copied!");
    });
}
window.copyText = copyText;

function formatOnlyTime(dateString) {
    if (!dateString) return "TBA";
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
window.formatOnlyTime = formatOnlyTime;

function logoutUser() {
    FB.logout();
    window.location.reload();
}
window.logoutUser = logoutUser;

function confirmLogout() { if (confirm("Are you sure you want to logout?")) logoutUser(); }
window.confirmLogout = confirmLogout;

// ================================================
// THEME / DARK MODE
// ================================================
function toggleDarkMode() {
    const isDark = document.getElementById('dark-mode-toggle').checked;
    if (isDark) { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('arena_theme', 'dark'); }
    else { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('arena_theme', 'light'); }
}
window.toggleDarkMode = toggleDarkMode;

function loadTheme() {
    const savedTheme = localStorage.getItem('arena_theme') || 'light';
    const toggle = document.getElementById('dark-mode-toggle');
    if (savedTheme === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); if (toggle) toggle.checked = true; }
    else { document.documentElement.removeAttribute('data-theme'); if (toggle) toggle.checked = false; }
}

function clearCache() {
    if (confirm("Clear all app data and reload?")) {
        localStorage.removeItem('arena_uid');
        localStorage.removeItem('arena_theme');
        window.location.reload();
    }
}
window.clearCache = clearCache;

// ================================================
// HEADER - Load logo, name, balance, avatar
// ================================================
async function loadHeader() {
    try {
        const settings = await FB.getSettings();
        window.adminSettings = settings;
        if (settings.appLogo) {
            const img = document.getElementById('header-app-logo-img');
            const txt = document.getElementById('header-app-logo-text');
            if (img) { img.src = settings.appLogo; img.style.display = 'block'; }
            if (txt) txt.style.display = 'none';
        }
        if (settings.appName) {
            const el = document.getElementById('header-app-name');
            if (el) el.innerText = settings.appName;
        }
    } catch (e) {}
    try {
        const uid = FB.getCurrentUid();
        if (!uid) return;
        const user = await FB.getUser(uid);
        if (!user) return;
        const avatarEl = document.getElementById('user-avatar-header');
        if (avatarEl) {
            if (user.avatar) {
                avatarEl.style.background = "url('" + user.avatar + "') center/cover no-repeat";
                avatarEl.innerHTML = '';
            } else {
                avatarEl.style.background = 'linear-gradient(135deg, var(--primary), #34aeff)';
                avatarEl.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
        const headerBal = document.getElementById('header-bal');
        if (headerBal) headerBal.innerText = user.balance || 0;
        window.userBalance = user.balance || 0;
    } catch (e) {}
}
window.loadHeader = loadHeader;

// ================================================
// AUTH - Google Login
// ================================================
async function handleGoogleLogin() {
    const btn = document.querySelector('.google-btn');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="display:block; border-color:#333; border-top-color:transparent;"></div> Connecting...';
    try {
        const user = await FB.googleLogin();
        showToast("Welcome " + user.name + "!");
        initApp();
    } catch (error) {
        showToast("Error: " + error.message, "error");
    }
    btn.disabled = false;
    btn.innerHTML = originalHTML;
}
window.handleGoogleLogin = handleGoogleLogin;

// ================================================
// HOME PAGE
// ================================================
async function loadHomeData() {
    const uid = FB.getCurrentUid();
    if (!uid) return;
    try { window.adminSettings = await FB.getSettings(); } catch (e) {}
    loadHeader();
    loadHomeTournaments();
    loadPolls();
}

async function loadHomeTournaments() {
    const container = document.getElementById('home-tournaments-list');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">Loading...</div>';
    try {
        const [tournaments, txs] = await Promise.all([FB.getTournaments(), FB.getTransactions(FB.getCurrentUid())]);
        myJoinedTournaments.clear();
        txs.forEach(tx => { if (tx.status === 'Success' && tx.type === 'Join Fee' && tx.tournament_id) myJoinedTournaments.add(String(tx.tournament_id)); });
        container.innerHTML = '';
        allTournamentsData = {};
        tournaments.forEach(t => {
            allTournamentsData[t.id] = t;
            if (t.status !== "completed") {
                let badgeHtml = t.status === "live"
                    ? '<div class="t-badge-live"><div class="dot dot-success"></div> Live (Open)</div>'
                    : '<div class="t-badge-live" style="background:rgba(255,149,0,0.8);"><div class="dot dot-warning"></div> Starts Soon</div>';
                let joinedCount = t.joinedPlayers ? Object.keys(t.joinedPlayers).length : 0;
                const totalTarget = t.target || 50;
                container.innerHTML += '<div class="tournament-card"><div class="t-img-box" onclick="openTournamentDetail(\'' + t.id + '\')">' + badgeHtml + '<div class="t-map-badge"><i class="fas fa-map-marked-alt"></i> ' + t.map + '</div><img src="' + (t.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='200'%3E%3Crect fill='%23007aff' width='500' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3EQBIT SPORTS%3C/text%3E%3C/svg%3E") + '" class="t-img" alt="Cover"></div><div class="t-info"><div class="t-title" onclick="openTournamentDetail(\'' + t.id + '\')">' + t.title + '</div><div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;"><div class="match-time-pill timer-high" onclick="openTournamentDetail(\'' + t.id + '\')"><i class="far fa-clock"></i> <span class="dynamic-timer" data-time="' + (t.raw_time_obj || '') + '">--h --m --s</span></div><div style="background:rgba(0,122,255,0.1); color:var(--primary); padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700; display:flex; align-items:center; gap:4px;"><i class="fas fa-users"></i> ' + (t.type || 'Solo') + '</div></div><div class="t-stats" onclick="openTournamentDetail(\'' + t.id + '\')"><div class="t-stat-box"><span>Entry Fee</span><strong>₹' + t.entry + '</strong></div><div class="t-stat-box"><span>Prize Pool</span><strong class="prize-text">₹' + t.prize + '</strong></div><div class="t-stat-box"><span>Per Kill</span><strong>₹' + t.kill + '</strong></div></div><div class="joined-players-ui" onclick="viewJoinedPlayers(\'' + t.id + '\')"><div class="jp-avatars"><div class="jp-av" style="background-image:url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=' + t.id + '1\')"></div><div class="jp-av" style="background-image:url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=' + t.id + '2\')"></div><div class="jp-av" style="background-image:url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=' + t.id + '3\')"></div></div><div class="jp-text"><strong>' + joinedCount + '/' + totalTarget + '</strong> Players Joined <i class="fas fa-chevron-right" style="margin-left:5px; font-size:10px;"></i></div></div></div></div>';
            }
        });
        if (!container.innerHTML) container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No Active Tournaments</div>';
    } catch (e) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No Active Tournaments</div>';
    }
}

// ================================================
// POLLS
// ================================================
async function loadPolls() {
    const container = document.getElementById('home-polls-list');
    if (!container) return;
    try {
        const polls = await FB.getPolls();
        container.innerHTML = '';
        polls.forEach(poll => {
            if (poll.status === 'active') {
                let totalVotes = poll.votes ? Object.keys(poll.votes).length : 0;
                let userVotedOpt = poll.votes ? poll.votes[FB.getCurrentUid()] : null;
                const voteCounts = {};
                if (poll.options) Object.keys(poll.options).forEach(k => voteCounts[k] = 0);
                if (poll.votes) Object.values(poll.votes).forEach(opt => { voteCounts[opt] = (voteCounts[opt] || 0) + 1; });
                let optionsHtml = '';
                if (poll.options) {
                    Object.keys(poll.options).forEach(optKey => {
                        const optText = poll.options[optKey];
                        const votesForOpt = voteCounts[optKey] || 0;
                        const percent = totalVotes > 0 ? Math.round((votesForOpt / totalVotes) * 100) : 0;
                        if (userVotedOpt) {
                            optionsHtml += '<div class="poll-option ' + (userVotedOpt === optKey ? 'voted' : '') + '"><div class="poll-fill" style="width: ' + percent + '%;"></div><div class="poll-opt-text">' + optText + ' <i class="fas fa-check-circle poll-voted-mark"></i></div><div class="poll-opt-percent">' + percent + '%</div></div>';
                        } else {
                            optionsHtml += '<div class="poll-option" onclick="submitVote(\'' + poll.id + '\', \'' + optKey + '\')"><div class="poll-opt-text">' + optText + '</div><div class="poll-opt-percent" style="color:var(--text-muted); font-size:11px; font-weight:600;">Tap to Vote</div></div>';
                        }
                    });
                }
                container.innerHTML += '<div class="poll-card"><div class="poll-header"><div class="poll-icon"><i class="fas fa-chart-bar"></i></div><div class="poll-question">' + poll.question + '</div></div><div class="poll-options">' + optionsHtml + '</div><div style="text-align:right; font-size:11px; color:var(--text-muted); margin-top:12px; font-weight:600;">' + totalVotes + ' Total Votes</div></div>';
            }
        });
    } catch (e) {}
}

async function submitVote(pollId, optionKey) {
    const uid = FB.getCurrentUid();
    if (!uid) return;
    try {
        await FB.votePoll(pollId, uid, optionKey);
        showToast("Your vote has been submitted!");
        loadPolls();
    } catch (e) { showToast("Failed to submit vote", "error"); }
}
window.submitVote = submitVote;

// ================================================
// MATCHES PAGE
// ================================================
function switchMatchTab(type, el) {
    document.querySelectorAll('#section-matches .segment-btn').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('#section-matches .match-list').forEach(list => list.classList.remove('active'));
    document.getElementById('list-' + type).classList.add('active');
}
window.switchMatchTab = switchMatchTab;

async function loadMatchesData() {
    const uid = FB.getCurrentUid();
    if (!uid) return;
    try {
        const user = await FB.getUser(uid);
        window.userBalance = user.balance || 0;
        document.getElementById('header-bal').innerText = window.userBalance;
    } catch (e) {}
    renderMatchesTournaments();
}

async function renderMatchesTournaments() {
    const upcomingContainer = document.getElementById('list-upcoming');
    const completedContainer = document.getElementById('list-completed');
    try {
        const [tournaments, txs] = await Promise.all([FB.getTournaments(), FB.getTransactions(FB.getCurrentUid())]);
        myJoinedTournaments.clear();
        allTournamentsData = {};
        txs.forEach(tx => { if (tx.status === 'Success' && tx.type === 'Join Fee' && tx.tournament_id) myJoinedTournaments.add(String(tx.tournament_id)); });
        let joinedHtml = '', completedHtml = '';
        tournaments.forEach(t => {
            allTournamentsData[t.id] = t;
            if (t.status !== "completed") {
                if (myJoinedTournaments.has(String(t.id)) || t.status === "soon") {
                    let statusClass = myJoinedTournaments.has(String(t.id)) ? "badge-joined" : "badge-soon";
                    let statusText = myJoinedTournaments.has(String(t.id)) ? "Joined Successfully" : "Starts Soon";
                    joinedHtml += '<div class="premium-match-card" onclick="openTournamentDetail(\'' + t.id + '\')"><img src="' + (t.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23007aff' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EQBIT%3C/text%3E%3C/svg%3E") + '" class="pmc-img"><div class="pmc-info"><h4>' + t.title + '</h4><p style="margin-bottom:8px;"><i class="far fa-clock"></i> <span class="dynamic-timer" data-time="' + (t.raw_time_obj || '') + '">--h --m --s</span> <span style="background:rgba(0,122,255,0.1); color:var(--primary); padding:2px 8px; border-radius:8px; font-size:10px; font-weight:700; margin-left:6px;">' + (t.type || 'Solo') + '</span></p><div class="pmc-badge ' + statusClass + '">' + statusText + '</div></div></div>';
                }
            } else {
                if (myJoinedTournaments.has(String(t.id))) {
                    completedHtml += '<div class="premium-match-card" onclick="openTournamentDetail(\'' + t.id + '\')"><img src="' + (t.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23007aff' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EQBIT%3C/text%3E%3C/svg%3E") + '" class="pmc-img"><div class="pmc-info"><h4>' + t.title + '</h4><p>Completed <span style="background:rgba(0,122,255,0.1); color:var(--primary); padding:2px 8px; border-radius:8px; font-size:10px; font-weight:700; margin-left:6px;">' + (t.type || 'Solo') + '</span></p><div class="pmc-badge" style="background:rgba(0,122,255,0.1); color:var(--primary);">View Result</div></div></div>';
                }
            }
        });
        if (!joinedHtml) joinedHtml = '<div style="text-align:center; padding: 20px; color:var(--text-muted);">No joined matches yet</div>';
        if (!completedHtml) completedHtml = '<div style="text-align:center; padding: 20px; color:var(--text-muted);">No completed matches</div>';
        upcomingContainer.innerHTML = joinedHtml;
        completedContainer.innerHTML = completedHtml;
    } catch (e) {}
}

// ================================================
// TOURNAMENT DETAIL
// ================================================
function openTournamentDetail(tid) {
    const data = allTournamentsData[tid];
    if (!data) return;
    window.currentTID = tid;
    window.currentEntryFee = Number(data.entry);
    let joinedCount = data.joinedPlayers ? Object.keys(data.joinedPlayers).length : 0;
    const totalTarget = data.target || 50;
    document.getElementById('td-full-img').src = data.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='200'%3E%3Crect fill='%23007aff' width='500' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3EQBIT SPORTS%3C/text%3E%3C/svg%3E";
    document.getElementById('td-full-title').innerText = data.title || 'Tournament';
    document.getElementById('td-full-map').innerText = data.map || 'N/A';
    document.getElementById('td-full-type').innerText = data.type || 'Solo';
    document.getElementById('td-full-entry').innerText = '₹' + (data.entry || '0');
    document.getElementById('td-full-prize').innerText = '₹' + (data.prize || '0');
    document.getElementById('td-full-kill').innerText = '₹' + (data.kill || '0');
    document.getElementById('td-full-rules').innerText = data.rules || 'Play fair. No hacks.';
    document.getElementById('td-live-timer-text').setAttribute('data-time', data.raw_time_obj || "");
    document.getElementById('td-full-joined-ui').innerHTML = '<div class="joined-players-ui" onclick="viewJoinedPlayers(\'' + tid + '\')"><div class="jp-avatars"><div class="jp-av" style="background-image:url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=' + tid + '1\')"></div><div class="jp-av" style="background-image:url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=' + tid + '2\')"></div><div class="jp-av" style="background-image:url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=' + tid + '3\')"></div></div><div class="jp-text"><strong>' + joinedCount + '/' + totalTarget + '</strong> Players Joined</div></div>';
    const roomBox = document.getElementById('td-room-details');
    const mainBtn = document.getElementById('main-join-btn');
    const btnText = mainBtn.querySelector('.btn-text');
    mainBtn.classList.remove('btn-joined');
    if (myJoinedTournaments.has(String(tid))) {
        mainBtn.disabled = true; mainBtn.classList.add('btn-joined'); btnText.innerHTML = "<i class='fas fa-check-circle'></i> Already Joined";
        if (data.showRoom) {
            roomBox.innerHTML = '<div class="fp-box" style="background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); margin-bottom: 20px;"><h3 style="color: var(--success); margin-bottom:10px; font-size: 15px;"><i class="fas fa-key"></i> Room Details</h3><div class="fp-row" style="align-items:center;"><span>Room ID:</span><div style="display:flex; align-items:center; gap:8px;"><strong id="td-room-id" style="user-select:all; font-size:18px;">' + (data.room_id || 'N/A') + '</strong><button onclick="copyText(\'td-room-id\')" style="background:var(--primary); color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px;"><i class="fas fa-copy"></i> Copy</button></div></div><div class="fp-row" style="margin-bottom:0; align-items:center;"><span>Password:</span><div style="display:flex; align-items:center; gap:8px;"><strong id="td-room-pass" style="user-select:all; font-size:18px;">' + (data.room_pass || 'N/A') + '</strong><button onclick="copyText(\'td-room-pass\')" style="background:var(--primary); color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px;"><i class="fas fa-copy"></i> Copy</button></div></div></div>';
        } else {
            roomBox.innerHTML = '<div class="fp-box" style="background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.3); margin-bottom: 20px;"><h3 style="color: var(--warning); margin-bottom:5px; font-size: 15px;"><i class="fas fa-lock"></i> Room Details Hidden</h3><p style="font-size:12px; font-weight:600;">Admin will reveal before the match.</p></div>';
        }
    } else {
        roomBox.innerHTML = '';
        if (data.status === 'soon') { mainBtn.disabled = true; btnText.innerText = "Match Starts Soon"; }
        else { mainBtn.disabled = false; btnText.innerText = "Join Tournament (₹" + window.currentEntryFee + ")"; }
    }
    document.getElementById('tournament-detail-page').classList.add('show');
}
window.openTournamentDetail = openTournamentDetail;

function closeTournamentDetail() { document.getElementById('tournament-detail-page').classList.remove('show'); window.currentTID = null; }
window.closeTournamentDetail = closeTournamentDetail;

function viewJoinedPlayers(tid) {
    const data = allTournamentsData[tid];
    if (!data) return;
    const container = document.getElementById('players-list-container');
    container.innerHTML = '';
    let joinedList = data.joinedPlayers ? Object.entries(data.joinedPlayers).map(([k, v]) => ({ ...v, phone: k })) : [];
    if (joinedList.length === 0) { container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No players joined yet.</div>'; }
    else { joinedList.forEach((player, index) => { container.innerHTML += '<div class="player-list-item"><div class="pl-av" style="background-image:url(\'' + (player.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (player.ffName || index)) + '\')"></div><div class="pl-info"><h5>' + (player.ffName || 'Unknown') + '</h5></div></div>'; }); }
    openModal('joined-players-modal');
}
window.viewJoinedPlayers = viewJoinedPlayers;

// ================================================
// JOIN TOURNAMENT
// ================================================
function initiateJoin(btn) {
    if (window.userBalance < window.currentEntryFee) { showToast("Insufficient Balance!", "error"); closeTournamentDetail(); navigateTo('wallet'); return; }
    document.getElementById('jf-entry-fee').innerText = window.currentEntryFee;
    document.getElementById('join-form-modal').style.display = 'flex';
}
window.initiateJoin = initiateJoin;

async function confirmJoin(btn) {
    const uid = document.getElementById('ff-uid').value;
    const name = document.getElementById('ff-name').value;
    if (!uid || !name) { showToast("Enter FF Details!", "error"); return; }
    btnLoading(btn, true);
    try {
        const data = await FB.joinTournament(window.currentTID, FB.getCurrentUid(), name, uid);
        window.userBalance = data.balance;
        showToast("Joined Tournament Successfully!");
        btnLoading(btn, false); forceCloseModal('join-form-modal'); closeTournamentDetail();
        document.getElementById('ff-uid').value = ''; document.getElementById('ff-name').value = '';
        navigateTo('matches');
    } catch (e) { showToast(e.message, "error"); }
    btnLoading(btn, false);
}
window.confirmJoin = confirmJoin;

// ================================================
// RANK PAGE
// ================================================
async function loadRankData() {
    const uid = FB.getCurrentUid();
    if (!uid) return;
    const rankContainer = document.getElementById('rank-tournaments-list');
    if (!rankContainer) return;
    try {
        const tournaments = await FB.getTournaments();
        let rankHtml = '';
        tournaments.forEach(t => {
            if (t.status === "completed") {
                let winnerHtml = '<div class="no-result-text">Rank details updating soon...</div>';
                if (t.winner_name && t.winner_uid) {
                    winnerHtml = '<div class="rc-winner"><div class="rcw-crown"><i class="fas fa-crown"></i></div><div class="rcw-details"><p>#1 Winner</p><h3>' + t.winner_name + '</h3><span>UID: ' + t.winner_uid + '</span></div></div>';
                }
                const displayTime = formatOnlyTime(t.raw_time_obj);
                rankHtml += '<div class="rc-card"><div class="rc-header"><img src="' + (t.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23007aff' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EQBIT%3C/text%3E%3C/svg%3E") + '" class="rc-img"><div class="rc-info"><h4>' + t.title + '</h4><div class="rc-map"><i class="fas fa-map-marked-alt"></i> ' + t.map + ' <span style="background:rgba(0,122,255,0.1); color:var(--primary); padding:2px 6px; border-radius:6px; font-size:10px; font-weight:700; margin-left:4px;">' + (t.type || 'Solo') + '</span></div><div class="rc-time"><i class="far fa-clock"></i> ' + displayTime + '</div></div><div class="rc-status">Completed</div></div><div class="rc-stats"><div><span>Entry</span><strong>₹' + (t.entry || '0') + '</strong></div><div><span>Prize Pool</span><strong style="color:var(--success);">₹' + (t.prize || '0') + '</strong></div><div><span>Per Kill</span><strong style="color:var(--primary);">₹' + (t.kill || '0') + '</strong></div></div>' + winnerHtml + '</div>';
            }
        });
        if (!rankHtml) rankHtml = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No Results Yet</div>';
        rankContainer.innerHTML = rankHtml;
    } catch (e) { rankContainer.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No Results Yet</div>'; }
}

// ================================================
// WALLET PAGE
// ================================================
async function loadWalletData() {
    const uid = FB.getCurrentUid();
    if (!uid) return;
    try {
        const user = await FB.getUser(uid);
        window.userSavedUpi = user.saved_upi || null;
        window.userSavedBank = user.saved_bank ? JSON.parse(user.saved_bank) : null;
    } catch (e) {}
    try {
        window.adminSettings = await FB.getSettings();
        const qrImg = document.getElementById('d-qr-img');
        const upiId = document.getElementById('d-upi-id');
        if (window.adminSettings.qrImage && qrImg) qrImg.src = window.adminSettings.qrImage;
        if (window.adminSettings.upiId && upiId) upiId.innerText = window.adminSettings.upiId;
    } catch (e) {}
    loadTransactions();
}

function downloadQR() {
    const img = document.getElementById('d-qr-img');
    if (!img || !img.src) { showToast("QR image not found", "error"); return; }
    const link = document.createElement('a');
    link.download = 'QBIT-QR-Code.png';
    link.href = img.src;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR Downloaded!");
}
window.downloadQR = downloadQR;

async function loadTransactions() {
    const list = document.getElementById('user-tx-list');
    if (!list) return;
    try {
        const txs = await FB.getTransactions(FB.getCurrentUid());
        list.innerHTML = '';
        let totalDep = 0, totalWit = 0, totalWinAmt = 0, totalWins = 0, bal = 0;
        txs.forEach(tx => {
            if (tx.status === 'Success') {
                if (tx.type === 'Deposit') { totalDep += Number(tx.amount); bal += Number(tx.amount); }
                if (tx.type === 'Withdraw') { totalWit += Number(tx.amount); bal -= Number(tx.amount); }
                if (tx.type === 'Win') { totalWinAmt += Number(tx.amount); totalWins++; bal += Number(tx.amount); }
                if (tx.type === 'Join Fee') bal -= Number(tx.amount);
            } else if (tx.status === 'Pending' && tx.type === 'Withdraw') { bal -= Number(tx.amount); }
        });
        window.userBalance = bal;
        document.getElementById('header-bal').innerText = bal;
        document.getElementById('main-bal').innerText = bal;
        const s = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        s('w-stat-dep', '₹' + totalDep); s('w-stat-wit', '₹' + totalWit);
        s('w-stat-earn', '₹' + totalWinAmt); s('w-stat-win', totalWins);
        txs.forEach(tx => {
            let iconCls = "dep", iconHtml = '<i class="fas fa-arrow-down"></i>', sign = '+', label = 'Deposit';
            if (tx.type === 'Withdraw') { iconCls = "wit"; iconHtml = '<i class="fas fa-arrow-up"></i>'; sign = '-'; label = 'Withdraw'; }
            else if (tx.type === 'Join Fee') { iconCls = "join"; iconHtml = '<i class="fas fa-gamepad"></i>'; sign = '-'; label = 'Join Fee'; }
            else if (tx.type === 'Win') { iconCls = "dep"; iconHtml = '<i class="fas fa-trophy"></i>'; sign = '+'; label = 'Won'; }
            let color = sign === '+' ? 'var(--success)' : 'var(--text-main)';
            let timeStr = tx.datetime || '';
            let shortTime = timeStr.length > 12 ? timeStr.slice(0, 10) : timeStr;
            let statusBadge = tx.status === 'Success' ? '<span style="color:var(--success);font-size:10px;font-weight:600;">✓</span>' : (tx.status === 'Pending' ? '<span style="color:var(--warning);font-size:10px;font-weight:600;">⏳</span>' : '');
            list.innerHTML += '<div class="tx-item"><div class="tx-left"><div class="tx-icon ' + iconCls + '">' + iconHtml + '</div><div class="tx-details"><h5>' + label + ' ' + statusBadge + '</h5><p>' + shortTime + '</p></div></div><div class="tx-amount" style="color:' + color + ';">' + sign + ' ₹' + tx.amount + '</div></div>';
        });
        if (txs.length === 0) list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:14px; background:var(--card-bg); border-radius:14px; border:1px solid rgba(0,0,0,0.03);">No Transactions Yet</div>';
    } catch (e) { list.innerHTML = '<div style="text-align:center; padding:10px; color:var(--text-muted);">No Transactions Yet</div>'; }
}

async function submitDeposit(btn) {
    const amt = document.getElementById('dep-amount').value;
    const utr = document.getElementById('dep-utr').value;
    if (!amt || amt < 10) { showToast("Minimum deposit ₹10", "error"); return; }
    if (utr.length !== 12) { showToast("Enter 12-Digit UTR", "error"); return; }
    btnLoading(btn, true);
    try {
        await FB.submitDeposit(FB.getCurrentUid(), Number(amt), utr);
        showToast("Deposit Request Sent!");
        forceCloseModal('deposit-modal');
        document.getElementById('dep-amount').value = '';
        document.getElementById('dep-utr').value = '';
        loadTransactions();
    } catch (e) { showToast(e.message, "error"); }
    btnLoading(btn, false);
}
window.submitDeposit = submitDeposit;

function openWithdrawModal() {
    document.getElementById('with-amount').value = '';
    const container = document.getElementById('withdraw-methods-container');
    container.innerHTML = '<label style="font-size:13px; font-weight:600; color:var(--text-muted); margin-bottom:8px; display:block;">Select Withdrawal Method</label>';
    let hasMethod = false;
    if (window.userSavedUpi) { hasMethod = true; container.innerHTML += '<label class="pay-method-radio"><input type="radio" name="w_method" value="upi" checked><div class="pm-details"><strong>UPI ID</strong><span>' + window.userSavedUpi + '</span></div></label>'; }
    if (window.userSavedBank) { const isChecked = !hasMethod ? 'checked' : ''; hasMethod = true; container.innerHTML += '<label class="pay-method-radio"><input type="radio" name="w_method" value="bank" ' + isChecked + '><div class="pm-details"><strong>Bank Account</strong><span>Ac No: ' + window.userSavedBank.accNo + ' (' + window.userSavedBank.name + ')</span></div></label>'; }
    if (!hasMethod) container.innerHTML += '<div style="font-size:12px; color:var(--danger); margin-bottom:10px; background:rgba(255,59,48,0.1); padding:10px; border-radius:8px;">No payment methods found. Add one first.</div>';
    openModal('withdraw-modal');
}
window.openWithdrawModal = openWithdrawModal;

function switchPaymentTab(type, el) {
    document.querySelectorAll('#add-payment-modal .segment-btn').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.pay-setup-form').forEach(form => form.classList.remove('active'));
    document.getElementById('pay-setup-' + type).classList.add('active');
}
window.switchPaymentTab = switchPaymentTab;

async function saveUpiMethod(btn) {
    const upi = document.getElementById('setup-upi-id').value;
    if (!upi.includes("@")) { showToast("Invalid UPI ID", "error"); return; }
    btnLoading(btn, true);
    try {
        await FB.updateUser(FB.getCurrentUid(), { saved_upi: upi });
        window.userSavedUpi = upi;
        showToast("UPI Added!");
        forceCloseModal('add-payment-modal');
        openWithdrawModal();
    } catch (e) { showToast(e.message, "error"); }
    btnLoading(btn, false);
}
window.saveUpiMethod = saveUpiMethod;

async function saveBankMethod(btn) {
    const name = document.getElementById('setup-bank-name').value;
    const acc = document.getElementById('setup-bank-acc').value;
    const ifsc = document.getElementById('setup-bank-ifsc').value;
    if (!name || !acc || !ifsc) { showToast("Fill all details", "error"); return; }
    btnLoading(btn, true);
    try {
        await FB.updateUser(FB.getCurrentUid(), { saved_bank: JSON.stringify({ name, accNo: acc, ifsc }) });
        window.userSavedBank = { name, accNo: acc, ifsc };
        showToast("Bank Added!");
        forceCloseModal('add-payment-modal');
        openWithdrawModal();
    } catch (e) { showToast(e.message, "error"); }
    btnLoading(btn, false);
}
window.saveBankMethod = saveBankMethod;

async function submitWithdraw(btn) {
    const amt = document.getElementById('with-amount').value;
    if (amt < 100) { showToast("Min withdraw ₹100", "error"); return; }
    if (amt > window.userBalance) { showToast("Insufficient Balance!", "error"); return; }
    const selectedMethod = document.querySelector('input[name="w_method"]:checked');
    if (!selectedMethod) { showToast("Select or add a payment method first", "error"); return; }
    let methodDetails = selectedMethod.value === "upi" ? "UPI: " + window.userSavedUpi : "Bank: " + window.userSavedBank.accNo;
    btnLoading(btn, true);
    try {
        const data = await FB.submitWithdraw(FB.getCurrentUid(), Number(amt), methodDetails);
        window.userBalance = data.balance;
        btnLoading(btn, false); forceCloseModal('withdraw-modal');
        document.getElementById('with-amount').value = '';
        const successModal = document.getElementById('success-anim-modal');
        successModal.classList.add('show');
        setTimeout(() => { successModal.classList.remove('show'); }, 2500);
        loadTransactions();
    } catch (e) { showToast(e.message, "error"); btnLoading(btn, false); }
}
window.submitWithdraw = submitWithdraw;

// ================================================
// PROFILE PAGE
// ================================================
async function loadProfileData() {
    const uid = FB.getCurrentUid();
    if (!uid) return;
    const container = document.getElementById('profile-content');
    if (!container) return;
    try {
        const user = await FB.getUser(uid);
        let avatarUrl = user.avatar || '';
        let initial = (user.name || 'U').charAt(0).toUpperCase();
        container.innerHTML = '<div class="profile-header-card"><div class="profile-avatar-wrap"><div id="p-img" class="profile-avatar" style="background-image:url(\'' + avatarUrl + '\')"><span class="profile-avatar-init" style="display:' + (avatarUrl ? 'none' : 'flex') + '">' + initial + '</span><label for="avatar-input" class="profile-camera-btn"><i class="fas fa-camera"></i></label></div><input type="file" id="avatar-input" accept="image/*" style="display:none;" onchange="uploadAvatar(this)"></div><div class="profile-name-section"><h1 id="p-name" class="profile-name-text">' + (user.name || 'User') + '</h1><span id="p-uid" class="profile-phone-badge"><i class="fas fa-phone-alt"></i> ' + (user.phone || 'Google User') + '</span></div><div class="profile-ff-row"><div class="profile-ff-chip"><i class="fas fa-gamepad"></i> <span id="p-ffname">' + (user.ff_name || 'Not Set') + '</span></div><div class="profile-ff-chip"><i class="fas fa-fingerprint"></i> <span id="p-ffuid">' + (user.ff_uid || 'Not Set') + '</span></div></div><button class="profile-edit-btn" onclick="openEditProfile()"><i class="fas fa-edit"></i> Edit Profile</button></div>';
        // Load stats
        const txs = await FB.getTransactions(uid);
        let totalDep = 0, totalWit = 0, totalWinAmt = 0, totalWins = 0;
        txs.forEach(tx => { if (tx.status === 'Success') { if (tx.type === 'Deposit') totalDep += Number(tx.amount); if (tx.type === 'Withdraw') totalWit += Number(tx.amount); if (tx.type === 'Win') { totalWinAmt += Number(tx.amount); totalWins++; } } });
        container.innerHTML += '<div class="profile-stats-grid"><div class="profile-stat-card"><div class="profile-stat-icon" style="background:rgba(0,122,255,0.12);color:var(--primary);"><i class="fas fa-arrow-down"></i></div><div class="profile-stat-info"><span>Total Deposit</span><strong>₹' + totalDep + '</strong></div></div><div class="profile-stat-card"><div class="profile-stat-icon" style="background:rgba(255,59,48,0.12);color:var(--danger);"><i class="fas fa-arrow-up"></i></div><div class="profile-stat-info"><span>Total Withdraw</span><strong>₹' + totalWit + '</strong></div></div><div class="profile-stat-card"><div class="profile-stat-icon" style="background:rgba(52,199,89,0.12);color:var(--success);"><i class="fas fa-trophy"></i></div><div class="profile-stat-info"><span>Total Wins</span><strong>' + totalWins + '</strong></div></div><div class="profile-stat-card"><div class="profile-stat-icon" style="background:rgba(255,149,0,0.12);color:var(--warning);"><i class="fas fa-coins"></i></div><div class="profile-stat-info"><span>Total Earning</span><strong>₹' + totalWinAmt + '</strong></div></div></div>';
        container.innerHTML += '<div class="profile-menu-card"><div class="profile-menu-item" onclick="navigateTo(\'settings\')"><div class="profile-menu-left"><i class="fas fa-cog" style="color:var(--text-muted);"></i><span>Settings</span></div><i class="fas fa-chevron-right" style="color:var(--text-muted); font-size:13px;"></i></div><div class="profile-menu-item" onclick="openAdminLink(\'telegram\')"><div class="profile-menu-left"><i class="fab fa-telegram" style="color:#0088cc;"></i><span>Join Telegram</span></div><i class="fas fa-chevron-right" style="color:var(--text-muted); font-size:13px;"></i></div><div class="profile-menu-item" onclick="openAdminLink(\'help\')"><div class="profile-menu-left"><i class="fas fa-question-circle" style="color:var(--warning);"></i><span>Help & Support</span></div><i class="fas fa-chevron-right" style="color:var(--text-muted); font-size:13px;"></i></div><div class="profile-menu-item" onclick="confirmLogout()" style="border-bottom:none;"><div class="profile-menu-left"><i class="fas fa-sign-out-alt" style="color:var(--danger);"></i><span style="color:var(--danger);">Logout</span></div><i class="fas fa-chevron-right" style="color:var(--text-muted); font-size:13px;"></i></div></div>';
        // Store data for edit
        window.userProfileData = user;
    } catch (e) { container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Failed to load profile</div>'; }
}

function openEditProfile() {
    const user = window.userProfileData;
    if (!user) return;
    document.getElementById('ep-name').value = user.name || '';
    document.getElementById('ep-ffname').value = user.ff_name || '';
    document.getElementById('ep-ffuid').value = user.ff_uid || '';
    openModal('edit-profile-modal');
}
window.openEditProfile = openEditProfile;

async function saveProfile(btn) {
    const name = document.getElementById('ep-name').value;
    const ffName = document.getElementById('ep-ffname').value;
    const ffUid = document.getElementById('ep-ffuid').value;
    if (!name) { showToast("Name is required", "error"); return; }
    btnLoading(btn, true);
    try {
        await FB.updateUser(FB.getCurrentUid(), { name, ff_name: ffName, ff_uid: ffUid });
        showToast("Profile Updated!");
        btnLoading(btn, false); forceCloseModal('edit-profile-modal');
        loadProfileData();
    } catch (e) { showToast("Update Failed", "error"); }
    btnLoading(btn, false);
}
window.saveProfile = saveProfile;

// ================================================
// AVATAR UPLOAD & CROP
// ================================================
let cropImageSrc = null, cropPosX = 0, cropPosY = 0, isDragging = false;

function uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB!", "error"); input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = function (e) { cropImageSrc = e.target.result; cropPosX = 0; cropPosY = 0; openCropModal(); };
    reader.readAsDataURL(file);
    input.value = '';
}
window.uploadAvatar = uploadAvatar;

function openCropModal() {
    const modal = document.getElementById('crop-modal');
    const img = document.getElementById('crop-image');
    img.src = cropImageSrc;
    cropPosX = 0; cropPosY = 0;
    updateImagePosition();
    modal.classList.add('show');
    const circle = document.getElementById('crop-circle');
    let dragStartX = 0, dragStartY = 0, startPosX = 0, startPosY = 0;
    function onStart(e) { isDragging = true; const point = e.touches ? e.touches[0] : e; dragStartX = point.clientX; dragStartY = point.clientY; startPosX = cropPosX; startPosY = cropPosY; }
    function onMove(e) { if (!isDragging) return; e.preventDefault(); const point = e.touches ? e.touches[0] : e; cropPosX = startPosX + (point.clientX - dragStartX); cropPosY = startPosY + (point.clientY - dragStartY); updateImagePosition(); }
    function onEnd() { isDragging = false; }
    circle.onmousedown = onStart; circle.ontouchstart = onStart;
    document.onmousemove = onMove; document.ontouchmove = onMove;
    document.onmouseup = onEnd; document.ontouchend = onEnd;
}

function updateImagePosition() { const img = document.getElementById('crop-image'); if (img) img.style.transform = "translate(" + cropPosX + "px, " + cropPosY + "px)"; }

function closeCropModal() { document.getElementById('crop-modal').classList.remove('show'); cropImageSrc = null; isDragging = false; document.onmousemove = null; document.ontouchmove = null; }
window.closeCropModal = closeCropModal;

async function saveCroppedImage() {
    const img = document.getElementById('crop-image');
    const canvas = document.createElement('canvas');
    const size = 400; canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill(); ctx.clip();
    const containerSize = 280; const scale = size / containerSize;
    const fitScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const drawW = img.naturalWidth * fitScale; const drawH = img.naturalHeight * fitScale;
    const drawX = (size - drawW) / 2 + (cropPosX * scale); const drawY = (size - drawH) / 2 + (cropPosY * scale);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    showToast("Uploading...");
    try {
        await FB.updateUser(FB.getCurrentUid(), { avatar: croppedBase64 });
        document.getElementById('p-img').style.backgroundImage = "url('" + croppedBase64 + "')";
        const headerAvatar = document.getElementById('user-avatar-header');
        if (headerAvatar) headerAvatar.style.background = "url('" + croppedBase64 + "') center/cover no-repeat";
        closeCropModal();
        showToast("Photo updated!");
    } catch (e) { showToast("Upload failed: " + e.message, "error"); }
}
window.saveCroppedImage = saveCroppedImage;

// ================================================
// SETTINGS PAGE FUNCTIONS
// ================================================
function loadSettingsData() { loadTheme(); }

function openAdminLink(type) {
    let url = "";
    if (type === 'telegram') url = window.adminSettings?.telegram;
    if (type === 'help') url = window.adminSettings?.help;
    if (url && url.trim() !== "") window.open(url, '_blank');
    else showToast("Link not updated by admin yet!", "error");
}
window.openAdminLink = openAdminLink;

function shareApp() {
    if (navigator.share) {
        navigator.share({ title: 'QBIT SPORTS', text: 'Check out QBIT SPORTS - Play & Win tournaments!', url: window.location.origin + '/user/index.html' }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.origin + '/user/index.html').then(() => { showToast("Link copied!"); }).catch(() => { showToast("Share not supported", "error"); });
    }
}
window.shareApp = shareApp;

function rateApp() { showToast("Thanks for your support!"); }
window.rateApp = rateApp;

function showAbout() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal-content" style="text-align:center;"><div style="width:70px;height:70px;border-radius:20px;background:linear-gradient(135deg,var(--primary),#34aeff);display:flex;align-items:center;justify-content:center;margin:0 auto 15px;box-shadow:0 8px 25px rgba(0,122,255,0.3);"><span style="color:white;font-weight:900;font-size:22px;">QS</span></div><h2 style="font-size:20px;font-weight:800;color:var(--text-main);margin-bottom:5px;">QBIT SPORTS</h2><p style="font-size:12px;color:var(--text-muted);margin-bottom:15px;font-weight:600;">Version 1.0</p><p style="font-size:13px;color:var(--text-main);line-height:1.6;margin-bottom:20px;font-weight:500;">QBIT SPORTS is a competitive gaming tournament platform where you can play Free Fire tournaments, win prizes, and climb the leaderboard.</p><div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;font-weight:600;">Made with <i class="fas fa-heart" style="color:var(--danger);"></i> for gamers</div><button onclick="this.closest(\'.modal-overlay\').remove()" style="background:var(--primary);color:white;border:none;padding:12px 30px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;">Close</button></div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
window.showAbout = showAbout;

function showPrivacyPolicy() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal-content"><h2 style="font-size:18px;font-weight:800;color:var(--text-main);margin-bottom:15px;">Privacy Policy</h2><p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:12px;font-weight:500;"><strong>Data Collection:</strong> We collect your name, phone number, and Free Fire gaming details for tournament management.</p><p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:12px;font-weight:500;"><strong>Data Usage:</strong> Your data is used solely for tournament participation, payments, and account management.</p><p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:12px;font-weight:500;"><strong>Data Security:</strong> All data is stored securely using Firebase (Google Cloud). We do not sell or share your data with third parties.</p><p style="font-size:13px;color:var(--text-main);line-height:1.7;margin-bottom:20px;font-weight:500;"><strong>Contact:</strong> For any privacy concerns, reach out via Telegram or Help & Support.</p><button onclick="this.closest(\'.modal-overlay\').remove()" style="background:var(--primary);color:white;border:none;padding:12px 30px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;width:100%;">Close</button></div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
window.showPrivacyPolicy = showPrivacyPolicy;

// ================================================
// PROFILE COMPLETION
// ================================================
async function saveFullProfile() {
    const name = document.getElementById('pc-name').value.trim();
    const phone = document.getElementById('pc-phone').value.trim();
    const ffName = document.getElementById('pc-ffname').value.trim();
    const ffUid = document.getElementById('pc-ffuid').value.trim();
    if (!name) { showToast("Name is required!", "error"); return; }
    if (!phone || phone.length !== 10) { showToast("Enter valid 10-digit phone number!", "error"); return; }
    if (!ffName) { showToast("FF Name is required!", "error"); return; }
    if (!ffUid) { showToast("FF UID is required!", "error"); return; }
    const btn = document.querySelector('#profile-complete-popup .btn');
    btnLoading(btn, true);
    try {
        const uid = FB.getCurrentUid();
        await FB.updateUser(uid, { name, phone, ff_name: ffName, ff_uid: ffUid });
        document.getElementById('profile-complete-popup').style.display = 'none';
        loadPageData(currentPage);
    } catch (e) { showToast(e.message, "error"); }
    btnLoading(btn, false);
}
window.saveFullProfile = saveFullProfile;

// ================================================
// TIMER UPDATER - Updates countdown timers every second
// ================================================
function updateTimers() {
    document.querySelectorAll('.dynamic-timer').forEach(timer => {
        const timeStr = timer.getAttribute('data-time');
        if (!timeStr) return;
        const target = new Date(timeStr).getTime();
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) { timer.innerHTML = '<i class="fas fa-play-circle"></i> Live Now'; timer.closest('.match-time-pill').className = 'match-time-pill timer-low'; return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timer.textContent = h + 'h ' + m + 'm ' + s + 's';
        const pill = timer.closest('.match-time-pill');
        if (pill) {
            pill.classList.remove('timer-high', 'timer-med', 'timer-low');
            if (h > 2) pill.classList.add('timer-high');
            else if (h > 0) pill.classList.add('timer-med');
            else pill.classList.add('timer-low');
        }
    });
}
setInterval(updateTimers, 1000);

// ================================================
// APP INITIALIZATION
// ================================================
function initApp() {
    const uid = FB.getCurrentUid();
    if (uid) {
        document.getElementById('auth-page').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        loadTheme();
        loadHeader();
        navigateTo('home');
        // Check profile completion
        FB.getUser(uid).then(user => {
            if (user && (!user.phone || !user.ff_name || !user.ff_uid)) {
                document.getElementById('profile-complete-popup').style.display = 'flex';
                if (user.name) document.getElementById('pc-name').value = user.name;
            }
        }).catch(() => {});
    } else {
        document.getElementById('auth-page').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }
}

// On page load
document.addEventListener('DOMContentLoaded', initApp);

// Inject toggle slider styles
(function () {
    var style = document.createElement('style');
    style.textContent = '#dark-mode-toggle:checked + span { background: var(--primary) !important; } #dark-mode-toggle:checked + span + .toggle-slider { transform: translateX(22px) !important; }';
    document.head.appendChild(style);
})();
