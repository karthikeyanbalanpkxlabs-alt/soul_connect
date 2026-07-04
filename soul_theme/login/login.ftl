<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Soul Connect – Sign In</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Noto+Sans+Tamil:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${url.resourcesPath}/css/styles.css">
</head>
<body>

<nav>
  <#-- <a href="index.html" class="nav-logo"><img src="img/logo.png" width="251" height="63" alt=""/></a> -->
  <div class="nav-right">
    <a href="#" class="nav-link">Browse Profiles</a>
    <a href="#"  onclick="window.location.href = (['localhost','127.0.0.1'].includes(location.hostname)
            ? 'http://localhost:5174/#register'
            : 'https://soulconect.com/#register'); return false;" class="btn-nav">Join Free ✦</a>
  </div>
</nav>

<div class="page-wrapper">
  <!-- FORM SIDE (LEFT ON LOGIN) -->
  <div class="auth-form-side">
    <div class="auth-form-wrap">

      <a href="#"
        class="auth-back reveal"
        onclick="window.location.href = (['localhost','127.0.0.1'].includes(location.hostname)
            ? 'http://localhost:5174/'
            : 'https://soulconect.com/'); return false;">
        ← Back to home
        </a>

      <div class="reveal" style="transition-delay:.1s">
        <div class="auth-title">Welcome back 🙏</div>
        <div class="auth-subtitle">Don't have an account? <a href="#"  onclick="window.location.href = (['localhost','127.0.0.1'].includes(location.hostname)
            ? 'http://localhost:5174/#register'
            : 'https://soulconect.com/#register'); return false;"
            >Create your profile →</a></div>
      </div>

      <#if message?has_content && (message.type != 'warning')>
        <div class="alert alert-${message.type} reveal" style="transition-delay:.12s; background: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 14px; text-align: center; border: 1px solid #f87171;">
            ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <!-- SOCIAL AUTH -->
      <div class="social-auth reveal" style="display:none; transition-delay:.15s">
        <button class="btn-social">G Continue with Google</button>
        <button class="btn-social">📱 Use OTP instead</button>
      </div>

      <div class="divider reveal" style="transition-delay:.18s">
        <div class="divider-line"></div>
        <span class="divider-text">or sign in with</span>
        <div class="divider-line"></div>
      </div>

      <!-- METHOD TOGGLE -->
      <div style="display: none;" class="method-toggle reveal" id="methodToggle" style="transition-delay:.2s">
        <button class="method-btn active" onclick="switchMethod('email', this)">✉ Email</button>
        <button class="method-btn" onclick="switchMethod('phone', this)">📱 Mobile OTP</button>
        <button class="method-btn" onclick="switchMethod('id', this)">🆔 Profile ID</button>
      </div>

      <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">

        <!-- EMAIL LOGIN -->
        <div class="panel-email" id="panelEmail">
          <div class="reveal" style="transition-delay:.22s">
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email Address</label>
              <div class="form-input-wrap">
                <span class="form-input-icon">✉</span>
                <input id="loginEmail" name="username" type="text" class="form-input" placeholder="you@example.com" autocomplete="username" value="${(login.username!'')}">
              </div>
            </div>
            <div class="form-group">
              <div class="form-label-row">
                <label class="form-label" for="loginPwd">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="form-input-wrap">
                <span class="form-input-icon">🔒</span>
                <input id="loginPwd" name="password" type="password" class="form-input" placeholder="Your password" autocomplete="current-password">
                <span class="form-input-suffix" onclick="togglePwd('loginPwd')">👁</span>
              </div>
            </div>
            <div class="remember-row">
              <div class="checkbox-group">
                <input type="checkbox" id="remember" name="rememberMe" checked>
                <label class="checkbox-label" for="remember">Keep me signed in</label>
              </div>
            </div>
          </div>
        </div>

        <!-- PHONE OTP LOGIN -->
        <div class="panel-phone" id="panelPhone">
          <div class="form-group">
            <label class="form-label" for="loginPhone">Mobile Number</label>
            <div style="display:flex;gap:8px">
              <select class="form-select" style="width:110px;flex-shrink:0">
                <option>🇮🇳 +91</option>
                <option>🇺🇸 +1</option>
                <option>🇬🇧 +44</option>
                <option>🇦🇺 +61</option>
                <option>🇸🇬 +65</option>
              </select>
              <input id="loginPhone" type="tel" class="form-input" placeholder="98765 43210" style="flex:1">
            </div>
          </div>
          <button type="button" class="btn-submit" onclick="showOtp()" style="margin-top:0">Send OTP →</button>
        </div>

        <!-- PROFILE ID LOGIN -->
        <div class="panel-id" id="panelId" style="display:none">
          <div class="form-group">
            <label class="form-label" for="profileId">Profile ID</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">🆔</span>
              <input id="profileId" type="text" class="form-input" placeholder="e.g. SC-TN-2024-08142">
            </div>
          </div>
          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label" for="idPwd">Password</label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            <div class="form-input-wrap">
              <span class="form-input-icon">🔒</span>
              <input id="idPwd" type="password" class="form-input" placeholder="Your password">
              <span class="form-input-suffix" onclick="togglePwd('idPwd')">👁</span>
            </div>
          </div>
        </div>

        <!-- OTP ENTRY (shown after Send OTP) -->
        <div id="panelOtp" style="display:none">
          <div class="form-group">
            <label class="form-label" style="text-align:center;display:block;margin-bottom:14px">Enter the 6-digit OTP sent to your number</label>
            <div class="otp-group" id="otpGroup">
              <input class="otp-input" type="text" maxlength="1" oninput="otpNext(this,0)">
              <input class="otp-input" type="text" maxlength="1" oninput="otpNext(this,1)">
              <input class="otp-input" type="text" maxlength="1" oninput="otpNext(this,2)">
              <input class="otp-input" type="text" maxlength="1" oninput="otpNext(this,3)">
              <input class="otp-input" type="text" maxlength="1" oninput="otpNext(this,4)">
              <input class="otp-input" type="text" maxlength="1" oninput="otpNext(this,5)">
            </div>
            <div class="otp-timer">Didn't receive it? <a href="#" onclick="resetOtp()">Resend OTP</a> in <span id="timerDisplay">00:59</span></div>
          </div>
        </div>

        <button type="submit" class="btn-submit reveal" id="mainSubmitBtn" name="login" style="transition-delay:.25s">
          Sign In ✦
        </button>
      </form>

      <div class="security-badge reveal" style="display:none; transition-delay:.28s">
        <span class="security-badge-icon">🔒</span>
        <span class="security-badge-text">256-bit SSL encrypted · Your data is safe</span>
      </div>

      <div class="auth-already reveal" style="transition-delay:.3s">
        New to Soul Connect? <a href="#"  onclick="window.location.href = (['localhost','127.0.0.1'].includes(location.hostname)
            ? 'http://localhost:5174/#register'
            : 'https://soulconect.com/#register'); return false;"
            >Create a free profile →</a>
      </div>

    </div>
  </div>

  <!-- DECORATIVE RIGHT PANEL -->
  <div class="auth-deco-side">
    <div class="auth-deco-bg"></div>
    <div class="auth-deco-pattern"></div>
    <div class="auth-deco-content">

      <div class="profile-mosaic">
        <div class="mosaic-card"><div class="mosaic-av" style="background:linear-gradient(135deg,rgba(255,255,255,.4),rgba(255,255,255,.15))">P</div><div class="mosaic-name">Priya K.</div><div class="mosaic-match">Chennai</div><div class="mosaic-badge">88% match</div></div>
        <div class="mosaic-card"><div class="mosaic-av" style="background:linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,.12))">A</div><div class="mosaic-name">Ananya S.</div><div class="mosaic-match">Bangalore</div><div class="mosaic-badge">91% match</div></div>
        <div class="mosaic-card"><div class="mosaic-av" style="background:linear-gradient(135deg,rgba(255,255,255,.3),rgba(255,255,255,.1))">D</div><div class="mosaic-name">Divya R.</div><div class="mosaic-match">Mumbai</div><div class="mosaic-badge">84% match</div></div>
        <div class="mosaic-card"><div class="mosaic-av" style="background:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.1))">M</div><div class="mosaic-name">Meera N.</div><div class="mosaic-match">Hyderabad</div><div class="mosaic-badge">79% match</div></div>
        <div class="mosaic-card"><div class="mosaic-av" style="background:linear-gradient(135deg,rgba(255,255,255,.38),rgba(255,255,255,.14))">L</div><div class="mosaic-name">Lakshmi T.</div><div class="mosaic-match">Coimbatore</div><div class="mosaic-badge">93% match</div></div>
        <div class="mosaic-card"><div class="mosaic-av" style="background:linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.08))">S</div><div class="mosaic-name">Swetha G.</div><div class="mosaic-match">Pune</div><div class="mosaic-badge">86% match</div></div>
      </div>

      <div class="deco-title">Your matches<br>are waiting</div>
      <div class="deco-subtitle">
        Sign in to see who's interested in you, respond to messages, and discover daily compatible profiles.
        <span class="tamil">உங்கள் பொருத்தங்கள் காத்திருக்கின்றன</span>
      </div>

      <div class="deco-stats">
        <div class="auth-stat">
          <div class="deco-stat-num">1,240</div>
          <div class="deco-stat-label">New profiles today</div>
        </div>
        <div class="auth-stat">
          <div class="deco-stat-num">316</div>
          <div class="deco-stat-label">Active right now</div>
        </div>
      </div>

    </div>
  </div>

</div>

<script>
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

function switchMethod(method, btn) {
  document.querySelectorAll('#methodToggle .method-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panelEmail').style.display = 'none';
  document.getElementById('panelPhone').style.display = 'none';
  document.getElementById('panelId').style.display = 'none';
  document.getElementById('panelOtp').style.display = 'none';
  const submitBtn = document.getElementById('mainSubmitBtn');
  if (method === 'email') {
    document.getElementById('panelEmail').style.display = 'block';
    submitBtn.style.display = 'flex';
    submitBtn.textContent = 'Sign In ✦';
  } else if (method === 'phone') {
    document.getElementById('panelPhone').style.display = 'block';
    submitBtn.style.display = 'none';
  } else if (method === 'id') {
    document.getElementById('panelId').style.display = 'block';
    submitBtn.style.display = 'flex';
    submitBtn.textContent = 'Sign In ✦';
  }
}

function showOtp() {
  document.getElementById('panelPhone').style.display = 'none';
  document.getElementById('panelOtp').style.display = 'block';
  const submitBtn = document.getElementById('mainSubmitBtn');
  submitBtn.style.display = 'flex';
  submitBtn.textContent = 'Verify & Sign In ✦';
  startTimer();
  document.querySelector('.otp-input').focus();
}

function resetOtp() {
  document.getElementById('panelOtp').style.display = 'none';
  document.getElementById('panelPhone').style.display = 'block';
  document.getElementById('mainSubmitBtn').style.display = 'none';
}

let timerInterval;
function startTimer() {
  clearInterval(timerInterval);
  let s = 59;
  const el = document.getElementById('timerDisplay');
  timerInterval = setInterval(() => {
    el.textContent = '00:' + String(s).padStart(2,'0');
    if (s-- <= 0) { clearInterval(timerInterval); el.textContent = '00:00'; }
  }, 1000);
}

function otpNext(input, idx) {
  const inputs = document.querySelectorAll('.otp-input');
  if (input.value && idx < 5) inputs[idx + 1].focus();
}

function togglePwd(id) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}
</script>
</body>
</html>
