<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Soul Connect – Forgot Password</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Noto+Sans+Tamil:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${url.resourcesPath}/css/styles.css">
</head>
<body>

<nav>
  <#-- <a href="index.html" class="nav-logo"><img src="img/logo.png" width="251" height="63" alt=""/></a> -->
  <div class="nav-right">
    <a href="#" class="nav-link">Browse Profiles</a>
    <a href="#" onclick="window.location.href = (['localhost','127.0.0.1'].includes(location.hostname)
            ? 'http://localhost:5174/#register'
            : 'https://soulconect.com/#register'); return false;" class="btn-nav">Join Free ✦</a>
  </div>
</nav>

<div class="page-wrapper">
  <!-- FORM SIDE (LEFT) -->
  <div class="auth-form-side">
    <div class="auth-form-wrap">

      <a href="${url.loginUrl}" class="auth-back reveal">
        ← Back to Sign In
      </a>

      <div class="reveal" style="transition-delay:.1s">
        <div class="auth-title">Forgot Your Password? 🔑</div>
        <div class="auth-subtitle">Enter your email address or username and we will send you instructions on how to create a new password.</div>
      </div>

      <#if message?has_content && (message.type != 'warning')>
        <div class="alert alert-${message.type} reveal" style="transition-delay:.12s; <#if message.type == 'error'>background: #fee2e2; color: #b91c1c; border: 1px solid #f87171;<#else>background: #d1fae5; color: #065f46; border: 1px solid #34d399;</#if> padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 14px; text-align: center;">
            ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form id="kc-reset-password-form" action="${url.loginAction}" method="post" style="margin-top: 24px;">
        <div class="reveal" style="transition-delay:.22s">
          <div class="form-group">
            <label class="form-label" for="username"><#if !realm.loginWithEmailAllowed>Username<#elseif !realm.registrationEmailAsUsername>Username or Email Address<#else>Email Address</#if></label>
            <div class="form-input-wrap">
              <span class="form-input-icon">✉</span>
              <input id="username" name="username" type="text" class="form-input" placeholder="you@example.com" autofocus value="${(auth.attemptedUsername!'')}">
            </div>
          </div>
        </div>

        <button type="submit" class="btn-submit reveal" style="transition-delay:.25s; margin-top: 24px;">
          Send Reset Instructions ✦
        </button>
      </form>

      <div class="auth-already reveal" style="transition-delay:.3s; margin-top: 24px;">
        Remember your password? <a href="${url.loginUrl}">Sign in here →</a>
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
</script>
</body>
</html>
