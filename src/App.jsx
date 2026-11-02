<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ranking de Pontos</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;900&family=Black+Ops+One&family=Archivo+Black&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
:root {
  --bg: #080808;
  --s1: #141414;
  --s2: #1c1c1c;
  --border: rgba(255,255,255,0.09);
  --gold: #ffd060;
  --silver: #c8d6e5;
  --bronze: #e8965a;
  --accent: #e8ff00;
  --accent2: #fff35c;
  --green: #3de89a;
  --text: #f4f4ef;
  --muted: #8a8a8a;
  --red: #ff5f6d;
}
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(232,255,0,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232,255,0,0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}
.orb { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; opacity:.35; }
.orb1 { width:400px;height:400px;background:#1a3a8f;top:-100px;left:-100px; }
.orb2 { width:300px;height:300px;background:#0d2f5c;bottom:-80px;right:-80px; }

/* HEADER */
.header { text-align:center; padding:56px 24px 32px; }
.header-eyebrow { font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:12px;opacity:0;animation:fadeUp .6s ease forwards; }
.header-title { font-family:'Bebas Neue',sans-serif;font-size:clamp(56px,10vw,96px);letter-spacing:4px;line-height:.9;background:linear-gradient(160deg,#fff 30%,#e8ff00 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:0;animation:fadeUp .6s ease .1s forwards; }
.header-sub { margin-top:12px;font-size:15px;color:var(--muted);font-weight:400;opacity:0;animation:fadeUp .6s ease .2s forwards; }
.update-time { display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-size:12px;color:var(--muted);background:var(--s1);border:1px solid var(--border);padding:6px 14px;border-radius:20px;opacity:0;animation:fadeUp .6s ease .3s forwards; }
.live-dot { width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

/* PODIUM */
.podium-wrap { max-width:680px;margin:0 auto 48px;padding:0 24px;opacity:0;animation:fadeUp .7s ease .4s forwards; }
.podium { display:flex;align-items:flex-end;justify-content:center;gap:12px;height:240px; }
.podium-slot { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative; }
.podium-card { width:100%;border-radius:16px 16px 0 0;display:flex;flex-direction:column;align-items:center;padding:20px 12px 16px;position:relative;overflow:hidden;transition:transform .2s; }
.podium-card:hover { transform:translateY(-4px); }
.podium-1 .podium-card { background:linear-gradient(160deg,rgba(255,208,96,.18),rgba(255,208,96,.06));border:1px solid rgba(255,208,96,.3);min-height:180px;height:auto;padding-top:24px;padding-bottom:20px; }
.podium-2 .podium-card { background:linear-gradient(160deg,rgba(200,214,229,.12),rgba(200,214,229,.04));border:1px solid rgba(200,214,229,.2);min-height:140px;height:auto;padding-top:20px;padding-bottom:16px; }
.podium-3 .podium-card { background:linear-gradient(160deg,rgba(232,150,90,.12),rgba(232,150,90,.04));border:1px solid rgba(232,150,90,.2);min-height:120px;height:auto;padding-top:20px;padding-bottom:16px; }
.podium-pos { font-family:'Bebas Neue',sans-serif;font-size:40px;line-height:1; }
.podium-1 .podium-pos{color:var(--gold)} .podium-2 .podium-pos{color:var(--silver)} .podium-3 .podium-pos{color:var(--bronze)}
.podium-emoji { font-size:28px;margin:4px 0; }
.podium-name { font-size:13px;font-weight:700;text-align:center;line-height:1.2; }
.podium-pts { font-size:20px;font-weight:900;margin-top:4px; }
.podium-1 .podium-pts{color:var(--gold)} .podium-2 .podium-pts{color:var(--silver)} .podium-3 .podium-pts{color:var(--bronze)}
.crown { position:absolute;top:-14px;font-size:22px;animation:float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

/* RANKING LIST */
.ranking-wrap { max-width:680px;margin:0 auto;padding:0 24px 100px; }
.ranking-card { background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden; }
.rank-item { display:flex;align-items:center;gap:16px;padding:18px 24px;border-bottom:1px solid var(--border);transition:background .15s;opacity:0;animation:fadeUp .5s ease forwards; }
.rank-item:last-child { border-bottom:none; }
.rank-item:hover { background:rgba(232,255,0,.06); }
.rank-num { font-family:'Bebas Neue',sans-serif;font-size:22px;min-width:32px;text-align:center;color:var(--muted); }
.rank-avatar { width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:var(--s2);border:1px solid var(--border); }
.rank-info { flex:1;min-width:0; }
.rank-name { font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
.rank-name-text { white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%; }
.rank-badge-small { font-size:10px;color:var(--muted);font-weight:500;letter-spacing:.5px;margin-top:2px; }
.rank-bar-wrap { flex:1;display:flex;flex-direction:column;gap:4px; }
.rank-bar { height:4px;background:var(--s2);border-radius:4px;overflow:hidden; }
.rank-bar-fill { height:100%;border-radius:4px;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width 1.2s cubic-bezier(.34,1.56,.64,1); }
.rank-pts { font-size:22px;font-weight:900;color:var(--accent);min-width:64px;text-align:right; }
.rank-pts-label { font-size:10px;color:var(--muted);text-align:right;font-weight:500; }
.empty-state { text-align:center;padding:64px 24px;color:var(--muted);font-size:14px; }
.bonus-badge { display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,rgba(61,232,154,0.18),rgba(61,232,154,0.08));border:1px solid rgba(61,232,154,0.35);color:var(--green);font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;margin-left:6px;letter-spacing:0.3px;vertical-align:middle; }
.challenge-badge { display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,rgba(255,208,96,0.2),rgba(255,140,0,0.1));border:1px solid rgba(255,208,96,0.4);color:var(--gold);font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;margin-left:4px;letter-spacing:0.3px;vertical-align:middle;animation:glowPulse 2s ease-in-out infinite; }
.category-badges { font-size:12px;letter-spacing:1px;vertical-align:middle; }
.challenge-tag { display:inline-block;font-size:9px;font-weight:800;color:var(--accent);background:rgba(232,255,0,0.1);border:1px solid rgba(232,255,0,0.3);padding:2px 7px;border-radius:7px;margin-top:3px;letter-spacing:.3px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.stars-legend { font-size:11px;color:var(--muted);margin:-6px 0 14px;text-align:center; }
@keyframes glowPulse { 0%,100%{box-shadow:0 0 4px rgba(255,208,96,0.2)} 50%{box-shadow:0 0 10px rgba(255,208,96,0.5)} }
.rank-last-seen { font-size:10px;color:var(--muted);margin-top:2px;font-family:'DM Mono',monospace; }
.quick-tap-item { display:flex;align-items:center;gap:12px;padding:13px 14px;background:var(--s2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;cursor:pointer;transition:all .15s;user-select:none; }
.quick-tap-item:hover { border-color:var(--accent); }
.quick-tap-item:active { transform:scale(.97);background:rgba(232,255,0,0.15); }
.quick-tap-item.flash { animation:flashGreen .5s ease; }
@keyframes flashGreen { 0%{background:rgba(61,232,154,.35);border-color:var(--green);} 100%{background:var(--s2);border-color:var(--border);} }
.qt-avatar { font-size:20px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:var(--s1);border-radius:50%;flex-shrink:0; }
.qt-name { flex:1;font-size:14px;font-weight:700; }
.qt-pts { font-size:16px;font-weight:900;color:var(--accent);min-width:40px;text-align:right; }
.qt-plus { width:32px;height:32px;border-radius:50%;background:var(--green);color:#061510;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;flex-shrink:0; }
.qt-search { width:100%;margin-bottom:14px; }
.rank-item.top-1 { background:linear-gradient(90deg,rgba(255,208,96,0.13),transparent);border-left:3px solid var(--gold); }
.rank-item.top-1 .rank-num { color:var(--gold);font-size:28px; }
.rank-item.top-1 .rank-pts { color:var(--gold);font-size:26px; }
.rank-item.top-1 .rank-name { font-size:17px; }
.rank-item.top-2 { background:linear-gradient(90deg,rgba(200,214,229,0.1),transparent);border-left:3px solid var(--silver); }
.rank-item.top-2 .rank-num { color:var(--silver);font-size:25px; }
.rank-item.top-2 .rank-pts { color:var(--silver); }
.rank-item.top-3 { background:linear-gradient(90deg,rgba(232,150,90,0.1),transparent);border-left:3px solid var(--bronze); }
.rank-item.top-3 .rank-num { color:var(--bronze);font-size:23px; }
.rank-item.top-3 .rank-pts { color:var(--bronze); }
/* 👻 CEMITÉRIO — sem pontuar há mais de 60 dias */
.rank-item.ghost { background:rgba(255,255,255,0.012); }
.rank-item.ghost > * { filter:grayscale(.9); opacity:.5; transition:opacity .2s; }
.rank-item.ghost:hover { background:rgba(255,255,255,0.03); }
.rank-item.ghost:hover > * { opacity:.8; }
.rank-item.ghost .rank-num { font-size:20px; opacity:.85; filter:none; }
.rank-item.ghost .rank-bar-fill { background:#5a5a5a; }
.ghost-divider { font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);text-align:center;padding:14px 24px 10px;border-top:1px solid var(--border);background:rgba(0,0,0,0.25);opacity:.85; }
/* 📺 Modo painel: celular na horizontal / TV → equipes lado a lado */
.mt-gname{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:1px}
.mt-gtotal{font-family:'Bebas Neue',sans-serif;font-size:62px;line-height:1}
.mt-ggoal{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--muted)}
.mt-pct{font-size:13px;font-weight:700}
#meta-groups{display:block}
@media (orientation:landscape) and (min-width:640px){
  body .mt-wrap{max-width:1700px;padding:12px 18px 40px}
  body .mt-head{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px !important}
  .mt-head img{margin:0 !important;max-height:46px !important;max-width:18% !important}
  #meta-title{font-size:clamp(22px,3.2vw,56px) !important}
  #meta-groups{display:grid;grid-template-columns:repeat(var(--cols,2),minmax(0,1fr));gap:14px;align-items:start}
  #meta-groups .mt-card{margin-bottom:0;padding:clamp(10px,1.3vw,24px)}
  #meta-single,#meta-clock,#meta-final,#meta-staff,#meta-pub{max-width:900px;margin-left:auto;margin-right:auto}
  .mt-gname{font-size:clamp(17px,2.3vw,44px)}
  .mt-gtotal{font-size:clamp(38px,6.4vw,124px)}
  .mt-ggoal{font-size:clamp(15px,2.2vw,42px)}
  .mt-pct{font-size:clamp(10px,1.2vw,22px)}
  #meta-groups .mt-live{font-size:clamp(9px,1vw,16px);padding:4px 8px}
  #meta-groups .mt-bar{height:clamp(16px,2.2vw,36px);margin:8px 0 6px}
  #meta-groups svg{height:clamp(70px,12vw,200px) !important}
  #meta-groups .mt-left{padding:clamp(6px,.9vw,16px)}
  #meta-groups .mt-left b{font-size:clamp(34px,5.4vw,100px)}
  #meta-groups .mt-left span{font-size:clamp(9px,1vw,16px)}
  #meta-groups .mt-stats b{font-size:clamp(20px,2.8vw,50px)}
  #meta-groups .mt-stats span{font-size:clamp(9px,1vw,16px)}
  #meta-groups .mt-chip{font-size:clamp(9px,1.1vw,17px)}
  #meta-clock div:nth-child(2){font-size:clamp(40px,7vw,110px) !important}
}
@media (orientation:landscape) and (max-height:520px){   /* celular deitado: só o essencial para comparar de relance */
  #meta-groups .mt-names,#meta-groups .mt-foot,#meta-groups svg,#meta-groups .mt-stats,#meta-pub,.mt-lockrow{display:none !important}
  body .mt-wrap{padding:6px 14px 20px}
  body .mt-head{margin-bottom:6px !important}
  #meta-groups .mt-card{padding:10px 12px}
  #meta-groups .mt-live{white-space:nowrap}
  #meta-groups .mt-left{margin:8px 0 0}
  #meta-groups .mt-left b{font-size:clamp(28px,5vw,64px)}
}
}
.meta-tv #meta-pub,.meta-tv #meta-staff,.meta-tv #meta-lock-btn,.meta-tv .mt-lockrow,.meta-tv .mt-foot{display:none !important}
.meta-tv .mt-wrap{max-width:none;padding:18px 32px}
/* 🏁 Meta coletiva */
body.meta-mode{background:#0b0b0b !important;padding:0 !important}
body.meta-mode::before,body.meta-mode::after{display:none !important}
.mt-left{margin:14px 0 6px;border:2px solid;border-radius:18px;padding:12px 10px;text-align:center}
.mt-left span{display:block;font-size:12px;font-weight:800;letter-spacing:2px;color:var(--muted)}
.mt-left b{display:block;font-family:'Bebas Neue',sans-serif;font-size:68px;line-height:1.05}
.mt-left small{font-size:28px}
.mt-share{display:block;width:100%;margin-top:14px;padding:16px 12px;border:none;border-radius:16px;font-family:'Outfit',sans-serif;cursor:pointer;text-align:center;box-shadow:0 6px 22px rgba(0,0,0,.35)}
.mt-share span{display:block;font-weight:900;font-size:15px;letter-spacing:.5px}
.mt-share small{display:block;font-weight:600;font-size:11px;opacity:.75;margin-top:3px}
.cad-up, .cad-up * { text-transform:uppercase; }
.cad-sug{max-height:200px;overflow:auto;border:1px solid var(--border);border-radius:10px;background:var(--s2);margin-top:6px}
.cad-sug div{padding:12px 14px;border-top:1px solid var(--border);font-size:14px;font-weight:600;cursor:pointer}
.cad-sug div:first-child{border-top:0}
.mt-tiny{padding:7px 14px;border:1px solid var(--border);background:var(--s2);color:var(--muted);border-radius:20px;font-family:'Outfit',sans-serif;font-weight:700;font-size:12px;cursor:pointer}
.mt-tiny.warn{color:var(--red);border-color:rgba(255,95,109,.4)}
#meta-staff .btn:disabled{opacity:.4;filter:grayscale(.5)}
.mt-names{margin-top:14px}
.mt-names-t{font-size:11px;letter-spacing:1.5px;color:var(--muted);font-weight:800;margin-bottom:8px}
.mt-chip{display:inline-block;margin:0 6px 6px 0;padding:5px 10px;border:1px solid;border-radius:14px;font-size:12px;font-weight:600;background:var(--s2)}
.mt-chip i{font-style:normal;font-weight:800}
.mt-foot{margin-top:14px;text-align:center;font-size:9.5px;letter-spacing:1.2px;color:var(--muted);opacity:.75}
.mt-vb{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;vertical-align:middle}
.mt-vb.ok{background:rgba(61,232,154,.15);color:var(--green)}
.mt-vb.warn{background:rgba(255,208,96,.15);color:var(--gold)}
.mt-linkrow{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid var(--border);font-size:13px}
.mt-linkrow:first-child{border-top:0}
.mt-linkrow .mt-tiny{margin-left:6px}
.mt-lock{padding:8px 14px;border:1px solid var(--border);background:var(--s1);color:var(--text);border-radius:20px;font-family:'Outfit',sans-serif;font-weight:700;font-size:12px;cursor:pointer}
.mt-pt{min-width:0;padding:10px 8px !important;font-size:17px !important;line-height:1.1}
.mt-pt small{display:block;margin-top:3px;font-size:10.5px;font-weight:600;letter-spacing:.2px;opacity:.85}
.mt-gsm .mt-gchip{padding:10px 8px;font-size:14px;min-width:96px}
.mt-roster{display:flex;flex-wrap:wrap;gap:6px;max-height:170px;overflow:auto;margin:-2px 0 12px}
.mt-rchip{padding:5px 9px;border:1px solid var(--border);background:var(--s2);color:var(--text);border-radius:14px;font-size:12px;font-weight:600;font-family:'Outfit',sans-serif;cursor:pointer}
.mt-rchip i{font-style:normal;font-weight:800;margin-right:4px}
.mt-rchip.on{background:var(--accent);color:#0a0a0a;border-color:var(--accent)}
.mt-gchips{display:flex;flex-wrap:wrap;gap:10px}
.mt-gchip{flex:1;min-width:110px;padding:16px 10px;border:3px solid;border-radius:14px;font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;cursor:pointer}
.mt-wrap{max-width:520px;margin:0 auto;padding:22px 18px 70px}
.mt-card{background:var(--s1);border:1px solid var(--border);border-radius:20px;padding:20px 18px;margin-bottom:16px}
.mt-live{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:1px;padding:6px 12px;border-radius:20px;background:rgba(232,255,0,.1);color:var(--accent)}
.mt-live i{width:8px;height:8px;border-radius:50%;background:currentColor;animation:mtPulse 1.2s infinite}
@keyframes mtPulse{50%{opacity:.25}}
.mt-bar{height:30px;background:#222;border-radius:16px;overflow:hidden;margin:14px 0 8px}
.mt-fill{height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:16px;transition:width .9s ease}
.mt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px;text-align:center}
.mt-stats b{display:block;font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:1px}
.mt-stats span{font-size:11px;color:var(--muted)}
.mt-row{padding:12px 0;border-top:1px solid var(--border)}
.mt-row:first-child{border-top:0}
.mt-mini{height:6px;background:#222;border-radius:4px;overflow:hidden;margin:6px 0 4px}
.mt-mini div{height:100%;background:var(--accent)}
/* 🏅 Distintivos */
.bd-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.bd-card{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:14px 8px 12px;text-align:center;cursor:pointer}
.bd-card:active{transform:scale(.98)}
.bd-name{font-weight:800;font-size:13px;margin-top:6px}.bd-count{font-size:11px;color:var(--muted);margin-top:2px}
.bd-mini{display:inline-flex;gap:2px;align-items:center;margin-left:6px;vertical-align:middle;font-size:10px;color:var(--muted)}
.bd-opts{display:flex;flex-wrap:wrap;gap:8px}
.bd-opt{padding:8px 12px;border:2px solid var(--border);background:var(--s2);color:var(--text);border-radius:10px;font-size:12px;font-weight:700;font-family:'Outfit',sans-serif;cursor:pointer}
.bd-opt.on{border-color:var(--accent);color:var(--accent)}
.bd-sw{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer;padding:0}
.bd-sw.on{border-color:#fff}
.bd-mem{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s2);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;font-size:14px}
.bd-chip{display:inline-flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:12px;margin:3px 4px 0 0}
.bd-ov{position:fixed;inset:0;background:#050505;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px}
.bd-ov.open{display:flex}
.bd-box{background:var(--s1);border:1px solid var(--border);border-radius:20px;padding:22px 18px;max-width:340px;width:100%;max-height:85vh;overflow:auto;text-align:center}
.section-label { font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px; }
.section-label::after { content:'';flex:1;height:1px;background:var(--border); }
.filter-tabs { display:flex;gap:8px;margin-bottom:16px; }
.filter-tab { padding:8px 18px;border:1px solid var(--border);background:var(--s1);color:var(--muted);border-radius:20px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s; }
.filter-tab.active { background:var(--accent);color:#0a0a00;border-color:var(--accent); }
.filter-tab:hover:not(.active) { color:var(--text);border-color:var(--muted); }
.filter-tab.kids-tab.active { background:linear-gradient(135deg,#7dd3f5,#a8e6ff);color:#0a2a3a;border-color:#7dd3f5; }
.rank-item.kids-item { background:linear-gradient(90deg,rgba(125,211,245,0.08),transparent);border-left:3px solid #7dd3f5; }
.rank-item.kids-item .rank-avatar { border:2px solid #a8e6ff;box-shadow:0 0 0 3px rgba(125,211,245,0.2); }
.kids-badge { display:inline-flex;align-items:center;gap:3px;background:linear-gradient(135deg,#7dd3f5,#a8e6ff);color:#0a2a3a;font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;margin-left:6px;vertical-align:middle;white-space:nowrap; }

/* MAIN NAV TABS */
.main-tabs { max-width:680px;margin:0 auto 32px;padding:0 24px;display:flex;gap:8px;opacity:0;animation:fadeUp .6s ease .35s forwards; }
.main-tab { flex:1;padding:12px 8px;border:1px solid var(--border);background:var(--s1);color:var(--muted);border-radius:14px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:2px; }
.main-tab span.mt-icon { font-size:18px; }
.main-tab.active { background:linear-gradient(135deg,rgba(232,255,0,.18),rgba(232,255,0,.06));color:var(--text);border-color:var(--accent); }
.main-tab:hover:not(.active) { color:var(--text);border-color:var(--muted); }
.view-section { display:none; }
.view-section.active { display:block; }

/* VIDEO GRID */
.video-wrap { max-width:680px;margin:0 auto;padding:0 24px 100px; }
.video-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
.video-card { background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .2s;text-decoration:none;color:var(--text);display:block; }
.video-card:hover { border-color:var(--accent);transform:translateY(-2px); }
.video-thumb-wrap { position:relative;width:100%;aspect-ratio:9/16;background:var(--s2);overflow:hidden; }
.video-thumb-wrap img { width:100%;height:100%;object-fit:cover;display:block; }
.video-play { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(6,8,15,0.15); }
.video-play::after { content:'▶';width:40px;height:40px;background:rgba(6,8,15,.55);border:1px solid rgba(255,255,255,.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;backdrop-filter:blur(4px); }
.video-title { padding:10px 12px;font-size:12px;font-weight:700;line-height:1.3; }
.video-desc { padding:0 12px 10px;font-size:11px;color:var(--muted);line-height:1.4; }
/* EVENTO */
.event-hero { background:linear-gradient(135deg,rgba(232,255,0,0.12),rgba(232,255,0,0.03));border:1px solid rgba(232,255,0,0.3);border-radius:20px;padding:22px 20px;margin-bottom:20px; }
.birthday-card {
  position:relative;
  overflow:hidden;
  background:linear-gradient(120deg, #0a1a3a 0%, #1552c9 40%, #2d7dff 70%, #10306e 100%);
  background-size:200% 200%;
  animation:birthdayShift 4s ease-in-out infinite;
  border:1px solid rgba(45,125,255,0.6);
  border-radius:18px;
  padding:16px 20px;
  text-align:center;
  color:#fff;
  box-shadow:0 6px 24px rgba(21,82,201,0.4);
}
@keyframes birthdayShift {
  0%,100% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
}
.birthday-confetti { position:absolute;font-size:22px;top:-4px;left:12px;opacity:.5;animation:floatUp 3s ease-in-out infinite; }
.birthday-confetti-2 { left:auto;right:12px;top:auto;bottom:-4px;animation-delay:1.2s; }
@keyframes floatUp { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-6px) rotate(8deg);} }
.whatsapp-event-btn { width:100%;margin-top:8px;padding:14px;border:none;border-radius:12px;background:#25D366;color:#062e13;font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;cursor:pointer;text-decoration:none;justify-content:center;gap:8px;transition:filter .2s; }
.whatsapp-event-btn.show { display:flex !important;align-items:center; }
.whatsapp-event-btn:hover { filter:brightness(1.08); }
.event-name { font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:1px;line-height:1; }
.event-meta { font-size:12px;color:var(--muted);margin-top:6px;line-height:1.5; }
.event-desc { font-size:13px;color:var(--text);margin-top:10px;line-height:1.5;white-space:pre-line; }
.dual-info-card { border-radius:14px;padding:14px 16px; }
.dual-info-card-1 { background:rgba(45,125,255,0.08);border:1px solid rgba(45,125,255,0.3); }
.dual-info-card-2 { background:rgba(255,208,96,0.08);border:1px solid rgba(255,208,96,0.3); }
.dual-info-title { font-weight:800;font-size:14px;margin-bottom:4px; }
.dual-info-meta { font-size:12px;color:var(--muted);margin-bottom:6px; }
.dual-info-desc { font-size:12.5px;color:var(--text);line-height:1.5;margin-bottom:8px;white-space:pre-line; }
.dual-info-capacity { font-size:11.5px;font-weight:700; }
.dual-info-capacity.full { color:var(--red); }
.dual-info-capacity.ok { color:var(--green); }
.capacity-wrap { margin-top:16px; }
.capacity-label { font-size:11px;color:var(--muted);display:flex;justify-content:space-between;margin-bottom:6px; }
.capacity-bar { height:10px;background:var(--s2);border-radius:6px;overflow:hidden; }
.capacity-fill { height:100%;border-radius:6px;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .6s ease; }
.capacity-fill.full { background:linear-gradient(90deg,var(--red),#ff8f8f); }
.capacity-full-msg { text-align:center;font-size:13px;font-weight:700;color:var(--red);margin-top:14px;padding:10px;background:rgba(255,95,109,0.1);border:1px solid rgba(255,95,109,0.3);border-radius:12px; }
/* Botão grande de inscrição + destaque das opções */
.ev-cta { display:none;width:100%;margin-top:18px;padding:18px 14px;border:none;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#0a0a00;font-family:'Outfit',sans-serif;font-weight:900;font-size:17px;letter-spacing:.5px;cursor:pointer;box-shadow:0 6px 22px rgba(232,255,0,0.28);animation:ctaPulse 2s ease-in-out infinite; }
.ev-cta:active { transform:scale(.98); }
.ev-cta-sub { display:block;font-weight:600;font-size:11px;opacity:.7;margin-top:3px;letter-spacing:0; }
@keyframes ctaPulse { 0%,100%{box-shadow:0 6px 22px rgba(232,255,0,0.22)} 50%{box-shadow:0 6px 32px rgba(232,255,0,0.5)} }
.ev-choose-title { font-size:13px;font-weight:800;color:var(--accent);letter-spacing:.5px;margin-bottom:10px;text-align:center; }
@keyframes attnGlow { 0%,100%{box-shadow:0 0 0 rgba(232,255,0,0);transform:scale(1)} 50%{box-shadow:0 0 18px rgba(232,255,0,0.55);transform:scale(1.03)} }
.member-toggle.attn button:not(:disabled) { animation:attnGlow .9s ease 2; }
.member-toggle { display:flex;gap:8px;margin-bottom:16px; }
.member-toggle button { flex:1;padding:18px 12px;min-height:64px;border:2px solid rgba(232,255,0,0.35);background:var(--s1);color:var(--text);border-radius:14px;font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;cursor:pointer;transition:all .25s; }
.member-toggle button.active { background:var(--accent);color:#0a0a00;border-color:var(--accent); }
.member-toggle button:not(.active):hover { border-color:var(--muted);color:var(--text); }
#event-fields-wrap { display:none; }
.member-toggle button#mt-is-member { position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:8px; }
.member-toggle button#mt-is-member.active {
  background:linear-gradient(135deg, #0a1a3a 0%, #10306e 35%, #1a4fb8 65%, #000000 100%);
  color:#fff;
  border-color:#1a4fb8;
  box-shadow:0 4px 16px rgba(26,79,184,0.35);
}
.mt-member-logos { display:flex;align-items:center;gap:4px;flex-shrink:0; }
.mt-member-logos img { height:22px;width:auto;object-fit:contain;border-radius:4px; }
@media(max-width:420px){ .mt-member-logos img{ height:18px; } .member-toggle button#mt-is-member{ font-size:11px;gap:5px; } }
.reg-chip { display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border); }
.reg-chip:last-child { border-bottom:none; }
.reg-chip-info { flex:1;min-width:0; }
.reg-chip-name { font-size:13px;font-weight:700; }
.reg-chip-meta { font-size:11px;color:var(--muted); }
.reg-member-badge { font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;background:rgba(232,255,0,0.12);color:var(--accent);border:1px solid rgba(232,255,0,0.3); }
.reg-guest-badge { font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.06);color:var(--muted);border:1px solid var(--border); }
.attend-btns { display:flex;gap:4px; }
.attend-btns-wrap { display:flex;align-items:center;gap:8px;flex-shrink:0; }
.attend-dual-wrap { display:flex;flex-direction:column;gap:6px;margin-top:8px; }
.attend-dual-row { display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--s2);border-radius:10px;padding:6px 10px; }
.attend-dual-label { font-size:11px;font-weight:700;color:var(--muted);flex:1; }
.attend-btn { padding:6px 10px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;border:1px solid var(--border);background:var(--s2);color:var(--muted); }
.attend-btn.yes.active { background:rgba(61,232,154,.15);color:var(--green);border-color:rgba(61,232,154,.4); }
.attend-btn.no.active { background:rgba(255,95,109,.15);color:var(--red);border-color:rgba(255,95,109,.4); }
.attend-btn.reset { color:var(--muted);opacity:.7; }
.attend-btn.reset:hover { opacity:1;border-color:var(--muted); }
.blocked-msg { text-align:center;padding:20px;background:rgba(255,95,109,0.08);border:1px solid rgba(255,95,109,0.3);border-radius:14px;font-size:13px;color:var(--red);font-weight:600;line-height:1.5; }

/* LANÇAMENTO DE RESULTADO — painel único, vertical, sem estouro lateral */
.result-panel { background:var(--s1);border:1px solid var(--border);border-radius:18px;padding:18px;margin-bottom:16px; }
.result-timecap-note { font-size:13px;color:var(--muted);margin-bottom:14px;text-align:center;background:var(--s2);border-radius:10px;padding:10px; }
.result-timecap-note strong { color:var(--accent);font-size:16px; }
.result-actions-row { display:flex;flex-direction:column;gap:8px;margin-bottom:14px; }
.result-actions-row button { width:100%;padding:14px;border-radius:12px;font-weight:800;font-size:15px;border:1px solid var(--border);cursor:pointer;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px; }
.btn-calc { background:var(--accent);color:#0a0a00;border-color:var(--accent) !important; }
.btn-timecap { background:var(--red) !important;color:#fff !important;border-color:var(--red) !important;text-align:center;justify-content:center; }
.btn-timecap:hover { filter:brightness(1.1); }
.result-final-input { width:100%;padding:16px;font-size:20px;font-weight:800;text-align:center;font-family:'DM Mono',monospace;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text); }
.result-saved-tag { font-size:12px;color:var(--green);text-align:center;margin-top:8px; }

/* BOARD DE RESULTADOS (público) */
.results-board { max-width:680px;margin:0 auto 24px;padding:0 24px; }
.results-group { margin-bottom:18px; }
.results-group-title { font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:8px; }
.results-group-desc { font-size:11px;color:var(--muted);margin:-4px 0 8px 30px;line-height:1.4; }
.results-subevent-header { font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;margin:18px 0 10px;padding-bottom:8px;border-bottom:2px solid rgba(45,125,255,0.3);color:#fff; }
.results-subevent-header:first-child { margin-top:0; }
.results-list { background:var(--s1);border:1px solid var(--border);border-radius:16px;overflow:hidden; }
.results-item { display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);font-size:13px; }
.results-item:last-child { border-bottom:none; }
.results-item-name { font-weight:700; }
.results-item-value { font-family:'DM Mono',monospace;color:var(--accent);font-weight:700; }
.results-header-row { display:flex;justify-content:space-between;align-items:center;padding:6px 16px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:700; }

/* Descrição por participante no board público */
.results-item-name { min-width:0; }
.results-item-note { display:block; font-weight:400; font-size:11px; color:var(--muted); margin-top:2px; line-height:1.35; }
.results-item-value { margin-left:12px; flex-shrink:0; }
.tv-link-btn { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:var(--accent); text-decoration:none; background:var(--s1); border:1px solid rgba(232,255,0,.3); padding:8px 14px; border-radius:20px; }
.tv-link-btn:hover { background:rgba(232,255,0,.1); }

/* MODO TV — link ?tv=resultados (só resultados, letras grandes, atualiza sozinho) */
#tv-results-view { display:none; position:fixed; inset:0; z-index:500; flex-direction:column; overflow:hidden; color:var(--text);
  background:radial-gradient(1200px 700px at 12% -10%, rgba(26,58,143,.55), transparent 60%), radial-gradient(900px 600px at 100% 110%, rgba(13,47,92,.6), transparent 60%), var(--bg); }
#tv-results-view.on { display:flex; }
.tv-head { flex:0 0 auto; text-align:center; padding:2.4vh 3vw 1vh; }
.tv-eyebrow { font-size:1.6vh; letter-spacing:.5em; text-transform:uppercase; color:var(--accent); font-weight:700; }
.tv-title { font-family:'Bebas Neue',sans-serif; font-size:7.5vh; letter-spacing:.08em; line-height:1.05; background:linear-gradient(160deg,#fff 30%,#e8ff00 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.tv-cap { display:inline-block; margin-top:.4vh; font-size:2.2vh; font-weight:800; color:var(--red); letter-spacing:.12em; }
.tv-body { flex:1 1 auto; min-height:0; display:grid; gap:2vw; padding:1vh 3vw 2.5vh; }
.tv-panel { min-width:0; min-height:0; display:flex; flex-direction:column; }
.tv-panel-title { font-family:'Bebas Neue',sans-serif; font-size:4.4vh; letter-spacing:.06em; padding-bottom:.8vh; margin-bottom:1.2vh; border-bottom:.35vh solid rgba(232,255,0,.35); flex:0 0 auto; }
.tv-panel-title .tv-cap { font-size:2.2vh; margin:0 0 0 1.2vw; }
.tv-groups { flex:1 1 auto; min-height:0; display:grid; gap:1.6vw; }
.tv-groups.stacked { gap:1.6vh; }
.tv-group { min-width:0; min-height:0; display:flex; flex-direction:column; background:var(--s1); border:1px solid var(--border); border-radius:1.6vh; overflow:hidden; }
.tv-group-title { font-family:'Bebas Neue',sans-serif; font-size:3.8vh; letter-spacing:.05em; padding:1.2vh 1.4vw; background:rgba(255,255,255,.05); border-bottom:1px solid var(--border); flex:0 0 auto; }
.tv-scroll { flex:1 1 auto; min-height:0; overflow:hidden; }
.tv-row { display:flex; align-items:center; gap:1.1vw; padding:1.2vh 1.4vw; border-bottom:1px solid var(--border); }
.tv-row:last-child { border-bottom:none; }
.tv-pos { flex:0 0 4.6vh; text-align:center; font-family:'Bebas Neue',sans-serif; font-size:3.4vh; color:var(--muted); }
.tv-who { flex:1 1 auto; min-width:0; }
.tv-name { font-weight:800; font-size:3.3vh; line-height:1.12; overflow-wrap:anywhere; }
.tv-note { font-size:2.2vh; color:var(--muted); margin-top:.4vh; line-height:1.25; overflow-wrap:anywhere; }
.tv-val { flex:0 0 auto; font-family:'Bebas Neue',sans-serif; font-size:4.8vh; color:var(--accent); letter-spacing:.04em; font-variant-numeric:tabular-nums; }
.tv-val.cap { color:var(--red); font-size:3.2vh; }
.tv-row.p1 .tv-val { color:var(--gold); }
.tv-row.p2 .tv-val { color:var(--silver); }
.tv-row.p3 .tv-val { color:var(--bronze); }
.tv-row.p1 { background:rgba(255,208,96,.07); }
.tv-empty { margin:auto; text-align:center; font-family:'Bebas Neue',sans-serif; font-size:6vh; letter-spacing:.1em; color:var(--muted); }
.tv-live { position:fixed; left:1.5vw; bottom:1.2vh; font-size:1.5vh; color:var(--muted); display:flex; align-items:center; gap:.5vw; opacity:.8; }
.tv-fs { position:fixed; top:1.5vh; right:1.5vw; opacity:0; transition:opacity .3s; background:var(--s1); color:var(--text); border:1px solid var(--border); border-radius:10px; padding:8px 14px; font-family:'Outfit',sans-serif; font-weight:700; cursor:pointer; }
#tv-results-view:hover .tv-fs { opacity:.9; }

/* LANÇAR RESULTADOS (equipe) */
#lancar-view { display:none; position:relative; z-index:2; min-height:100vh; }
#lancar-view.on { display:block; }
.lv-wrap { max-width:520px; margin:0 auto; padding:28px 18px 70px; }
.lv-head { text-align:center; margin-bottom:20px; }
.lv-eyebrow { font-size:11px; letter-spacing:4px; text-transform:uppercase; color:var(--accent); font-weight:600; }
.lv-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(40px,12vw,60px); letter-spacing:3px; line-height:1; background:linear-gradient(160deg,#fff 30%,#e8ff00 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.lv-event { margin-top:8px; font-size:14px; color:var(--muted); }
.lv-bar { display:flex; gap:8px; margin-bottom:14px; }
.lv-bar .btn-sm { flex:1; padding:10px; }
#lancar-view #result-entry-label { display:none !important; }
#lancar-view #result-subevent-selector-wrap { display:none !important; }

/* Nº de inscrição / pulseira */
.bib-badge { display:inline-block; background:rgba(255,208,96,.14); color:var(--gold); border:1px solid rgba(255,208,96,.4); border-radius:8px; font-size:11px; font-weight:800; padding:2px 8px; margin-right:6px; letter-spacing:.5px; }
.er-who { font-weight:800; font-size:17px; line-height:1.2; }
.er-when { font-size:12px; color:var(--muted); margin:3px 0 14px; }
.er-hero { background:rgba(232,255,0,.07); border:1.5px solid rgba(232,255,0,.4); border-radius:18px; padding:16px; margin-bottom:12px; }
.er-hero-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; color:var(--accent); margin-bottom:10px; }
.er-bib-input { font-size:26px !important; font-weight:800; text-align:center; letter-spacing:2px; }
.er-hint { font-size:11.5px; color:var(--muted); line-height:1.45; margin-top:6px; }
.er-section-title { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; margin:22px 0 4px; padding-top:16px; border-top:1px solid var(--border); }

/* CONTROLE AO VIVO (admin) */
.live-ctl { background:var(--s2); border:1px solid var(--border); border-radius:18px; padding:14px 14px 12px; margin-bottom:22px; }
.live-ctl .section-label { margin-top:0; }
.live-row { background:var(--s1); border:1px solid var(--border); border-radius:14px; padding:12px; margin-top:10px; }
.live-row-head { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.live-row-name { font-weight:800; font-size:14px; min-width:0; overflow-wrap:anywhere; }
.live-chip { font-size:11px; font-weight:800; padding:4px 10px; border-radius:20px; border:1px solid var(--border); white-space:nowrap; color:var(--muted); }
.live-chip.live-ready { color:var(--green); border-color:rgba(61,232,154,.5); }
.live-chip.live-running { color:#000; background:var(--green); border-color:var(--green); }
.live-chip.live-paused { color:var(--gold); border-color:rgba(255,208,96,.5); }
.live-chip.live-timeup, .live-chip.live-ended { color:#fff; background:var(--red); border-color:var(--red); }
.live-clock { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:3px; line-height:1; margin:8px 0 2px; font-variant-numeric:tabular-nums; }
.live-sub { font-size:12px; color:var(--muted); }
.live-btns { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
.live-btn { flex:1; min-width:120px; padding:13px 10px; border-radius:12px; border:1px solid var(--border); background:var(--s2); color:var(--text); font-family:'Outfit',sans-serif; font-weight:800; font-size:14px; cursor:pointer; }
.live-btn.go { background:var(--green); color:#000; border-color:var(--green); }
.live-btn.stop { background:rgba(255,95,109,.15); color:var(--red); border-color:rgba(255,95,109,.5); }
.live-hint { font-size:11.5px; color:var(--muted); line-height:1.45; margin-top:12px; }

/* TELA DA EQUIPE: quadro principal */
.lv-live-card { background:var(--s1); border:1px solid var(--border); border-radius:22px; padding:16px; margin-bottom:14px; }
.lv-clock-state { text-align:center; font-size:12px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
.lv-clock-state.lv-running { color:var(--green); }
.lv-clock-state.lv-paused { color:var(--gold); }
.lv-clock-state.lv-timeup, .lv-clock-state.lv-ended { color:var(--red); }
.lv-clock { font-family:'Bebas Neue',sans-serif; font-size:clamp(64px,22vw,110px); line-height:1; text-align:center; letter-spacing:3px; font-variant-numeric:tabular-nums; margin:2px 0; }
.lv-clock-sub { text-align:center; font-size:13px; color:var(--muted); margin-bottom:14px; }
.lv-hint { font-size:12.5px; color:var(--muted); line-height:1.45; text-align:center; }
#lv-search { margin-bottom:10px; }
.lv-count { font-size:12px; font-weight:800; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin:6px 2px; }
.lv-row { display:flex; align-items:center; gap:10px; padding:10px 2px; border-bottom:1px solid var(--border); }
.lv-bib { flex:0 0 46px; text-align:center; font-family:'Bebas Neue',sans-serif; font-size:28px; color:var(--gold); line-height:1; }
.lv-who { flex:1 1 auto; min-width:0; }
.lv-name { font-weight:800; font-size:16px; overflow-wrap:anywhere; }
.lv-fin { flex:0 0 auto; padding:14px 16px; border-radius:14px; border:none; background:var(--accent); color:#000; font-family:'Outfit',sans-serif; font-weight:800; font-size:15px; cursor:pointer; }
.lv-fin.cap { background:var(--red); color:#fff; }
.lv-row.done .lv-name { color:var(--muted); font-weight:600; }
.lv-val { font-family:'Bebas Neue',sans-serif; font-size:26px; color:var(--accent); letter-spacing:1px; }
/* Strava por participante (tela Lançar resultados) */
.lv-sv { margin-top:5px; font-size:12px; font-weight:700; color:var(--accent); line-height:1.4; }
.lv-sv a { text-decoration:none; margin-left:4px; }
.lv-sv-btn { margin-top:6px; margin-left:6px; background:none; border:1px solid var(--border); color:var(--muted); border-radius:10px; padding:6px 10px; font-size:12px; font-weight:700; font-family:'Outfit',sans-serif; cursor:pointer; }
.lv-sv-btn.has { border-color:rgba(232,255,0,.45); color:var(--accent); }
.lv-sv-ov { position:fixed; inset:0; background:rgba(5,5,5,.94); z-index:9999; display:none; align-items:center; justify-content:center; padding:20px; }
.lv-sv-ov.open { display:flex; }
.lv-sv-box { background:var(--s1); border:1px solid var(--border); border-radius:20px; padding:22px 18px; max-width:380px; width:100%; max-height:90vh; overflow:auto; text-align:left; }
.lv-sv-row { display:flex; gap:10px; }
.lv-sv-row > .field-group { flex:1 1 0; min-width:0; }
.lv-undo-btn { background:none; border:1px solid var(--border); color:var(--muted); border-radius:10px; padding:8px 10px; cursor:pointer; font-size:14px; }
.lv-capall { width:100%; padding:13px; border-radius:12px; border:1px solid rgba(255,95,109,.5); background:rgba(255,95,109,.12); color:var(--red); font-family:'Outfit',sans-serif; font-weight:800; font-size:14px; margin-bottom:10px; cursor:pointer; }
.lv-more { background:var(--s1); border:1px solid var(--border); border-radius:16px; padding:0 14px 14px; margin-bottom:14px; }
.lv-more > summary { padding:14px 0 4px; cursor:pointer; font-weight:800; font-size:13px; color:var(--muted); }
.lv-snack { position:fixed; left:12px; right:12px; bottom:14px; z-index:900; background:#0e2a1d; border:1px solid var(--green); border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:10px; font-size:14px; }
.lv-snack button { background:var(--green); color:#000; border:none; border-radius:10px; padding:10px 14px; font-weight:800; font-family:'Outfit',sans-serif; cursor:pointer; }

/* Resultados públicos em aba suspensa */
.results-toggle { cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; padding:12px 0; margin-bottom:0 !important; }
.results-toggle::after { order:1; }
.results-chev { order:2; font-size:16px; color:var(--accent); transition:transform .2s; line-height:1; }
.results-toggle.open .results-chev { transform:rotate(180deg); }
.results-cap { text-align:center; font-size:12px; letter-spacing:1px; margin:2px 0 14px; }
.results-cap:empty { display:none; }
#results-body { padding-top:6px; }

/* Equipe: botão Ausente */
.lv-abs { margin-top:6px; background:none; border:1px solid var(--border); color:var(--muted); border-radius:10px; padding:6px 10px; font-size:12px; font-weight:700; font-family:'Outfit',sans-serif; cursor:pointer; }
.lv-row.absent .lv-name { color:var(--muted); font-weight:600; text-decoration:line-through; }

.mini-list { display:flex;flex-direction:column;gap:8px; }
.mini-row { display:flex;align-items:center;gap:12px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:8px 12px;cursor:pointer;transition:all .2s; }
.mini-row:hover { border-color:var(--accent); }
.mini-thumb-wrap { position:relative;width:40px;height:64px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--s2); }
.mini-thumb-wrap img { width:100%;height:100%;object-fit:cover;display:block; }
.mini-info { flex:1;min-width:0; }
.mini-title { font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.mini-desc { font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.category-badge { cursor:pointer;font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px;flex-shrink:0; }
.category-badge.open { background:rgba(232,255,0,.14);color:var(--accent);border:1px solid rgba(232,255,0,.35); }
.category-badge.mini { background:rgba(255,255,255,.06);color:var(--muted);border:1px solid var(--border); }
.video-card.locked .video-play::after { content:'🔒'; background:rgba(6,8,15,.7); }
.sub-info-box { background:linear-gradient(135deg,rgba(255,208,96,.14),rgba(255,140,0,.06));border:1px solid rgba(255,208,96,.3);border-radius:16px;padding:16px 18px;margin-bottom:20px; }
.sub-info-title { font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;color:#ffd060;margin-bottom:4px; }
.sub-info-body { font-size:12.5px;color:var(--muted);line-height:1.5; }

/* SUBSCRIBER GATE */
.gate-wrap { max-width:420px;margin:40px auto;padding:0 24px;text-align:center; }
.gate-icon { font-size:40px;margin-bottom:12px; }
.gate-title { font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:2px;margin-bottom:6px; }
.gate-sub { font-size:13px;color:var(--muted);margin-bottom:20px; }
.gate-input { text-align:center;letter-spacing:3px;font-weight:800;text-transform:uppercase; }

/* ADMIN CODE / VIDEO LIST ITEMS */
.code-chip,.vid-chip { display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border); }
.code-chip:last-child,.vid-chip:last-child { border-bottom:none; }
.code-chip-code { font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;flex:1; }
.code-chip-label { font-size:11px;color:var(--muted); }
.badge-active { background:rgba(61,232,154,.12);color:var(--green);border:1px solid rgba(61,232,154,.3);font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px; }
.badge-inactive { background:rgba(255,95,109,.12);color:var(--red);border:1px solid rgba(255,95,109,.3);font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px; }
.vid-chip-thumb { width:36px;height:56px;border-radius:6px;object-fit:cover;background:var(--s2);flex-shrink:0; }
.vid-chip-title { flex:1;font-size:13px;font-weight:700; }
@media(max-width:480px){ .video-grid{grid-template-columns:repeat(2,1fr);gap:10px} .main-tab{font-size:11px;padding:10px 4px} }

/* ADMIN TRIGGER */
.admin-trigger { position:fixed;bottom:24px;right:24px;width:44px;height:44px;background:var(--s1);border:1px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;transition:all .2s;z-index:50;opacity:.35; }
.admin-trigger:hover { opacity:1;border-color:var(--accent);transform:scale(1.1); }

/* MODAL */
.modal-overlay { position:fixed;inset:0;background:rgba(6,8,15,.88);backdrop-filter:blur(14px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .3s; }
.modal-overlay.open { opacity:1;pointer-events:all; }
.modal { background:var(--s1);border:1px solid var(--border);border-radius:24px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;transform:translateY(24px);transition:transform .3s;scrollbar-width:none; }
.modal::-webkit-scrollbar { display:none; }
.modal-overlay.open .modal { transform:translateY(0); }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:24px 28px 0; }
.modal-title { font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;color:var(--gold); }
.close-btn { width:36px;height:36px;border:1px solid var(--border);background:var(--s2);border-radius:50%;cursor:pointer;font-size:16px;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .2s; }
.close-btn:hover { color:var(--text);border-color:var(--muted); }
.modal-body { padding:20px 28px 28px; }
.pass-label { font-size:13px;color:var(--muted);margin-bottom:20px; }
.field-group { margin-bottom:14px; }
.emoji-picker-grid { margin-top:8px;max-height:220px;overflow-y:auto;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(8,1fr);gap:4px; }
.emoji-picker-grid button { background:none;border:none;font-size:20px;padding:6px;border-radius:8px;cursor:pointer;transition:background .15s;line-height:1; }
.emoji-picker-grid button:hover { background:rgba(255,255,255,0.1); }
.emoji-picker-cat-label { grid-column:1/-1;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:6px 0 2px;padding-top:4px;border-top:1px solid var(--border); }
.emoji-picker-cat-label:first-child { border-top:none;margin-top:0; }
.field-label { font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:6px;display:block; }
input[type="password"],input[type="text"],input[type="number"],select,textarea { width:100%;background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color .2s; }
input:focus,select:focus,textarea:focus { border-color:var(--accent); }

/* ── Contraste: setinha dos selects, bordas dos campos e checkboxes ── */
select {
  -webkit-appearance:none; appearance:none; cursor:pointer;
  padding-right:48px !important;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23e8ff00' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
  background-repeat:no-repeat !important;
  background-position:right 14px center !important;
  background-size:22px 22px !important;
  border-color:rgba(255,255,255,0.22);
}
select:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(232,255,0,0.12); }
option { background:#1c1c1c; color:#f4f4ef; }
input[type="password"],input[type="text"],input[type="number"],textarea { border-color:rgba(255,255,255,0.18); }
input[type="checkbox"],input[type="radio"] { accent-color:#e8ff00; }
input::placeholder,textarea::placeholder { color:var(--muted); }
textarea { resize:vertical;min-height:72px; }
.btn { width:100%;padding:13px;border:none;border-radius:10px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px; }
.btn-gold { background:linear-gradient(135deg,#ffd060,#ffb020);color:#0a0a00; }
.btn-gold:hover { filter:brightness(1.1);transform:translateY(-1px); }
.btn-blue { background:linear-gradient(135deg,var(--accent),#c4d600);color:#0a0a00; }
.btn-blue:hover { filter:brightness(1.1);transform:translateY(-1px); }
.btn-sm-danger { background:rgba(255,95,109,.12);border:1px solid rgba(255,95,109,.25);color:var(--red);padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif; }
.btn-sm { background:rgba(79,142,255,.12);border:1px solid rgba(79,142,255,.25);color:var(--accent);padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif; }
.btn-sm:hover { background:rgba(79,142,255,.22); }
.btn-sm-danger:hover { background:rgba(255,95,109,.22); }
.err { color:var(--red);font-size:12px;margin-top:8px;min-height:16px; }
.adm-tabs { display:flex;background:var(--s2);border-radius:10px;padding:3px;margin-bottom:20px;gap:3px; }
.adm-tab { flex:1;padding:8px 4px;border:none;border-radius:8px;background:transparent;color:var(--muted);font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s; }
.adm-tab.active { background:var(--accent);color:#0a0a00; }
.adm-panel { display:none; }
.adm-panel.active { display:block; }
.member-chip { display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--border); }
.member-chip:last-child { border-bottom:none; }
.chip-avatar { font-size:22px; }
.chip-info { flex:1; }
.chip-name { font-size:14px;font-weight:700; }
.chip-id { font-size:11px;color:var(--muted); }
.chip-pts { font-size:18px;font-weight:900;color:var(--accent);margin-right:8px; }
.divider { border:none;border-top:1px solid var(--border);margin:20px 0; }
.pts-tag { display:inline-block;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:700; }
.pts-pos { background:rgba(61,232,154,.12);color:var(--green); }
.pts-neg { background:rgba(255,95,109,.12);color:var(--red); }
.toast { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);background:var(--s1);border:2px solid var(--green);color:var(--text);padding:20px 28px;border-radius:18px;font-size:15px;font-weight:700;z-index:9999;opacity:0;transition:all .25s;max-width:88vw;text-align:center;line-height:1.5;pointer-events:none;box-shadow:0 12px 40px rgba(0,0,0,0.5);}
.toast.show { opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:all; }
.toast-close { position:absolute;top:6px;right:10px;background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer;padding:4px 8px; }

.registration-confirm-overlay {
  position:fixed;inset:0;z-index:10000;
  background:rgba(6,8,15,0.92);backdrop-filter:blur(10px);
  display:none;align-items:center;justify-content:center;padding:24px;
  opacity:0;transition:opacity .3s;
}
.registration-confirm-overlay.show { display:flex;opacity:1; }
.registration-confirm-card {
  background:linear-gradient(160deg,var(--s1),var(--s2));
  border:2px solid var(--green);border-radius:28px;
  padding:48px 32px;text-align:center;max-width:400px;width:100%;
  box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 0 6px rgba(61,232,154,0.08);
  transform:scale(0.85);transition:transform .35s cubic-bezier(.34,1.56,.64,1);
}
.registration-confirm-overlay.show .registration-confirm-card { transform:scale(1); }
.registration-confirm-emoji { font-size:56px;margin-bottom:16px;animation:bounceEmoji 1.2s ease-in-out infinite; }
@keyframes bounceEmoji { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.registration-confirm-title { font-size:26px;font-weight:900;color:var(--green);margin-bottom:12px;line-height:1.25; }
.registration-confirm-detail { font-size:15px;color:var(--text);line-height:1.6;margin-bottom:28px; }
.registration-confirm-btn {
  background:var(--green);color:#06170f;border:none;border-radius:14px;
  padding:14px 32px;font-size:16px;font-weight:800;cursor:pointer;
  font-family:'Outfit',sans-serif;transition:transform .15s;
}
.registration-confirm-btn:hover { transform:scale(1.05); }
@media(max-width:420px){
  .registration-confirm-card { padding:36px 22px; }
  .registration-confirm-title { font-size:22px; }
  .registration-confirm-emoji { font-size:46px; }
}
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@media(max-width:480px){
  .podium{height:200px;gap:8px}
  .podium-1 .podium-card{height:150px}
  .podium-2 .podium-card{height:115px}
  .podium-3 .podium-card{height:95px}
  .rank-bar-wrap{display:none}
  .modal-body{padding:16px 20px 24px}
  .modal-header{padding:20px 20px 0}
}
</style>
</head>
<body>

<div id="archived-results-view" style="display:none;min-height:100vh;background:var(--bg);"></div>

<!-- MODO TV: link ?tv=resultados — só os resultados do evento, otimizado para telão -->
<div id="tv-results-view">
  <div class="tv-head">
    <div class="tv-eyebrow">🏁 Resultados</div>
    <div class="tv-title" id="tv-title">Carregando...</div>
    <div id="tv-cap-wrap"></div>
  </div>
  <div class="tv-body" id="tv-body"></div>
  <div class="tv-live"><span class="live-dot"></span> ao vivo · atualiza sozinho</div>
  <button class="tv-fs" onclick="(document.documentElement.requestFullscreen||function(){}).call(document.documentElement)">⛶ Tela cheia</button>
</div>


<!-- LANÇAR RESULTADOS (equipe): link ?lancar=resultados — só o lançamento, protegido pela senha da equipe -->
<div id="lancar-view">
  <div class="lv-wrap">
    <div class="lv-head">
      <div class="lv-eyebrow">🏁 Equipe</div>
      <div class="lv-title">Lançar resultados</div>
      <div class="lv-event" id="lancar-event-name">Carregando...</div>
    </div>
    <div id="lancar-gate" class="result-panel" style="display:none">
      <label class="field-label">🔒 Senha da equipe</label>
      <input type="password" id="lancar-pw" placeholder="Senha" autocomplete="off" onkeydown="if(event.key==='Enter')lancarUnlock()">
      <button class="btn btn-gold" style="margin-top:12px" onclick="lancarUnlock()">Entrar</button>
    </div>
    <!-- Strava do participante: link + km + tempo total -->
    <div class="lv-sv-ov" id="lv-sv-ov" onclick="if(event.target===this)lancarStravaClose()">
      <div class="lv-sv-box">
        <div style="font-weight:800;font-size:18px;margin-bottom:2px">📎 Strava do participante</div>
        <div id="lv-sv-who" style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:12px"></div>
        <div class="field-group"><label class="field-label">Link do Strava (atividade ou perfil)</label>
          <input type="text" id="lv-sv-link" inputmode="url" placeholder="https://www.strava.com/activities/..." autocapitalize="off" autocorrect="off" autocomplete="off"></div>
        <div class="lv-sv-row">
          <div class="field-group"><label class="field-label">Distância (km)</label>
            <input type="text" id="lv-sv-km" inputmode="decimal" placeholder="ex: 5,2" autocomplete="off"></div>
          <div class="field-group"><label class="field-label">Tempo total</label>
            <input type="text" id="lv-sv-time" inputmode="text" placeholder="ex: 32:10 ou 1:05:30" autocomplete="off"></div>
        </div>
        <div id="lv-sv-pace" style="font-size:12px;color:var(--muted);min-height:16px;margin:-4px 0 10px"></div>
        <button class="btn btn-gold" style="width:100%" onclick="lancarStravaSave()">💾 Salvar</button>
        <button class="btn-sm-danger" id="lv-sv-del" style="display:none;width:100%;padding:10px;margin-top:8px" onclick="lancarStravaRemove()">🗑 Remover Strava deste participante</button>
        <button class="btn-sm-danger" style="width:100%;padding:10px;margin-top:8px" onclick="lancarStravaClose()">Fechar</button>
      </div>
    </div>
    <div id="lancar-main" style="display:none">
      <div class="lv-bar">
        <button class="btn-sm" onclick="lancarLoad()">🔄 Atualizar lista</button>
        <button class="btn-sm" id="lancar-logout" onclick="lancarLogout()">🔓 Sair</button>
      </div>
      <div id="lancar-none" class="result-timecap-note" style="display:none">Este evento ainda não tem tipo de resultado configurado (Tempo ou Rounds/Reps). Peça à administração para configurar.</div>
          <div class="section-label" id="result-entry-label" style="display:none">⏱️ Lançar Resultados</div>
          <div id="result-panel-wrap" style="display:none">

            <div class="field-group" id="result-subevent-selector-wrap" style="display:none">
              <label class="field-label">🎯 Lançando resultado de qual evento?</label>
              <select id="result-subevent-select" onchange="onSubEventContextChange()">
                <option value="1">Evento 1</option>
                <option value="2">Evento 2</option>
              </select>
            </div>



            <div class="lv-live-card" id="lv-live-card">
              <div class="lv-clock-state" id="lv-clock-state">—</div>
              <div class="lv-clock" id="lv-clock">00:00</div>
              <div class="lv-clock-sub" id="lv-clock-sub"></div>
              <div id="lv-finish-area">
                <input type="search" id="lv-search" placeholder="🔎 Buscar por nome ou nº…" oninput="lancarRenderList()" autocomplete="off">
                <button class="lv-capall" id="lv-capall" style="display:none" onclick="lancarMarkRemainingCap()">🚫 Marcar TIME CAP em quem não terminou</button>
                <div id="lv-runner-list"></div>
              </div>
              <div class="lv-hint" id="lv-manual-hint" style="display:none">Este evento é de Rounds/Reps e é lançado manualmente. Abra “Mais opções” logo abaixo.</div>
            </div>

            <details class="lv-more" id="lv-more">
              <summary>⚙️ Mais opções — categoria, nº de pulseira, ajustar ou excluir resultado</summary>
              <div style="margin-top:12px">
            <div class="result-panel">
              <div class="field-group" style="margin-bottom:14px">
                <label class="field-label">Selecionar inscrito</label>
                <select id="result-select" onchange="onResultSelectChange()"></select>
              </div>

              <div class="field-group" id="result-level-wrap" style="display:none;margin-bottom:14px">
                <label class="field-label">Categoria (pode ajustar no dia do evento)</label>
                <select id="result-level-select" onchange="updateResultLevel()"></select>
              </div>

              <div class="field-group" id="result-bib-wrap" style="display:none;margin-bottom:14px">
                <label class="field-label">🎽 Nº de pulseira / inscrição</label>
                <input type="number" id="result-bib-input" min="0" inputmode="numeric" placeholder="auto" onchange="updateResultBib()">
              </div>

              <div id="result-tempo-helper" style="display:none">
                <div class="result-timecap-note">TIME CAP deste evento: <strong id="result-timecap-display">—</strong></div>
                <div class="field-group">
                  <label class="field-label">Tempo restante no relógio quando terminou (MM:SS)</label>
                  <input type="text" id="result-remaining-input" class="result-final-input" placeholder="ex: 14:30" style="font-size:18px">
                </div>
                <div class="result-actions-row">
                  <button class="btn-calc" onclick="calcResultFromRemaining()">⏱️ Calcular Tempo Final</button>
                  <button class="btn-timecap" onclick="markTimeCap()">🚫 MARCAR TIME CAP (não terminou)</button>
                </div>
              </div>

              <div class="field-group" style="margin-bottom:10px">
                <label class="field-label" id="result-final-label">Resultado final (editável — corrige se estiver errado)</label>
                <input type="text" id="result-final-input" class="result-final-input">
              </div>
              <div class="field-group" style="margin-bottom:10px">
                <label class="field-label">📝 Descrição do participante (opcional)</label>
                <input type="text" id="result-note-input" maxlength="140" placeholder="ex: Rx · escalado · 3 no-reps · recorde pessoal">
              </div>
              <button class="btn btn-gold" onclick="saveSelectedResult()" style="width:100%">💾 Salvar Resultado</button>
              <button class="btn-sm-danger" id="delete-result-btn" style="width:100%;padding:10px;margin-top:8px;display:none" onclick="deleteSelectedResult()">🗑️ Excluir Resultado deste Participante</button>
              <div class="result-saved-tag" id="result-saved-tag"></div>
            </div>
              </div>
            </details>
            <div class="lv-snack" id="lv-snack" style="display:none"></div>
          </div>
    </div>
  </div>
</div>

<div class="orb orb1"></div>
<div class="orb orb2"></div>


<!-- LOGO TOP -->
<div style="text-align:center;padding:40px 24px 8px;">
  <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QDsRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAC5ADAAIAAAAUAAAApJAEAAIAAAAUAAAAuJAQAAIAAAAHAAAAzJARAAIAAAAHAAAA1JASAAIAAAAHAAAA3JKQAAIAAAAEMDAwAJKRAAIAAAAEMDAwAJKSAAIAAAAEMDAwAKABAAMAAAABAAEAAKACAAQAAAABAAAFAKADAAQAAAABAAAEHwAAAAAyMDI0OjEyOjExIDIxOjE4OjUyADIwMjQ6MTI6MTEgMjE6MTg6NTIALTAzOjAwAAAtMDM6MDAAAC0wMzowMAAA/+0AfFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAABEHAFaAAMbJUccAgAAAgACHAI/AAYyMTE4NTIcAj4ACDIwMjQxMjExHAI3AAgyMDI0MTIxMRwCPAALMjExODUyLTAzMDA4QklNBCUAAAAAABD/hDj3uLn3GHFD70+HiTz9/8IAEQgEHwUAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAICAgICAgMCAgMFAwMDBQYFBQUFBggGBgYGBggKCAgICAgICgoKCgoKCgoMDAwMDAwODg4ODg8PDw8PDw8PDw//2wBDAQIDAwQEBAcEBAcQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/2gAMAwEAAhEDEQAAAfz/ANtW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bYlD36nel/m3Z+M2+xPjv7nm229BNtq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatut9IrwrfTer5k3ufA1xW2rbattq211VLu/JXnm7/h6Btq22rbdJXN70Ka88z1lW21bbrq5HeiclVRtq27OwrzzehxXnu9C1ee70Ka883orauD21bWPY157uz4yttq27OyrzrWtVW6/rP0N+Y28m9f+G/I/Kdg65vt/uub9gS0l3/Df0fgP5d/qJ+Xf9S+PnDf6t+25a2j/UEP4F6n4jOPZ/Ef6D8v9L/FvH/oT4vo+GBfYvx19bz7bdg22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattqsv0q8i/Ruqqyb/l9X6hx+GKK/ddp+S/6r189/mN+7v5318K7attquP2c/Mn9e6bqafINfY/wt96eV1+K+IOttqJ+2X4nfuhV6o0V8rflj++H48V4ptq37T/ix+0FeqfEf3J8SV+byk6v207/8n+ir9Po/L3ra/RaCEpvPwx5RX6f0f5v1FfN1eQdfbP6Nfnj+i9c5+HX7o/hfVUURa/b/ALDm+sr4D+avqLuPndvYPkz7OY/zN6/41C/ZQP6pw/kXzf7T1OZ8p93QX8S9H8+/kX9tOB/afP8AyF/Trg/pHuXs9t/MXr/Bnxh+in57/wBo/Ps3Lr0D6zH9Kfzh/QRP4j6H5P7b9v8AP22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatsqv1t+jfMvTa8C/ID9QPy/rbat+sH5P8A6K19z/LXq/iNfl/tq22r77/QH58+g68d/MT7B/O+v3mDRdPX4icB9a/JVbbUX90Pwv8A3Qq9+LvtD8Xq/ar5c9s62vwP3tHi9b9fvyB/WCvpz4k+2/ievzb21bbVvT/MPUK/adaF1+THzZ9J/NlbbVttX3L+i/50fovVP+GH7n/hhVUURa/cvrOS62vgv4b+4Pz7r6u9w/OHfNbfqzbfkg6+Y3/bZXkvrX81ertt4Wm21aJzW2yzdnaeI/X4+rufgzyL9N4/0i+Nvk9l+j8m233fNttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21Ygy1+3/ccZ2dfG35mfpn+ZlbbVttW21bbVryj+hq/Ve9hrX5b/ACx3fCV+tP0n+fH6D18Y/mj+0/4tUnbUX90Pww/dCr78Uv2y/HCvev0W/CH9p68T/Kr97/xzrxr9Rfy6/S6vs74l+2viWvzd21bbVvUPL/UK/adaF1+TPzX9KfNdbbVttX3L+i/50fovVR+F/wC6H4X1VFEWv3L6zlOrr4H/AD7/AEE/Puttq22r6v8A0T/Kn9Uv5z9Um2/DfRwDt9LyT2P8uP05/aeB9tvxLvZflD+lf5B/0t5Idt+0efttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWKItfuJ2fE9tXxt+Zn6Z/mZW21bbVttW21b9APz/AP19r3/y/wBQ+N6/M1O1fQP68fhN+4tPPxM/bz8tq+TttRv3Q/C790K6X8jP1z/Juvmn7g+H7uv3f+WPbuvr8Ef0M+Uvoyv0P+Jftr4lr83dtW21b0/zD1Cv2nWhdfkz81/SnzXW21bbV9y/ov8AnR+i9VH4X/uh+F9VRRFr9zeq5Xqq+Cfz5/QT8+622rbavf8A9P8A4P8AvT+bfX22/E+/NXSWvyn+/i9v+9+b0G2/AvS8d/J/9gfyG/rDxW+2/TuPbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatMav249E8B9+r47/Mf9bPyTrbat9+/AX6uV23if2t8p1+V+2rof2//ACj/AF1pfjnr3w7XYT5pFeo/Tvwj9BV9AfGX2b5fX4p5SaL+534Y/uZXU/lh+qP5rV8Wbavt79HPwd/aevEfBf0Y+Xq+rviX7a+JK/N7bVttW9R8u9Sr9pVxNfkz81/SnzXW21bbV9y/ov8AnR+i9U/4Yfuf+GFVRRFr9zeq5Tq6+B/z7/QL8/a22rbavYf1g+Avvz+d/VVtvwn0dtq22rbah/m9+kvy1+u8P5xbb+ofH22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbav0K+8vw1/XCu3/AB1/aqor8Hd+zRa/LH9fbp/Rfzi+mfyhql21foJ98eC+9VyX4efqv+TlbbVvrP5M9Gr9tmkuK/ETgPrP5Mov7mfhn+5ddZ+eX6G/Adfn/tq3258R3FfvFuA9BrfE/wBsfElfm9tq22repeW+p1+00xNfkz81/SnzXW21bbV90fop+dH6L1T/AIYfuh+F9VRRFr9zOr5Tq6+I/hr9uw1+JW/baK/Erl/3d+C69b9rAf8Aif6Hbb5nXbattq24az91Om8h9er3X8T09txP9vfPbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWsK/V9EepfEur9Bx/n5q+0fIfDNRwbVttX0f1HyRq9d8i2rbasYOr6itPknV6T5ttW+jvnHV9beJebattq22r0/2X5L1fWfhXA6ttq22rWdZq+rXHyVq6bmdq22rbau894+S9X058zI1bbV9H9J8mavrPfJmr61T8mavrFt8r/THG36UKSr+DfpB+I9P+T/AO6ed+zr74R+7PhOlTdxS/KbfnVa/ObT+2vnv2vjkuu/iz6H8tfCfoj53/tz53bbtXbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbats9plu4iuIzxnW21bbVtulrmttW21bbVtcXNcduyrKoNtW21bbVs8Z1trOqzP2FbbVttW2vKo92wa4/bVttW21bbtK4veh+fUnbVttW21bOvRq8v13SVvr75G/V347f17lbX8jfwr0/Y/mPb+nPGtf10/Hb9HPhun6mor0f8re1+LVN9X/KH9wfOfoB9hfkr+sH88et8BfIn6P8A5wfs3nbbfW47bVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVvbfEvbq+qPDPoTxWvl6j6PnK22rbat+jv5xfo5X5x7attq22r0T6a+Ifeq+iPlL1D5arbattq22r9E/kP6tra+Dfourf1SeKe2+JVttW21b7x+DvuyuM4vu+br5j21bbVttXoX3D+f/wCh9fOfgHpPiNJ21bbVttX6D+HdF6DXjXzX03M16T+uX5a/qV+Bep4t+Vv1Z8p/pvFtt9hh0H7E/mv+nv4R6Xn/AHv57fSnmP0P5Mfs5+Nv2eDX9LfzS+nfsOf9CPx4/Z/8zPy3s+ddt+8+bttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW9v8AEPbK9I+Vvpv5ZpaNq22rbat+j35w/ovX50battq22re8eD+8V1/yx9T/ACxW21bbVttX3d8LfdnwdX2h6f8AnB9f15X4p7F47W21bbVvvP4M+6q+TeU+3ORr5E21bbVttWd9l9bVzXIe0fOFeD7attq22pXe/R5a9t/Mb9I/zZr3P9FflLufyDv/AD5rdv1/g22r7P8Atn55rvwb0vhvo/L9+7eb+1n5C/pJ86/kHf8AGb9hv2Lg/X7wDyH7M/DvR/JLKT+4+dttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWMHU4b7VttW21bbVnTXVttW21bbVjB1OG+1bbVttW21Omu1bbUQe1bbVttWcttVgljq22rbattq1vUarql2rbattq22ovTcpqc9bxP3n57/XHh/pn5zfh/o+I7b+gPL1hX/f3lP9BfnR+qP5Nflvd5Vtv2fzv1p674f+0f559X8kaX6y+Tf33zLP9m/xb/ZL8x7PhT5O/a78pvRTyrbfo3JttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVlJ1LRtW21O/1h/JPeBp98fCzDdQ229VNtq22rdVyur7O8K8m3lPtt6qbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttX/9oACAEBAAEFAv8A5wxIBUfCXhLb9q2ubZ9tmT9YXg6y2y2/5Yxs+y3++XWy/VdtVom78NbFJZbpae4bhs1pPfbogUS/rFtprjw32jjXKvbfqv3y9h3j6u982qJxxmSTw99X+zWFj4r+rZVslSSk/wDIp2mx7vfi2+rnxVctP1UeKC1fVT4oS5/q78VwO78Pb3Yj79rYXt8f6LeIS/6KeI2vwv4hjC0KjV9202jc78f0U8Rlnwp4jDmgmtpPuWmw7xfI/on4kd1Y3livtbeH97vIv6KeJH/RTxI/6KeI3/RXxG/6K+I3/RTxG/6KeJH/AES8Subwzv8Abx9re1ubyT+iniMu58P73Zx97bw/vV7F/RPxI7qyu7KR+GPCW4eJZ7Hadq8J7Zvn1g71eXUu+7zOySo+G92/Qm87fewbjZvxt4ists27t9Ve0IvN04NaApPj7aE7Tvz2/wAfeJ9t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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwggAAAAgAAAAggAQwAQwAwgAwAAAhcfYCBPHMOEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADRSAQgAACgAABjigBSAAQhSyggigTjxR4kNpICAjUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACigBRAAAjgSgCjjQBAAABTwAAAABSDBDYkABAAYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASCgAAABDSggwCSTyARQABTygAAChSAAAC0BSgDsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABACgAAABBSAwgBihDhxQABTygAAChQAAADoBKYCMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABSQBBhShAiyABghAAATSgAAABQAgABsAAADEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQQjxwAhgAQyjgAADhAAABSgAAAhAgQzSkAAARcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACADAADAAAAABBAADCAAACCAABBABDACYKAoCkOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAwQAAAgQAAAQgAAAAgAAAgBMYEcWkwoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQgAAQAACSgAABxSAAAAwAADgAAACADyMDVOIdEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBgAABAAAAAAAACgCAABRwAABDQAABTikAC3KNBwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAACAABAAAABCAAABDIQBZQB+iiIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCABMIAABAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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" alt="Cantil Fitness" style="width:260px;max-width:75%;">
</div>


<!-- ANIVERSÁRIO (automático, sem precisar editar nada) -->
<div style="max-width:680px;margin:0 auto 12px;padding:0 24px;display:none;" id="birthday-wrap">
  <div class="birthday-card">
    <div class="birthday-confetti">🎈</div>
    <div style="font-size:22px;font-weight:800;position:relative;z-index:1" id="birthday-text"></div>
    <div class="birthday-confetti birthday-confetti-2">🎉</div>
  </div>
</div>

<!-- DESAFIO BANNER -->
<div style="max-width:680px;margin:0 auto 0;padding:0 24px;display:none;" id="challenge-wrap">
  <div style="background:linear-gradient(135deg,rgba(255,208,96,0.15),rgba(255,140,0,0.1));border:1px solid rgba(255,208,96,0.35);border-radius:16px;padding:14px 20px;text-align:center;">
    <div style="font-size:18px;margin-bottom:4px" id="challenge-title"></div>
    <div style="font-size:13px;font-weight:700;color:#ffd060;letter-spacing:0.5px;" id="challenge-body"></div>
    <div style="font-size:11px;color:#a0a0c0;margin-top:4px;font-weight:500;" id="challenge-sub"></div>
  </div>
</div>

<div class="header" id="ranking-header">
  <div class="header-eyebrow">🏆 Tabela Oficial</div>
  <div class="header-title">RANKING</div>
  <div class="header-sub">Acompanhe sua pontuação e posição no grupo</div>
  <div class="update-time">
    <span class="live-dot"></span>
    <span id="last-update">Atualizado agora</span>
  </div>
  <div id="last-launch-banner" style="display:none;margin-top:12px;background:rgba(232,255,0,0.1);border:1px solid rgba(232,255,0,0.3);border-radius:20px;padding:8px 24px;font-size:11px;color:#e8ff00;font-weight:600;max-width:92%;text-align:center;letter-spacing:0.3px;"></div>
</div>

<div class="main-tabs">
  <button class="main-tab active" id="mt-ranking" onclick="setMainTab('ranking')"><span class="mt-icon">🏆</span>Ranking</button>
  <button class="main-tab" id="mt-desafios" onclick="setMainTab('desafios')"><span class="mt-icon">🎬</span>Desafios</button>
  <button class="main-tab" id="mt-evento" onclick="setMainTab('evento')"><span class="mt-icon">🏁</span>Evento</button>
  <button class="main-tab" id="mt-assinante" onclick="setMainTab('assinante')"><span class="mt-icon">🔒</span>Assinante</button>
</div>

<!-- VIEW: RANKING -->
<div class="view-section active" id="view-ranking">
  <div class="podium-wrap" id="podium-wrap">
    <div class="podium" id="podium"></div>
  </div>

  <div class="ranking-wrap">
    <div class="filter-tabs">
      <button class="filter-tab active" onclick="setFilter('all')">🏆 Geral</button>
      <button class="filter-tab" onclick="setFilter('F')">👩 Feminino</button>
      <button class="filter-tab" onclick="setFilter('M')">👨 Masculino</button>
      <button class="filter-tab kids-tab" onclick="setFilter('kids')">🧒 Infantil</button>
    </div>
    <div class="stars-legend">🔥 = desafio feito &nbsp;·&nbsp; ⭐ = evento feito (escolhido ao lançar o ponto)</div>
    <div class="ranking-card" id="ranking-list"></div>
  </div>
</div>

<!-- VIEW: DESAFIOS (público) -->
<div class="view-section" id="view-desafios">
  <div class="video-wrap">
    <div id="badges-wrap" style="display:none;margin-bottom:28px">
      <div class="section-label">🏅 Distintivos Cantil</div>
      <div class="bd-grid" id="badges-grid"></div>
    </div>
    <div class="section-label">🎬 Desafios em Destaque</div>
    <div class="video-grid" id="desafios-grid"></div>

    <div class="section-label" id="desafios-mini-label" style="margin-top:24px">📋 Mais Desafios</div>
    <div id="desafios-mini-list"></div>
  </div>
</div>

<!-- VIEW: EVENTO -->
<div class="view-section" id="view-evento">
  <div class="results-board" id="results-board" style="display:none">
    <div class="section-label results-toggle" id="results-toggle" role="button" tabindex="0" aria-expanded="false" onclick="toggleResultsBoard()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleResultsBoard()}">🏁 Resultados<span class="results-chev" id="results-chev">▾</span></div>
    <div id="results-body" style="display:none">
      <div class="results-cap" id="results-title"></div>
      <div id="results-groups"></div>
      <div style="text-align:center;margin-top:10px"><a class="tv-link-btn" href="?tv=resultados" target="_blank" rel="noopener">📺 Abrir resultados em modo TV</a></div>
    </div>
  </div>
  <div class="video-wrap">
    <div class="event-hero" id="event-hero">
      <img id="event-image-display" style="display:none;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:14px;margin-bottom:14px;border:1px solid rgba(232,255,0,0.25);">
      <div class="event-name" id="event-name">Carregando...</div>
      <div class="event-meta" id="event-meta"></div>
      <div class="event-desc" id="event-desc"></div>
      <div id="event-dual-info-blocks" style="display:none;margin-top:14px;display:flex;flex-direction:column;gap:10px;"></div>
      <button id="jump-to-form-btn" class="ev-cta" onclick="goToEventForm()" style="display:none">📝 QUERO ME INSCREVER<span class="ev-cta-sub">toque aqui e escolha como se inscrever</span></button>
      <div id="event-rules-wrap" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid rgba(232,255,0,0.2)">
        <div style="font-size:11px;font-weight:800;color:var(--accent);letter-spacing:.5px;margin-bottom:4px">📌 REGRAS DO EVENTO</div>
        <div id="event-rules-text" style="font-size:12px;color:var(--muted);line-height:1.6;white-space:pre-line"></div>
      </div>
      <div class="capacity-wrap" id="event-capacity-wrap">
        <div class="capacity-label"><span id="capacity-text"></span></div>
        <div class="capacity-bar"><div class="capacity-fill" id="capacity-fill" style="width:0%"></div></div>
      </div>
      <a id="whatsapp-btn" href="#" target="_blank" class="whatsapp-event-btn" style="display:none">
        <span style="font-size:18px">💬</span> Dúvidas? Fale no WhatsApp
      </a>
    </div>

    <div id="event-form-wrap">
      <div class="ev-choose-title">👇 Como você quer se inscrever?</div>
      <div class="member-toggle">
        <button id="mt-not-member" onclick="setEventPersonType(false)">🙋 Visitante</button>
        <button id="mt-is-member" onclick="setEventPersonType(true)">
          <span class="mt-member-logos">
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QDsRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAC5ADAAIAAAAUAAAApJAEAAIAAAAUAAAAuJAQAAIAAAAHAAAAzJARAAIAAAAHAAAA1JASAAIAAAAHAAAA3JKQAAIAAAAEMDAwAJKRAAIAAAAEMDAwAJKSAAIAAAAEMDAwAKABAAMAAAABAAEAAKACAAQAAAABAAAFAKADAAQAAAABAAAEHwAAAAAyMDI0OjEyOjExIDIxOjE4OjUyADIwMjQ6MTI6MTEgMjE6MTg6NTIALTAzOjAwAAAtMDM6MDAAAC0wMzowMAAA/+0AfFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAABEHAFaAAMbJUccAgAAAgACHAI/AAYyMTE4NTIcAj4ACDIwMjQxMjExHAI3AAgyMDI0MTIxMRwCPAALMjExODUyLTAzMDA4QklNBCUAAAAAABD/hDj3uLn3GHFD70+HiTz9/8IAEQgEHwUAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAICAgICAgMCAgMFAwMDBQYFBQUFBggGBgYGBggKCAgICAgICgoKCgoKCgoMDAwMDAwODg4ODg8PDw8PDw8PDw//2wBDAQIDAwQEBAcEBAcQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/2gAMAwEAAhEDEQAAAfz/ANtW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bYlD36nel/m3Z+M2+xPjv7nm229BNtq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatut9IrwrfTer5k3ufA1xW2rbattq211VLu/JXnm7/h6Btq22rbdJXN70Ka88z1lW21bbrq5HeiclVRtq27OwrzzehxXnu9C1ee70Ka883orauD21bWPY157uz4yttq27OyrzrWtVW6/rP0N+Y28m9f+G/I/Kdg65vt/uub9gS0l3/Df0fgP5d/qJ+Xf9S+PnDf6t+25a2j/UEP4F6n4jOPZ/Ef6D8v9L/FvH/oT4vo+GBfYvx19bz7bdg22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattqsv0q8i/Ruqqyb/l9X6hx+GKK/ddp+S/6r189/mN+7v5318K7attquP2c/Mn9e6bqafINfY/wt96eV1+K+IOttqJ+2X4nfuhV6o0V8rflj++H48V4ptq37T/ix+0FeqfEf3J8SV+byk6v207/8n+ir9Po/L3ra/RaCEpvPwx5RX6f0f5v1FfN1eQdfbP6Nfnj+i9c5+HX7o/hfVUURa/b/ALDm+sr4D+avqLuPndvYPkz7OY/zN6/41C/ZQP6pw/kXzf7T1OZ8p93QX8S9H8+/kX9tOB/afP8AyF/Trg/pHuXs9t/MXr/Bnxh+in57/wBo/Ps3Lr0D6zH9Kfzh/QRP4j6H5P7b9v8AP22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatsqv1t+jfMvTa8C/ID9QPy/rbat+sH5P8A6K19z/LXq/iNfl/tq22r77/QH58+g68d/MT7B/O+v3mDRdPX4icB9a/JVbbUX90Pwv8A3Qq9+LvtD8Xq/ar5c9s62vwP3tHi9b9fvyB/WCvpz4k+2/ievzb21bbVvT/MPUK/adaF1+THzZ9J/NlbbVttX3L+i/50fovVP+GH7n/hhVUURa/cvrOS62vgv4b+4Pz7r6u9w/OHfNbfqzbfkg6+Y3/bZXkvrX81ertt4Wm21aJzW2yzdnaeI/X4+rufgzyL9N4/0i+Nvk9l+j8m233fNttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21Ygy1+3/ccZ2dfG35mfpn+ZlbbVttW21bbVryj+hq/Ve9hrX5b/ACx3fCV+tP0n+fH6D18Y/mj+0/4tUnbUX90Pww/dCr78Uv2y/HCvev0W/CH9p68T/Kr97/xzrxr9Rfy6/S6vs74l+2viWvzd21bbVvUPL/UK/adaF1+TPzX9KfNdbbVttX3L+i/50fovVR+F/wC6H4X1VFEWv3L6zlOrr4H/AD7/AEE/Puttq22r6v8A0T/Kn9Uv5z9Um2/DfRwDt9LyT2P8uP05/aeB9tvxLvZflD+lf5B/0t5Idt+0efttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWKItfuJ2fE9tXxt+Zn6Z/mZW21bbVttW21b9APz/AP19r3/y/wBQ+N6/M1O1fQP68fhN+4tPPxM/bz8tq+TttRv3Q/C790K6X8jP1z/Juvmn7g+H7uv3f+WPbuvr8Ef0M+Uvoyv0P+Jftr4lr83dtW21b0/zD1Cv2nWhdfkz81/SnzXW21bbV9y/ov8AnR+i9VH4X/uh+F9VRRFr9zeq5Xqq+Cfz5/QT8+622rbavf8A9P8A4P8AvT+bfX22/E+/NXSWvyn+/i9v+9+b0G2/AvS8d/J/9gfyG/rDxW+2/TuPbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatMav249E8B9+r47/Mf9bPyTrbat9+/AX6uV23if2t8p1+V+2rof2//ACj/AF1pfjnr3w7XYT5pFeo/Tvwj9BV9AfGX2b5fX4p5SaL+534Y/uZXU/lh+qP5rV8Wbavt79HPwd/aevEfBf0Y+Xq+rviX7a+JK/N7bVttW9R8u9Sr9pVxNfkz81/SnzXW21bbV9y/ov8AnR+i9U/4Yfuf+GFVRRFr9zeq5Tq6+B/z7/QL8/a22rbavYf1g+Avvz+d/VVtvwn0dtq22rbah/m9+kvy1+u8P5xbb+ofH22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbav0K+8vw1/XCu3/AB1/aqor8Hd+zRa/LH9fbp/Rfzi+mfyhql21foJ98eC+9VyX4efqv+TlbbVvrP5M9Gr9tmkuK/ETgPrP5Mov7mfhn+5ddZ+eX6G/Adfn/tq3258R3FfvFuA9BrfE/wBsfElfm9tq22repeW+p1+00xNfkz81/SnzXW21bbV90fop+dH6L1T/AIYfuh+F9VRRFr9zOr5Tq6+I/hr9uw1+JW/baK/Erl/3d+C69b9rAf8Aif6Hbb5nXbattq24az91Om8h9er3X8T09txP9vfPbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWsK/V9EepfEur9Bx/n5q+0fIfDNRwbVttX0f1HyRq9d8i2rbasYOr6itPknV6T5ttW+jvnHV9beJebattq22r0/2X5L1fWfhXA6ttq22rWdZq+rXHyVq6bmdq22rbau894+S9X058zI1bbV9H9J8mavrPfJmr61T8mavrFt8r/THG36UKSr+DfpB+I9P+T/AO6ed+zr74R+7PhOlTdxS/KbfnVa/ObT+2vnv2vjkuu/iz6H8tfCfoj53/tz53bbtXbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbats9plu4iuIzxnW21bbVtulrmttW21bbVtcXNcduyrKoNtW21bbVs8Z1trOqzP2FbbVttW2vKo92wa4/bVttW21bbtK4veh+fUnbVttW21bOvRq8v13SVvr75G/V347f17lbX8jfwr0/Y/mPb+nPGtf10/Hb9HPhun6mor0f8re1+LVN9X/KH9wfOfoB9hfkr+sH88et8BfIn6P8A5wfs3nbbfW47bVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVvbfEvbq+qPDPoTxWvl6j6PnK22rbat+jv5xfo5X5x7attq22r0T6a+Ifeq+iPlL1D5arbattq22r9E/kP6tra+Dfourf1SeKe2+JVttW21b7x+DvuyuM4vu+br5j21bbVttXoX3D+f/wCh9fOfgHpPiNJ21bbVttX6D+HdF6DXjXzX03M16T+uX5a/qV+Bep4t+Vv1Z8p/pvFtt9hh0H7E/mv+nv4R6Xn/AHv57fSnmP0P5Mfs5+Nv2eDX9LfzS+nfsOf9CPx4/Z/8zPy3s+ddt+8+bttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW9v8AEPbK9I+Vvpv5ZpaNq22rbat+j35w/ovX50battq22re8eD+8V1/yx9T/ACxW21bbVttX3d8LfdnwdX2h6f8AnB9f15X4p7F47W21bbVvvP4M+6q+TeU+3ORr5E21bbVttWd9l9bVzXIe0fOFeD7attq22pXe/R5a9t/Mb9I/zZr3P9FflLufyDv/AD5rdv1/g22r7P8Atn55rvwb0vhvo/L9+7eb+1n5C/pJ86/kHf8AGb9hv2Lg/X7wDyH7M/DvR/JLKT+4+dttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWMHU4b7VttW21bbVnTXVttW21bbVjB1OG+1bbVttW21Omu1bbUQe1bbVttWcttVgljq22rbattq1vUarql2rbattq22ovTcpqc9bxP3n57/XHh/pn5zfh/o+I7b+gPL1hX/f3lP9BfnR+qP5Nflvd5Vtv2fzv1p674f+0f559X8kaX6y+Tf33zLP9m/xb/ZL8x7PhT5O/a78pvRTyrbfo3JttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVlJ1LRtW21O/1h/JPeBp98fCzDdQ229VNtq22rdVyur7O8K8m3lPtt6qbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttX/9oACAEBAAEFAv8A5wxIBUfCXhLb9q2ubZ9tmT9YXg6y2y2/5Yxs+y3++XWy/VdtVom78NbFJZbpae4bhs1pPfbogUS/rFtprjw32jjXKvbfqv3y9h3j6u982qJxxmSTw99X+zWFj4r+rZVslSSk/wDIp2mx7vfi2+rnxVctP1UeKC1fVT4oS5/q78VwO78Pb3Yj79rYXt8f6LeIS/6KeI2vwv4hjC0KjV9202jc78f0U8Rlnwp4jDmgmtpPuWmw7xfI/on4kd1Y3livtbeH97vIv6KeJH/RTxI/6KeI3/RXxG/6K+I3/RTxG/6KeJH/AES8Subwzv8Abx9re1ubyT+iniMu58P73Zx97bw/vV7F/RPxI7qyu7KR+GPCW4eJZ7Hadq8J7Zvn1g71eXUu+7zOySo+G92/Qm87fewbjZvxt4ists27t9Ve0IvN04NaApPj7aE7Tvz2/wAfeJ9th8I/WLd7pf8A1k+FPd1/8ija2s97ceEfqy27b4YbK1t09IfNiD50L6C5baCZPin6ttr3WLcLC52u8+5YWq7682DYLDZ9v5MQeEbMUZf1t+G7SOz+4nVXhzbrS02jlRvlIL+sjwlDue0/c8IQwjw9y0P65reJG29vDEEKdk5cb5cb5Ub5Ub5Ub5Ub5cbwQ9xijNlc6XD+pu3ilveUh7hbwSWl4Am6afa2K2hj2rlof1zW8KIvB3hSbxLe2NhbbdbfWZu93jLt1/Am3sb27P8AR7ew1288Un1eR3UXht/WbtW6S7mQQX9W+3RWfh7t9bVqoSdo5FxL2yS237YPGHhuTw7uf/IofVDsUdxPwc8yLeLxb9ZW67ndL3TcpSnc9xQ/D31ib7s8+138O52T+uLZkRS/c+raw9+8UJ0F5LyLfwP47u963x+MbD9JeHyKHuj2tn/2ncHWrljEqPHWwq2Dfe/geTmeGH9dP+0nttf1oeItrtP9nB4lf+ze8Svw99Z2/wC5b0jVL8a/WHvXh/fP9nB4lf8As4fEjvPrX8S3cBORf1Lf4077/Fb3/G2j2tk12x/XT/i31dzWCvDnFqtoVLls7eZMNhawDkRlq2qwVIlOPZcSFu+8KbHuCd0+qewlexbUNl23t9asKpNm5E1IbO6uFW/gzxLcvwXtd3tWx+Mtkg3nZ/8AkUPqwtPdvC7+si7VZeE/ufVVKqXws/rYs/ePDH3PqZ2/t46vU2HhrwNfiw8ToOSJk5x+J9vXte/d0e1s/wDtNl/d+CvGF1N4k4v6z/Dn6W2fv9W0nM8LP66f9pX3fBv/ABkyPYf1qf8AGW/d+pf/ABp3/wDil5/jbR7Wyf7S39dP7jbt23HaZdt+tfd7d7b9aew3LHj7wuXt3i/Yt0ueP80uJEj9zt2izto2rlIe5eINr2qLxH9ZS7xP/IoeEIuT4ef1wS4+HfufVh4n2Tbti/pl4Yf1g+KfD934a+59W21/o3wy/rk3BKNrtpzbXGzXaL7bX9bu2+6793R7Wz/7Tpf3e43k22eK/D26xbztU0SZo/HOwq2Hfe31VLy8Lv66P9pX3fBn/GTo9l/Wp/xlv3fqX/xp3/8Ait5/jbT7Wyf7S39dP7v7kMslvL4P39G/7T/NeK/F1v4din+tq9Wm/wDHXiG/cs8s6v8AkUE+14dFNnf1yf7Qv5rbbY3l/ttuLWy4P62dx988RP6r9xF94Zf1xbcJtn7o9rZ/9p0mqPFqOX4j+qPxHyZ+L+s/w7+ltn7fVDJl4cf1z/7Svu+DP+MnR7L+tX/jLfu/Uv8A4077/Fb3/G2n2tk/2lv66f3f3fqovpIt2+5IrFG2eLLW/wB67zLwj8Y7srdt7/5FNHtbB/tJf1yf7Qv5r6s9uF/4nHCdfLi8S336R31/UxuNC/GW3jcvD3Duj29n/wBpyuH1gxcnxZt19Ntt74e3eLetrmiTNH452E7Bvz+ptf8ArK/rn/2lfd8Gf8ZOj2X9av8Axlv3fqX/AMad9/it7/jbR7Wyf7S39dP7v7v1fyqi8To1T3k9jcb5W0eO7eXnQ9vEt2qy2dSipX/Ipo9rYP8AaS/rk/2hfzX1M7dRL8X7h+jPD517fVruBsfFA1cyBJH4msv0fv3ZHt7P/tOPD6z04+L39UfiLkXPF/Wh4d/Su0P6l5f4q/rn/wBpX3fBv/GTI9l/Wr/xlv3fqX/xp33+K3v+NtHtbJ/tMf10/u/u/Vtb+8eJk6DvL7Hj2PDxH4IvJL3w328dE/0Y/wCRUT7Xh7XZ39cn+0L+a+rjbvcPDL+uHcFW+ydtquzY7jYzc+1f1ubebfxB2R7Wz/7TX9aop4qe33su3Xvh3dot62qeJM0XjbYF+H98+pVf0z+uf/aV93wZ/wAZOj2X9av/ABlv3fqX/wAad9/it7/jbR7Wyf7S39dP7v7v1S2KVXH3OL3nwdse+Sbbt1rtdp28S2a7/ZpI1xL/AORU8Kr5mwv64k12D7n1a+D9l3bZ/wCgHhV+P/Bnh+w8PdtrtDfbjt1uLazfiXwlt/id/wCyi8OP/ZReG3/sovDTtLZFpbv64dtNxs3ZHtbN/tNf1tox8R9vqk8R+73PF/Wj4cG67P8AUwqm5v65/wDaV93wZ/xk6PZf1q/8Zb936l/8ad//AIre/wCNtHtbJ/tLf10/u/u+C9z3Sx3vj/MqFX9ZexR7duf/ACKn1b3XvPhd/Wja+8+FPufVRGY/C7+tu75Hhrt9Wm3+/eJho16J3T62xtu5f7Ot/wCzrZ+ut+CfGY8Vxvxftv6U2A6dke1sv+0x/XLDjunawvJdvvPDm7RbztM8SZ4vCXgq78PeJH9dP+0n7vgv/jJ0+y/rV/4y37v1L/407/8AxS8/xto9rZP9pb+un2Pu/VTtSZrnh/NfWpbhew/8ip9Tm8JNu90sI9ysfEXhfcvD1528PeFN08QXWy7ZFtG3P64t4TPedvqZ20cp73dix2ueZc83f6or4weIHMgSReJ7H9G780e1sv8AtMf11J+m7/VJ4j92uuPf66P9pX3fBf8AxlCfZf1q/wDGW/d+pb/GXf8A+KXn+NtHtbJ/tLf1t7TuG4x/0Z39/wBGd/f9Gd/f9Gd/LurO6spfAuz/AKJ2H+a8abd+kdh/5FTYt4udi3Lw34t2rxFaVDubC2vEL8DeG1mLwT4chVDaQW4Kkpfi3x7tfh22v7643K77fV1YJsfDL+tO+9z8L/c8J3qtv8QRLzjf1u7d7r4gaPa2Q12x/XSn6PvY3kthd+G94g3nau31zqT+i/u+Cv8AjKE8H9av/GW/d+pdVLp33+K3v+NtPtbL/tLakJU+RE+RE+TE+TE/rAsY7/xihAQj7+9b3a7Nb7Zulrutq7hCZIvEVqLPev8AkVILme1k2/6zvFO3i3+ujcktP12QOT67IiLj6593U90+sTxTugWtUiu+0/Wd4i2iz/2cPid+JPGe8eKB9xKihVp9bHie0g/2cHih+IvFG6eJ5+21fWd4k2m0/wBnD4nfiDxTu3iaX7mw+Lt68OH/AGcHid/7OHxOXvniPdfEM/3bS6msbmP63vFCEf7OHxO913W83q9+7sPiHcfDt1/s4PE7vfrV8T3tuTXvtf1n+JdrtP8AZw+J3/s4fE7/ANnD4nf+zh8Tv/ZweJ3/ALODxO/DW+bj4k8ZjsTR7t462jZr6C4iuYu0q+Wj6xN9N/f/AFY777luQ1atR9YkSYvEv/LEvqri5niLt4m3mLZ9tvbya/uvqy8UKQsa9r5JVbbkJBf2s67W42LcEbntZf1lim//APLEvqjgX+k3eb1ttg/rD8TW+8TOyuV2d3sW82m82j3HmG2v1TqvX9VO686wf1rWXKvP+RUggmuZP6N78/6N785oZbeT7ytp3JNr961sLy9P9H96L/o9vYd3tm4WKfvKglTH2trS5vZLi3ntZfvWm3X9+/6Ob85Nh3qFH37Hw/vO5pu/C2/2afvxRSzrT4N8SqTebfe7etpBUfBexp2TZb2YQW/iDeJt73Lv9V+0qs9mahUfWZ4d9yu34M3n9Cb5FImVH1m7Uu82f/kVPq9SFeK/rA8a7p4b3f8A2bHiR7hfTbne/e3RKf8AZVfe2HxLuHh1fgzxvvG8+IPH3jLdNg3jf/F26eI4/veA9isN+8GeKPCt94Zu39WH/GT/AFhaeLPvfU4EFO6fWZ4gtNyvfrI3+/tfveFtuj3bfvrB8Rz+Eodm+s/dbWXd76Pctw+99VGyWiNr3P6y/EU99vnj1G+7I/CNh+kfESBRPjvcUWOwd9rszuG4WFsi0tN38R2exzIUFp8Z7eNw2Ht9Wu9K3HZdwtk3VpuVmvb7/wD5FP6vdPFnjrwUfEG5/wCyqU91sf0ZuH3ty/5pR9/6tzTxX9bf/GSff8I3K7T6uPDvi7bvFVn4u8FXnh6X6sv+Mo+sT/jLfvfU77G7fV1cT7nefVzNZ2P3tr3CXatwuJvDP1kbZv3gLe9j/mPq38a2mxvxH9W1tux3Ladx2iZ/V5p4n4J+s7fPfL7v9WsKZfE/AfWrf8zc/APiJO9bPuyc7CVOEr+q/dU2W88U/WVt3uW//wDIp/V5/wAZZ9bcsg8R8+ZnX7+5f80o+/8AVx/xlf1tf8ZJ9/w5/wA0zBIPhDx3FcxbT4DXsvin6wv+Mt+99Tf7rfLmf9NG4nP8xFLLAvwH44v7jcPrR2O12jefv7N4l3rYV2slh9YnhWRBjX9XSMvEu+7lHtO13VzLeXHf6o7NK5b65RaW297krdd08Jb6vYN4Co7q28QW/um9O2uJbSfwzvUW+7V9bFile3f8in9Xykp8V/W2pKvEn8xuUsZ+qr7/ANXCkp8V/W0QfEn3/Dqo/wDZZdvAv1iSbWfHk0dx4o+99T0iER7j9V4u77cPqwTY7f8Ae8OXdhZbtvngLb/ES/DPgK38NXH1geJYvEm8/e8Ex+Gd82U/U7fc/cL/AGf6vPDZNT9Vvh2dCvrWXInYvufVZaCLw99aG9e6bX28B3M114b+szwuuOft9WfiA7fufi/b/wBJ7CdP+RTSpSSpa5D/ADHOlx++lSklUi5D9/myhPckn76ZZI371cM3E5/mIL68tXPuF9dD74UUkb3u4TJJJKrYNmuN83KztY7K2+spCJvDPe2tpry48O7V+hNl8d7qrdN/7eC7Ndl4e3iwRuW339jcbddO0lXBdQjO2+sLwjHtiv8Alh31VXO1Qbff+Idq2+LxT4x3DfLjv9W/hL3aJeifGtomz8SdvBn1h3VlPD4k2G4T9Z+57Lf3DhIEu1XlteWdzbRXUPi3w/NsG6f8sNrR1J+5DiJbTxT4ZRa+LPrGt4obi4mupvv7XvO47NPafW5cJR4p8U3HiWf/AOcKR//aAAgBAxEBPwH/AM8KsemkRbKNGj/vZkMe7l3xHAGkOQKeo5nwgEmgnpRXlIpBgRtpkDHg/wC9jYobpUXJiuG2L+klflPSH0LjhtjtLPppeQ4cUoz5GmYVMjSePdjEv97HjllHwX9RNhPcNw7Z7R90k9TAfhDPPKXH+9k9KeCNemyX9p06qVy2/wC9l9IOCdcOGUZ2dOpH3/72X0sfMu3qo3C/97LxRqIHZuje1yRuJH+9lDzpnzbfti4cm+KTXLvO7cxlYtlwf97JwxuYc+bZwEknkvTyInQZCxTIGPBelnY2uaNSP+9k9KPJc090706WPmTjzXlIL1QqduKW2YL1cfEv97JxnbiMtcctmK9M33QEtN2/FX5f72REWaLmyREdsdIR3Gg547QIjTFkgYbJJFcPSn7qLnxbTY/3srHkMTYZTMuZdpnI8E/+eDX/2gAIAQIRAT8B/wDPCr1n77/HdL1EunkCa/J6LrMXV4I58J4P+9mfK/M4uiAxjnJLxFPxPyWbJHLn6uv6RHCb9H5OGWHV5BmFSvl/cuOWPxOOOWNeaeq6iPT4ZZ5+I8sf9xGznP8AdiGz/YuLJHJATj4Lk6b5bBnn1UM2+P8AiV6f0ek6nH1OKObGeD/vY3zvX5Oh6GfUYo2Q/B/O4+m+Ql1/Xgzl/vl/4GL0W3+FK3B/uI3SSP8ANxEPznyEev67J1cRQL8T+/nRxwww9RAxoU/vT890nUfDz/SZb3UNP3Yz+98Vgl/T/aJlQsvx/wAzHofnM3Qk/wAqZ4/oT/vY/V/u/wDG9Xzmwi2X7i/EHxEj/O/K/HZPj+qn0uT07fh4/JdXkHR9HM/67j/cX5LqJX1vUf7UvxX7o/H/AB5EwN0/zP8AvZP+4j4AM+HKPUaQFyov79/CYelOPqumjUTwf8On+4edDGHST6s+ZGv97L/3EbqBLqsWEf2R/tdI8F/eP95Pj+u+I9nHL+Zxxp+4mWMviRCPoT/vZf8AuIvWY5ZcfSgfcOSe39weuni+Q/Tf2Z/72X891x63r8uc/n2f3R1f6T9bs/l/m/C9b+k67F1H5H/eyuqnswTkPQJ5L+5n7sYuqxnrOsjcfQf75f3m+Dl8V1e2P4D4elw+7nhjJqy/3fg/R/oq+yqev6SfR9TPp5+Yl6Ke/p8cvzA/3sn96PkI9F8bkl6ngf5390v3Xh8mJZ+p/AHpemx9PijgxCoh/fLpOmy/GzydR/Z8f4Xo8/sdRDMRdF6XqsfU4Y58R4L/ALiD8YcfUx62PiXn/C/uz1Q6j4vBIegr/W/3sn/cR8pJwYv8L+7Pxx6H43Hil+LydP8AcRuskIYukHryX5b92tnwOHNjj98eT/nf3AznJ8YYS/sl/eHof1vx2XCBzXD/ALh11tjL0kv8I/3sn5jFh6794em6Ym9gs6/MdJ/ef7yw6b+zAC/9qyhGUdshw/uxLF8f8l1Xxl+tjSfRj4n948eWP8PL/vZHXZ5YOnnlhDcR6P7r/CfIZPkT8l1Q2/4fW9PkOvxdD08upzHgP7ldZ+u6rqusyfjNf62nzvwvyeD5b+8eljvs3x6f0emyyy4ozlGifR/fzHlPQ454RzGV/wCDh/dP94P7y6fZlP8AMj5/r/X/AHsr5b4fB8niGHqPA5fj/jun6DCMPTRodhALg+M6TBkOXDiAkfyH/ng1/9oACAEBAAY/Av8A5wxISOLhMsKV3C05LKhXV4yW8ev8kP8ASu3J5YyotHz/AOWMi0sEZHzPkGmTdFm5l/BDVb+7RoRTyDuLIHLlLKau2t7ZOUilpYHp2uRCnKmJ7iOMZKVwDE9wtFrX8qtSzOmlxGnjh2TGPzGjpeIF1PKOpSuA/ss3mx1Unzi/uMpUKEf8iplZ2q5B6gOotcP7RfCP/CegjP8AlP8AxTL+yXndWUkaR54/zFLSFUxH7Iq9Nvl/B/7T5fweS9vlA/ssokFCPL72VlbLmA80h/7T5fweu3S/gzFOgxrHkr7vMs7OSVHqA/8AadN/gvl3kKoVeihTuJ7WzkkjPmA/9p8v+C/9p8v+C/8AafL+D/2ny/g/9p8v4P8A2ny/g/8AafL/AIL/ANp03+CzNPYSoQPPHvybWMyrPkl/7T5f8F826spY0DzKfuCe1s5JEHzAf+06b8HyruJUK/RQp2pF9Hbj25DwDMdv0JGq1nifm5E7fObe3B6ceL+mvplf5ZdVGpLt9xIyTGdfkXFeWxyjmTkO0sEprJMlSUDvNuEoqm1Gn9o9qK1q5BEMYpxzE9hBBdZITwzGTTtu94fTewtIx6n+nbJP0a/3oH8P/IpItbdOUkhoA0XW6J59z+oPGKMJfo9SH7QemrxkQC1z2SPd7niCHJY3acZYjQ/dhtI+MqglxW8MQ0D9kPgHQpDRvNrHitKqLp6fdAdvFDGE0QHwD1Aa721i/jNv1aef3bEoSBWJP8D4OzlSmiuZ3tAlI/dpfAPgHwD9kPgHwD4B8HMCkeyXKP5R7XkkialID4ByJkQCMXME8AtXYO3ShAHQHwdlKhNFlRfXVNpF+8V/U0WtpGI40DQBo2e1Sfp9Tj+y85reRCfUpLpbQrl/sir/AMSl/wAF8qSMpX6UdtHcpKKZaK/tdo7iOFckAj4p1Doe0U6NV3PWo97S6+ae6ZIzRSTUO3XMOYm4iGYaok/4vJrGf6v+RRm3eYfu+lHZU0holIclvtUhtrRPTVPFTrJdyk/2y6oupR/llo58xubeuqVcXFewGqZU5drfd4tM+hX3YCRVMPU6Ncp0xDudvvMcf732vLYCqlINHifuB2/9gdtGY1cCHLEBSGbrR9ywP+wk9rP/AHd/yD3RZRiKREYoMkv93B/gl+xD/gl21lciPlzKxNAx2Xt9mmPlpSk9Qf7uD/BL/dQf4JaoKRRhX7KXU+fa+/ye0n9lz/21fw9g7f8AsDtY/wBsuBNnTJP7z+325ikAkPCVAIeMMaUj4B8HzlQIKx54ug7UWKsi4tEV9aav/WyY25/l9QcG35Z8lAFe6FpT+6kBdeWqnyeMMKln4B5IsVgfHRwWt5pImujliXQLQMkH0I/5FG3NNV9X49rxaDQrGP8Ahafdhr+QqHaSX/SSFfdu9yI/kjtfS1oeWQPmXZzK4KVj+LBDUn1DvbNQpjIafI6/cDt/7AZ+Tvtm3KXP6RfK+w8OxvIRWe16vuWnwT2s/wDd3/IP3tv/AN2BjtL/ALrR969/ye0n9lz/ANtX8PYO3/sDtY/2i+ft8yoVfB430KLgfDpLpe52p+Iy/gf+OpfutrdJMh4D1/m8VgGrpgHVCAHVWgfMuZ0oa7ba00SrTNX/ACKNmgeUY7BH7Uifu+5X10iCVKyaLNH/ALUof8N3VpbXsc00nAJNfu29eMoz/wALtBYA9Uq6/wCC4rhPGNQV+Dt7mPULQD2jvBwuUf8ABfuB2/8AYDV8ncXkBouG4Ur9bgvoz+8SzGvUFzQgUhl60d4fgT2s/wDdv3tv/wB2BjtL/utH3r3/ACe0n9lz/wBtX8PYfN2/9gdrL+0fupmiOK0GoLjuP76npkH8r+bBIzkVwS6QWoSfiXiZ+Un+Ro85llZ/lGv/ACKIdqPSNPaL/dg/m7e1H99WEuKBP5UjsLZHC3R+s9oUHjB0dor8e1Av+H7gdv8A2AyHfp/2IWvY5z0q6o+xu4RWe16u+PotXaz/AN2/e2//AHYGO0v+60fevf8AJ7Sf2XP/AG1fw9h83b/2B2sv7R+9NY1oiVGX+D90q9Hc7KU8uW3/AN6+4VOZf97iOCfs/wCRUDtv7A7R/wC7B/Nw5iqYRk6NSz5B3t55SSGn2drvbT/bHa8tqVJjNPm6dw7f+wO18n1IP6nDfQGi4VZBwXsR9tLVGvUEOaAD6KXrR8j2mR/sQ9rP/dv3tv8A92BjtL/utH3r3/J7Sf2XP/bV/D2Dt/7A7WX9o/etsfOoY+4XNfeSJ/1FolH5h3urpH97jUWVK4n/AJFQO2/sDtF/uwfzd1uSx7RxHa8uhxSguvaBP/FjodWpJ8w721pQJkNPt7h2/wDYHa5/sp7L2Oc9MnUjt75Cms1t1druH0X2s/8Adv3tv/3YGO0v+60fevf8ntJ/Zc/9tX8PYO3/ALA7WX9o/ej/ANhoUp0+4XOf2gC7KaTU4Y/4One/p/pf/Iqh2p9Y09ov92D+btgoUUsZfj2js0/8CV/wd7a8T/elhTjl9U9kXgFE3CP+C9w7f+wOy/jGntDew+3CrIOC+jPtpaol6ghy29KRS9cfyd8j+z2s/wDdv3tv/wB2BjtL/utH3r3/ACe0n9lz/wBtX8PYO3/sDtZf2j9673A8UUQPvCa+h+k/aQcS47GzTjFEKAd7uzi1MsakhmOQUUnQ/wDIq2Sx5xp7IV/sRP3f0huEImkUojqf+0+P8HcX9nbJhli4Y97ezH99WEuKAaYp7Ri+r9Fw1f5/8J/n/wAJ8F/4TRbR+zGKDtFfo/4DL/4N3Dt/7A7JPrH3Xsc6umTqj7G+hH09p1fY7xPqgdrP/dv3tv8A92BjtL/utH3r3/J7Sf2XP/bV/D2Dt/7A7WX9o/et4NuV/jCwlSfIh6fzNGm+txRFzx/tf8iraE/lTj+Ha5PnHir8D92M/tKV2VD/AKcsDvErygGbo6ueyTZmQQKKa5ej/wBp5/wn/tPP+E9NvP8AhOZRi5Kojw7Xlr6oLp2Dt/7A7Wcv7aFd4ryA0XErIOC9jPtpaol6gh3t5VPukv7vtZ/7u/5B+9t/+7Ax2l/3Wj717/k9pP7Ln/tq/h7B2/8AYHay/tH71xui9eV0J/m+d5xyJ/5FWfaZDqg5D7e0tnMKpkSQ5IbiI8oHpX5Ed0RW8REROsh4OGwh4Rpp2t9ojNeT1q73W5KHniO1zdqNOWgqa51+0tRUft+4u2JomaP+DsqNXBQd7aDQJkNPkewdv/YHbb1f2/uL2S4PTL1I+5Z/7t+9t/8AuwMdpf8AdaPvX3+T2k/suf8Atq/h7B2/9gdrRVlCqbEmuL/xGX8H/iMv4P8AxGX8H/iMv4Pk3URiX6KdulaaSyDNf+V/N3UI44ZD/J/5FWLcbbig6j1DTLbSgSU6kfmHYx3EYWD6vJVlH/gvNFlGKfyXjCgJAdS1ojkE14fZjH9blvrpWUsxyPe001WMj9vaZAPVMQj7tlcA0+kCT/lNKh5jtHdJFE3Ef/BewduR+wO1gr4q+5FeQGi4jkHBeRH2k97NHnzfvbd/uwMdpf8AdaPvXo/s9pP7Ln/tq/h7B239gduoP2Q/ZD9gPRIe0WONOcqhYQPL+YM9yqiQ03dovmIV59ilYrV3lukUCZDT/kVRLbSGNY80mjw5ybhP+xA/4zZIV/ZL6ttV/hv6Pblfat0trSNH9o5MpkuuSk+UfSytZqT5n7iLGHlSRx8Mkv2IP8EuNG4FIRHwSgUH3QpOhDTbjkrCfNSX7EH+CWifcin6PRISKDuiyiMcqEcM01L9iD/BLTJuSwcOASKD7pG3S0QfyK1S/Yg/wS/Yg/wSxPucuePADgPvR3dsrGWI5JLCCIFf5JfsQf4Jcm4XyspZPvG725QCiKEHUF+xB/glqtjyogviUp1dT3RZxqjlRGKDNNS/Yg/wS/Zg/wAEv2IP8Ev2IP8ABL9iD/BL9mD/AAS7S+vyFKhqQB3qWi0uiTmfy/l+JaZ4FBSFCoPcrPk/cI1Vji4/NnbJl0iuPZ/tOvabH8yUn/lia/hCrvLcyH2R+tyXc5quQ1f6Cu16f3r/AJJdeywnSodwJvb5iquO5iNFxqCg7e8R/fEg9q+qB/yxO6u6dKY8Px7fxudEX9o0cdnYyZxR6qI8z2iu4jRUSgpie2kSsgDKh4dpOT7dNHOq5/elZy+faXbVq1gNR/ZV2trscF1T/wAiqIYEFaz5B/4hN/gvWwm/wWYZklC08Qfv++qtliD9umn3yLSFUpHHEP8AxKX/AAX/AIlL/gsKvLdcIVwyFPvplUkhCuB78m1jMq/RLMFwgxyJ4g/fPucCpqfsir/xCX/BapZLOVKU8SU/zHMsrVciPWmjMk9lIEjz4/zAihSVrPAB5ixXR8u+hVCr+UOwSnzcMJH0q+tf9otcqjSgcl3IemvSPRP3PfJBRV0qv+SO1GN3t0/RzaL/ALXaG4UfopOhfyLEiDUF+9R/8Bjl/wAirZpV8f4HFY7aiLAxhRzRV+xbf7jct9cUEkxyOOg++ggf3hH35JLAIrLxzTk4rK8TEY1hXsoo0WdgiIIwy6kVccd+I6RGowTj9/3S9RXqVQsxTjKE+wvsj+wp3oH8n/gv37/MVoQ7q2hRBy4pVpH0f7JclnMIMJRiaI+/aWM37ta+r5B2m1bIhMKpE1yx4AMjeQL2BQ9AFOa9hhFumU1wH35t9nQFyEkD4BLkXZyCCGvSjFixu7FPvR4y/wBztZWyuGeR/wAnV0dySdVpxHzV9yCyT/fVhLitohRMaQkOAXnCZWA+1hSdau7h9EFQ/wAnuLaZVZLU4f5LkgWK5Jo57NfGJRT/AMipZ/b/AANF6LtMPRjQv/ajG57HPmclWNR5/fT/ALpR/MW3yU0f7qT/ADF5NEcVhEtC/wBA+JgOfwSv9tmeIGWyVwX6fNxf2FO9/wAn/go+/f8A2OeZF0mkqyr/AAi5bxV6hQiSVU+/BuEPtQqycaOdyryMaftJLMhR7xAPzo/mJNq3Xptpjor9lq3bw1OkiXqw/Kfk+RuEKoVfHtAfQF1adrhNUQaq/tfciUsVEaFK7QWaTpEnL7S0RSH+MW3Sv+65kjzSWtPoeyrKQ0TdJ0/tB/N85PC4Tl/yKln9v8DjAUdIUv8AeK/F1P30f7oR/MW3yU0f7qH8xe/2ZXVOj/QPiX6SGTpTIr/kJo3PbznYrSr/ACXe/wCT/wAF+/uH2O++kV+/k8/5ToZFfj/MCSFRQseY0cWx7ufeYrjpST7QcclonBNynIj4/wAxnttwUD9nik/Y1z3cOE0dUn4KHo1Rnik0cXwSpz3q/wC9pclzMarlOR+5e3quKcUhyTyGiUCpdxfn++K0+Tju/wC9K6ZP7LC09SFh3tv+xKrtHcwmi4zUOG+j4kdQ9FOG9A6ol/8ABv8AkVLNSuGv8DQU/wCkp/mUIB15KP5i2KuFFNBH+lD+YvQTQ4y90bXvCsrX8i/2HdzQmqVY0/wR9+/CzStHPdJ3AUmWVcP2nPencArkpKqY/fhn3KIS24PVXy+L/S3h25QkSipT+VjfN7u0fxfUegfMtf8AF4Bgj4/H78uxXiUw3i/zfmV8Q6Ivkcr9qjXtNpMJbyQHTzKlfmeRa97uU4pUMYv7rQlOiVSDL7vvXnPIr9TG3x6Luj/vPe152uKaNW/2o+jX+9H9ff8ARcyvobrh/bd1bpFVYdPzDp/yKeSTR1kJV8/5nDM4+lf5jJJo6yKy+f8AMYBRx9K/c1+/9Gop+T/er/F0Mivx/mP4tOuL+yoh43NxJKP5Sif5jJJoXiL6YD/dinzJFFSj5nVxWMCSqp6j6JcdrCKIjGIdxXijFX6/uR2tunKSQ0AdvYcTGnq/tOYD2Lf6NP2d7KOT2jGD+Lns168xJDktLpJRJGadopozRSVghoy1qkP9KbegiJZ+kHp/yw+dK5UIulL1y/ZZknuoxT4uaBK6WmXSB5j7id9vU/Sy/ux6J7XkadQVZf4XeLbt5kBswMQunUl5RX8Kv8t26dvUmaeOua08KenZCj5EOKS2kEgxHBrgmSFIUNQ1wqH0EhJjPw/5Ydo9fuIK/ZqKuOm426aJ9nmJfu2ySCWVX5x7KWqe4UVyL4k/zAudvmVGofg8byzzV6pU0Lkj5SI/ZH/zhSf/xAAzEAEAAwACAgICAgMBAQAAAgsBEQAhMUFRYXGBkaGxwfDREOHxIDBAUGBwgJCgsMDQ4P/aAAgBAQABPyH/AP0MSbMrAoD5DHKrEjysNjQ//czj9efiHytEu+hqw2GZkUYjkDsKl1kHwy0fEP8AiUnNDwP/AFP7wAlVvXSYNRVNlUiNZ+EgvGsUQGcQaDWHK3Np2xI8j/8Asoa+DzYOC+C9A/Kv6tFf9qld8qEo/wDyH/PiSj/iP6kkpIL4UQn/AOJnyaSlOBeOtPnLCSJ/+GTzcPj/AJw269r/AK4UO53/APJtYc5jsTZAKv8AojwYBWnCuecxkQf/AIOGD+d/5n2PgL/kJVeKhJhX82Ku3MAEiur9B12zQrq05v8Aj6IbAfxfT/z2MhF/7FWMtCFfAAXGnR/wRmIDQhnh9YN7NkC4f/2SsCIBQe+yxEueALA9U/8AAgHpUsDvSDT5D4Fqi2A/s/8Aw8B3Ptpzscsat/8AAU/86nqB8UXJjDlf/hHsEpKboX/41f6SofiYR0//AIZcBfzXp0IMv+P+/wDj4f8A1m/+Nf8A5l/+Nf8A43/G9atwHi9UgnB/P/wvAsp/41RR1IlHqCA9D/wCHsoaA6L6NLyDs9K4/wBOw4FBpV1GZVF9NrQrr5Y0il/Pvvm1DXZ+AIxTw3gOmoGvhROR/wCPqIf+RvsL/wB3aHIdJTYTo8ptFBXf/wBkWl7zoAKNBpV8FduCKbz3Nd2Q+qg0Wc2HpokBg/NSlNJP/wCGXSA6IaBJrZrBhyx8D/2VsdghGH/8H7Zf8z4q0HkpWSobOeD8P/4P8S8//DyZQxZr/gP81/yz+bzXlGtRWtXSBlv+A/3T/Df5sIuoqV13Ur/z9D/n9l/1b9sq/wCI/wAh4rfnhdlZQYFQKC1R4PQS+vlkV62g+ACC0Cf8AUArBq5BL+r3K5nMgPC/9WgyX3RYfYlfTN1aIIPcagz1gzFmXP8A/sjQKcBf+DjRfzH/AOEYNf8Aih2P/wCFnjkUb/itnU7uR2z4kl9+hdwyfgv/AMH7Zf8AM+L+yqbx+BSYocdh/wDmrOe/Ur/+Pn6//P7L/s37Z/2n+a8U32zLH5LA+WaM8+OPzXGXO97nbH/8SKH/AENC9EmqHD8QVT6OBUOFGZvoWtFEr/8AZED/AOEf/H//AAzcg0Qv/wCCoMtA9f8A4UCOd+f+OSCR6rio19pqFQxXi/8As4//AIH7Zf8AE+L+8rLjijPIC0jAaJUaofh/7DvB/wCfsv4//Gb9Cv8A+Pn6/wDz+2/7N+q//IoxQZQORLLcDPAH/wCWi5sHWvn6pzLujSby2i//AGR/YKf+cD/80f8AtaZpeQEqwocI4/8AFTud/wDBgw/j/wDB/bL/AJnxT8NXft3b/wA1GF6ty+P/AMM/+5/j/wDGb9Cv/wCPn6v/AD+y/wCrfqv/AMmjOk83uj/8HqhX+8ZXLP8AvxZZ0sgf/wBlH7Z/+cc6ZIFkDQ8UZsDM/VsH/B9M/wCSamn4iotXJ/39kv8AifF07/8AcGqDElCrIS0iBYSwRmf+KD4n/P8Ac/x/+M36Ff8A8fP1/wDn9l/1b9s//JYxCXGy/wDwgHTtvuwcAJPh/wC8xhNXKXVfb/8Asp+2f/nHH0oj/wDG6E1Slcv/ADrVL864FF1IhWWnMetH/f2S/wCJ8XmvzB/+L/Mc0xZPUxHj/nwI/j/n7n+P/wAfv0K//j5+v/z+y/6t+2f9Z/jvH/4pH1SEP/4H63/DOXthJ/6H97/+yv7BX/hCP/zRpvx/n/lYeEfj/tOIfxzfQ014v8qU/wDr9sv+Z8V4s4/4Wzgn0UTyEvpoASw0jTT8m/lr/n7n+P8A8Zv0K/8A47fq/wDP7L/q37Z/0n+O8f8A4uNW+3T/APAkKiZBBQM+nEy/9PysGeNQek//AGUOaLj/AMf/ABvBf/hnX/HiDH3gv/ovZfrloMQI/wCKlY1ijm+r8tPF+Wgo/v2ZSPN4P+FJwT8f9ftl/wAz4rx/+A5b+UopiyKwfnY/8N/uf4//AB2/Qr/+O36v/P7b/q37Z/0n+O8f/i5wJRNQn/5IJa6hv+B/+ys+P+RExP8A+FRznI/55d/6cscijApSU25L3NRrD/wowNnH/ku0efJQtXJ/z9sv+B8f8L/PT/1ZhyHqnmQFoACwlHaHg5//ACUe/Ur/APjt+r/z+y/7N+2f9Z/jPH/4tLBPkaEP/wAouD+4/wD2V4jtfX/ISFk+SsQsjJ/7Ak8iISmpBv8AiFsL8r/3kAT/AMIoD8cVFZcPan/8H870v+efADSGS/8AMP8An7Zf8D4/5D5P/wCD/fDNGFg/5+2/j/8AHb9Sv/47fpf8/sv+zftn/WZQjP8A8AlCHEsQeNCGj+dKv/yxcQr5Nf8A7Krj/vEWGLE7C0Y5vNA4M1H+DUQm9FL+DhFJkAoSMj+bUzaV/wCixD75/wAHCIz/APDCefQYpOuBrS/kcP8Aj9sovM/p/wCfEf8A8FF+f6LI3Cn0/wDdi5P4/wDxq/Sr/wDjkHpv+f2X/Vv2Ss/4XCjf/hX/AONf/kWD+hQqP5DeLAgfX/5Ahua0r/DH/IRAMllaIHp3/wDZXiyaxUsiepb+9lLD0/W4TfDTfthXYkR0mPcpK/8A4IaBict/y/8AurW+d0//AApFLEfCUDBQE3/I/wC7i3GDE/8ATASDSj/i/wDNMVdcv/wlDXKNj/E/5qL/AAvzZkjjo/8AxUcyfAS+xCP+6v8Am383ur9CADo//FDhEsCn+J/zXcJhMpG6Lq/9LAKUp/iX93/Gv7p/iX83/F/7v+Zf3X/Gv5p1iMwF4n/DLRZ2AvTQkCiaI/8AR4gKMlGfe0X9FXAoS1y4/wD7k5+TWnB/zxXs89StjbV94xtOB/wmEkvAIH5TZZBD2NbOS5x//cosdN5L2/8An6lWhPT+C/5w6EH4bFfQArf+DzT+1/uZk/4/B3f+CcKP/wBlbhBKUrf/ALmp/wBjUFPAoR//ABh3WGay/wD4+D8qSKKg/NqqH8+4riSS/wDxyJRxxj/p3n6KW8OsXCf/AI/aeyQv/wBnTJuqAB/+R6i9hXLyAH9P/wAhTIwCVsDf4X1++D/g8SoA9tg/CVDwFlfipI2PEf8A4E64n/wF6GAm+H/jHJK4mBiJ2NQ8wf8A7Kw4ktzSpxq5/l/dOaIo09H/AOOGj/8AGvYgHhKu6RKIe4K097/8cMvCXyozWAPfZ/yN4nln8X/44yaOroH0qdslY2H/APHwjpPnSu7w4KHUqyMalEpWQ/8AyP8AqoOxmCGArBPqA9/8B1b+CkdUXl//AODpbJ+oebBAY+gvBhW8NNhAZe33yjX/AFBVwJSWY+ykfDz/APZRqbI8QXtLF/qL/wDQB3yn/wDIJfUJKBkxP4pUw/6v/EP2/wD8iaE/8TpGMGD/APHxp8HnyV+6UKFiP/5FABQyXWmz9gfJG/Geej8P/FWYwel/mdW//CFCCKrzMtRRxBfxbdQX5Knmc/D/AMxMNQx8Sl0T+x/+yvj/AIq/+oqWpL5f/wA+In/8rJmNtIZE5Lksn9BQP3R5bf3f4v8A8if2XPlQVgeRX/5CtVkVRZNA7Mol3w+P/wCQR7Nb9qyuG9Fc3zEBfVS9cLbvy2Z5qe3/APAFOF40F29BWZYdL0OKOnUL2rYAaPkbCnAT4X/kBK39lRwzeI5LmRAvr/8AZQyMVLrJ/wDkhwY//kaJRU+P/wCRhI/9Z8HEvNlNn0f/AIwoMljmwPrL/wDIkilH6QBJQETQdpuhCfF/JZn7f/jT0sJQeCivldcTZ7lyCrskqy1h/wDvyltR/wD+E/VqzXAfh/1ZahL6LPigP+vClfrWrOmoLlif/smDU/Iw2eU8pf8A8lSf5ZH/AOQDU/Iw2ax+Uv8A+QNDLkKP/wAD8tet/wDxzX2pL/8AU09XHkX/APkf5Hz4vqzRv7//ACCyA4RhL6NLRBy8VT9tL2Glx3LTgBh6KM8sv/wWAFm7WmS/tTWzkDofv/3nIiUbEPzpU6oQn/EELT2N89I/ZZx5waN//cfKGMUC18WBboDwKEfP/wCA82P76wT4qGwX4p/7KHqKYsb4F0ak4/8ABwIqfzeWj9j1WQKEJEbn5DcP/wC46JSorzy//gXCBvhNACghAlZezaFTas8hf/yEsvwOvSWFOiFhL7Xf/wDQpP8A/9oADAMBAAIRAxEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwggAAAAgAAAAggAQwAQwAwgAwAAAhcfYCBPHMOEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADRSAQgAACgAABjigBSAAQhSyggigTjxR4kNpICAjUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACigBRAAAjgSgCjjQBAAABTwAAAABSDBDYkABAAYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASCgAAABDSggwCSTyARQABTygAAChSAAAC0BSgDsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABACgAAABBSAwgBihDhxQABTygAAChQAAADoBKYCMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABSQBBhShAiyABghAAATSgAAABQAgABsAAADEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQQjxwAhgAQyjgAADhAAABSgAAAhAgQzSkAAARcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACADAADAAAAABBAADCAAACCAABBABDACYKAoCkOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAwQAAAgQAAAQgAAAAgAAAgBMYEcWkwoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQgAAQAACSgAABxSAAAAwAADgAAACADyMDVOIdEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBgAABAAAAAAAACgCAABRwAABDQAABTikAC3KNBwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAACAABAAAABCAAABDIQBZQB+iiIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCABMIAABAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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" alt="Cantil Fitness">
            <img src="data:image/jpeg;base64,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" alt="Assinante Cantil Fitness">
          </span>
          Membro / Aluno do CT Cantil
        </button>
      </div>

      <div id="event-fields-wrap">
      <div class="field-group" id="ev-internal-checks-wrap" style="display:none">
        <label class="field-label">Marque uma ou as duas opções</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:10px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="ev-is-clube" onchange="toggleInternalFields()" style="width:18px;height:18px;flex-shrink:0">
            <span>🏆 Membro do Clube</span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="ev-is-ct" onchange="toggleInternalFields()" style="width:18px;height:18px;flex-shrink:0">
            <span>🏋️ Aluno do CT</span>
          </label>
        </div>
      </div>

      <div class="field-group" id="ev-member-select-wrap" style="display:none">
        <label class="field-label">Selecione seu nome</label>
        <select id="ev-member-select"></select>
      </div>
      <div class="field-group" id="ev-name-wrap">
        <label class="field-label">Nome</label>
        <input type="text" id="ev-name" placeholder="Seu nome completo">
      </div>
      <div class="field-group" id="ev-age-wrap">
        <label class="field-label">Idade</label>
        <input type="number" id="ev-age" placeholder="ex: 28">
      </div>
      <div class="field-group" id="ev-level-wrap">
        <label class="field-label">Categoria</label>
        <select id="ev-level"></select>
      </div>
      <div class="field-group" id="ev-phone-wrap">
        <label class="field-label">Telefone (WhatsApp)</label>
        <input type="tel" id="ev-phone" placeholder="(21) 90000-0000">
      </div>
      <div class="field-group" id="ev-source-wrap">
        <label class="field-label">Como ficou sabendo do nosso evento?</label>
        <select id="ev-source" onchange="toggleReferralField()">
          <option value="Instagram">📷 Instagram</option>
          <option value="WhatsApp">💬 WhatsApp</option>
          <option value="Indicação de amigo(a)">🗣️ Indicação de amigo(a)</option>
          <option value="Já sou aluno(a)">🏋️ Já sou aluno(a) da Cantil</option>
          <option value="Outro">✨ Outro</option>
        </select>
      </div>
      <div class="field-group" id="ev-referral-wrap" style="display:none">
        <label class="field-label">Nome de quem indicou</label>
        <input type="text" id="ev-referral" placeholder="Nome do amigo(a) que indicou">
      </div>
      <div class="field-group" id="ev-dual-select-wrap" style="display:none">
        <label class="field-label">🎯 Em qual(is) você quer se inscrever?</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <label id="ev-sub1-wrap" style="display:flex;align-items:center;gap:10px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="ev-sub1-check" style="width:18px;height:18px;flex-shrink:0">
            <span style="flex:1">
              <span id="ev-sub1-label">Evento 1</span>
              <span id="ev-sub1-capacity" style="display:block;font-size:11px;color:var(--muted);margin-top:2px"></span>
            </span>
          </label>
          <label id="ev-sub2-wrap" style="display:flex;align-items:center;gap:10px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="ev-sub2-check" style="width:18px;height:18px;flex-shrink:0">
            <span style="flex:1">
              <span id="ev-sub2-label">Evento 2</span>
              <span id="ev-sub2-capacity" style="display:block;font-size:11px;color:var(--muted);margin-top:2px"></span>
            </span>
          </label>
        </div>
      </div>
      <div class="field-group" id="ev-custom-q-field-wrap" style="display:none">
        <label class="field-label" id="ev-custom-q-field-label">Pergunta</label>
        <textarea id="ev-custom-q-answer" rows="2" placeholder="Escreva aqui..." style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;resize:vertical"></textarea>
      </div>
      <div class="field-group" style="display:flex;gap:10px;align-items:flex-start;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:14px;">
        <input type="checkbox" id="ev-consent" style="margin-top:3px;flex-shrink:0;width:18px;height:18px;">
        <label for="ev-consent" style="font-size:11.5px;color:var(--muted);line-height:1.5;cursor:pointer">
          Ao me inscrever, declaro estar apto(a) para praticar exercícios físicos e ciente da importância de estar em boas condições de saúde — ainda assim, um profissional de Educação Física estará presente para me orientar conforme meu nível de condicionamento. Sei que o evento acontece em área aberta e está sujeito a condições climáticas, e que vou receber informes pelo WhatsApp informado neste formulário. Este é um evento gratuito mediante inscrição prévia, e autorizo o uso de fotos e vídeos com minha imagem para divulgação nas redes sociais da Cantil Fitness.
        </label>
      </div>
      <button class="btn btn-gold" onclick="submitEventRegistration()">✅ Confirmar Inscrição</button>
      <div class="err" id="ev-error"></div>
      <div id="ev-blocked" class="blocked-msg" style="display:none">🚫 No último evento não identificamos sua presença. Entre em contato com a administração da Cantil para validar seu cadastro.</div>
      </div>
    </div>
    <div id="ev-success-card" style="display:none;margin-top:16px;background:rgba(61,232,154,0.1);border:1px solid rgba(61,232,154,0.35);border-radius:16px;padding:18px 20px;text-align:center;">
      <div style="font-size:28px;margin-bottom:6px">🎉</div>
      <div style="font-weight:800;font-size:15px;margin-bottom:4px">Inscrição confirmada!</div>
      <div id="ev-success-detail" style="font-size:13px;color:var(--muted)"></div>
    </div>
  </div>
</div>


<div class="view-section" id="view-assinante">
  <div class="video-wrap">
    <div class="sub-info-box" id="sub-info-box"></div>
    <div class="section-label">🔒 Vídeos Exclusivos</div>
    <div class="video-grid" id="assinante-grid"></div>
  </div>
</div>

<!-- CODE OVERLAY: aparece ao clicar num vídeo de assinante travado -->
<div class="modal-overlay" id="code-overlay" onclick="if(event.target===this)closeCodeOverlay()">
  <div class="modal" style="max-width:340px">
    <div class="modal-header">
      <div class="modal-title">🔒 CÓDIGO DE ACESSO</div>
      <button class="close-btn" onclick="closeCodeOverlay()">✕</button>
    </div>
    <div class="modal-body">
      <div class="pass-label" id="code-overlay-video-title" style="margin-bottom:14px"></div>
      <div class="field-group">
        <input type="text" id="code-overlay-input" class="gate-input" placeholder="CÓDIGO">
      </div>
      <button class="btn btn-gold" onclick="submitCodeOverlay()">🔓 Desbloquear e assistir</button>
      <div class="err" id="code-overlay-err"></div>
    </div>
  </div>
</div>

<!-- Admin trigger: small gear icon, discreet -->
<div id="meta-view" style="display:none;min-height:100vh;background:var(--bg);">
  <div class="mt-wrap">
    <div class="mt-lockrow" style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button id="meta-cad-btn" class="mt-lock" onclick="cadOpen()" style="display:none">🙋 MINHA PULSEIRA</button><button id="meta-val-btn" class="mt-lock" onclick="valOpen()" style="display:none">📎 STRAVA</button><button id="meta-lock-btn" class="mt-lock" onclick="mtLockClick()" style="display:none">🔒 Acesso da equipe</button></div>
    <div class="mt-head" style="text-align:center;margin-bottom:18px">
      <img id="meta-logo" alt="" style="display:none;max-height:70px;max-width:60%;margin:0 auto 10px">
      <div id="meta-title" style="font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:1px;line-height:1.05">Meta coletiva</div>
    </div>
    <div id="meta-pub" style="display:none"></div>
    <div class="mt-card" id="meta-staff" style="display:none"></div>
    <div class="mt-card" id="meta-clock" style="display:none;text-align:center"></div>
    <div class="mt-card" id="meta-final" style="display:none"></div>
    <div id="meta-groups" style="display:none"></div>
    <div class="mt-card" id="meta-single">
      <div style="display:flex;justify-content:space-between;align-items:center"><span class="mt-live" id="meta-badge"><i></i>AO VIVO</span><span id="meta-upd" style="font-size:11px;color:var(--muted)"></span></div>
      <div style="text-align:center;margin-top:16px"><span id="meta-total" style="font-family:'Bebas Neue',sans-serif;font-size:76px;line-height:1;color:var(--accent)">0</span><span id="meta-goal" style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:var(--muted)"> / 38 km</span></div>
      <div id="meta-route"></div>
      <div class="mt-bar"><div class="mt-fill" id="meta-fill"></div></div>
      <div id="meta-pct" style="font-size:13px;font-weight:700">0%</div>
      <div id="meta-leftbox"></div>
      <div class="mt-stats" id="meta-stats"></div>
      <div id="meta-names"></div>
      <div class="mt-foot">TIRE PRINT E POSTE NAS REDES SOCIAIS, MARQUE A CANTIL</div>
    </div>
    <div id="meta-img-single" style="margin:0 0 18px"></div>
    <div class="mt-card"><div class="section-label" style="margin-top:0">🏃 Quanto cada um fez</div><div id="meta-report"></div></div>
  </div>
  <div class="bd-ov" id="meta-cad" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box cad-up" style="text-align:left">
    <div style="font-weight:800;font-size:18px;margin-bottom:4px">🙋 Cadastrar atleta</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Nome, cor da equipe e número da pulseira. O atleta já entra na lista da equipe.</div>
    <div class="field-group"><label class="field-label">Nome</label>
      <div style="display:flex;gap:8px"><input type="text" id="cad-name" placeholder="Digite o nome ou toque na seta" autocomplete="off" autocorrect="off" oninput="cadType()"><button class="mt-tiny" style="flex:0 0 56px;padding:0;font-size:20px" onclick="cadToggleList()">▾</button></div>
      <div id="cad-sug" class="cad-sug" style="display:none"></div></div>
    <div class="field-group"><label class="field-label">Cor da equipe</label><div id="cad-chips" class="mt-gchips"></div></div>
    <div class="field-group"><label class="field-label">Número da pulseira / inscrição</label><input type="text" id="cad-num" inputmode="numeric" placeholder="ex: 12" oninput="cadCheck()" style="font-size:28px;text-align:center;font-weight:800;padding:14px"><div id="cad-who" style="margin-top:8px;font-weight:700;min-height:22px;text-align:center"></div></div>
    <button class="btn btn-blue" onclick="cadSave()">✅ Cadastrar atleta</button>
    <div id="cad-last" style="margin-top:10px;font-size:13px;color:var(--green);font-weight:700;text-align:center"></div>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="document.getElementById('meta-cad').classList.remove('open')">Fechar</button>
  </div></div>
  <div class="bd-ov" id="meta-val" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" style="text-align:left">
    <div style="font-weight:800;font-size:18px;margin-bottom:4px">📎 Enviar meu Strava</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Cole o link da atividade. A equipe confere se bate com os km registrados.</div>
    <div class="field-group"><label class="field-label">Nome</label>
      <div style="display:flex;gap:8px"><input type="text" id="val-name" placeholder="Digite o nome ou toque na seta" autocomplete="off" autocorrect="off" oninput="valType()"><button class="mt-tiny" style="flex:0 0 52px;padding:0;font-size:18px" onclick="valToggleList()">▾</button></div>
      <div id="val-sug" class="cad-sug" style="display:none"></div></div>
    <div class="field-group"><label class="field-label">Nº da pulseira / inscrição (opcional)</label><input type="text" id="val-num" inputmode="numeric" placeholder="ex: 12" oninput="valNum()"><div id="val-hint" style="margin-top:8px;font-size:13px;font-weight:700"></div></div>
    <div class="field-group"><label class="field-label">Link da atividade no Strava</label><input type="text" id="val-link" inputmode="url" placeholder="https://www.strava.com/activities/..." autocapitalize="off" autocorrect="off"></div>
    <button class="btn btn-blue" onclick="valSave()">✅ Enviar</button>
    <div id="val-res" style="margin-top:10px;font-size:13px;font-weight:700;text-align:center"></div>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="document.getElementById('meta-val').classList.remove('open')">Fechar</button>
  </div></div>
  <div class="bd-ov" id="meta-vlist" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" style="text-align:left">
    <div style="font-weight:800;font-size:18px">📎 Strava dos atletas</div>
    <div style="font-size:12px;color:var(--muted);margin:4px 0 12px">Os envios pendentes aparecem primeiro. Abra o link, compare com os km registrados e toque em Conferido.</div>
    <div id="meta-vlist-body"></div>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:10px" onclick="document.getElementById('meta-vlist').classList.remove('open')">Fechar</button>
  </div></div>
  <div class="bd-ov" id="meta-lap" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" style="text-align:left">
    <div style="font-weight:800;font-size:18px">📍 REGISTRAR VOLTA POR GPS</div>
    <div id="lap-info" style="font-size:12px;color:var(--muted);margin:4px 0 12px"></div>
    <div class="field-group" id="lap-gwrap"><label class="field-label">Cor da pulseira</label><div id="lap-chips" class="mt-gchips"></div></div>
    <div class="field-group" id="lap-nwrap"><label class="field-label">Número da pulseira / inscrição</label><input type="text" id="lap-num" inputmode="numeric" placeholder="ex: 12" oninput="lapWho()" style="font-size:28px;text-align:center;font-weight:800;padding:14px"><div id="lap-who" style="margin-top:8px;font-weight:700;min-height:22px;text-align:center"></div></div>
    <button class="btn btn-blue" id="lap-btn" style="font-size:18px;padding:18px" onclick="lapGo()">📍 PASSEI NA LINHA</button>
    <div id="lap-res" style="margin-top:12px;font-weight:700;text-align:center;min-height:22px"></div>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="document.getElementById('meta-lap').classList.remove('open')">Fechar</button>
  </div></div>
  <div class="bd-ov" id="meta-pw-ov" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" style="text-align:left">
    <div style="font-weight:800;font-size:18px;margin-bottom:4px">🔒 Área de registro</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Digite a senha de quem registra os km.</div>
    <input type="password" id="mt-pw" placeholder="Senha" onkeydown="if(event.key==='Enter')mtPwSubmit()">
    <button class="btn btn-blue" style="margin-top:12px" onclick="mtPwSubmit()">Entrar</button>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="document.getElementById('meta-pw-ov').classList.remove('open')">Cancelar</button>
  </div></div>
  <div class="bd-ov" id="meta-sheet" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" style="text-align:left">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font-size:18px">➕ Registrar</b><span id="mt-reg-badge" class="mt-vb ok" style="display:none"></span></div>
    <div class="field-group" id="mt-group-wrap" style="display:none"><div id="mt-gchips" class="mt-gchips mt-gsm"></div></div>
    <div id="mt-roster" class="mt-roster" style="display:none"></div>
    <div class="field-group" id="mt-num-wrap" style="display:none"><input type="text" id="mt-num" inputmode="numeric" placeholder="Nº da pulseira / inscrição" oninput="mtWho();mtRosterList()" style="font-size:24px;text-align:center;font-weight:800;padding:10px"><div id="mt-who" style="margin-top:6px;font-weight:700;min-height:20px;text-align:center;font-size:13px"></div></div>
    <div id="mt-name-block"><div class="field-group"><label class="field-label" id="mt-name-label">Nome</label><div style="display:flex;gap:8px"><input type="text" id="mt-name" placeholder="Digite o nome ou toque na seta" autocomplete="off" autocorrect="off" oninput="mtNameType()"><button class="mt-tiny" style="flex:0 0 52px;padding:0;font-size:18px" onclick="mtNameList()">▾</button></div>
      <div id="mt-sug" class="cad-sug" style="display:none"></div>
      <div id="mt-mine" style="display:none;margin-top:8px;font-size:13px;color:var(--accent);font-weight:700"></div></div></div>
    <div class="field-group" id="mt-pt-wrap" style="display:none">
      <div class="mt-gchips"><button class="mt-gchip mt-pt" id="mt-pt-a" onclick="mtSetPt('A')">PONTO A<small>Largada / chegada</small></button><button class="mt-gchip mt-pt" id="mt-pt-b" onclick="mtSetPt('B')">PONTO B<small>Ponto de volta</small></button></div></div>
    <div class="field-group"><label class="field-label" id="mt-km-label">Distância (km)</label><input type="text" id="mt-km" inputmode="decimal" placeholder="ex: 2,4" oninput="mtChipSync()">
      <div id="mt-kmu" style="display:flex;gap:6px;margin-top:6px"><button class="mt-tiny" id="mt-u-km" onclick="mtSetKmUnit('km')">km</button><button class="mt-tiny" id="mt-u-m" onclick="mtSetKmUnit('m')">metros</button></div>
      <div id="mt-chips" class="bd-opts" style="margin-top:8px"></div></div>
    <button class="btn btn-blue" id="mt-send" onclick="mtSubmit()">✅ Somar na meta</button>
    <div id="mt-last" style="margin-top:10px;font-size:13px;color:var(--green);font-weight:700;text-align:center"></div>
    <button class="btn-sm-danger" id="mt-undo" style="display:none;width:100%;padding:10px;margin-top:6px" onclick="mtUndo()"></button>
    <div style="display:flex;gap:8px;margin-top:10px;justify-content:space-between"><button class="mt-tiny" id="mt-more-btn" style="display:none" onclick="mtToggleMore()">⋯ mais opções</button><button class="mt-tiny" onclick="document.getElementById('meta-sheet').classList.remove('open')">Fechar</button></div>
    <div id="mt-more" style="display:none;margin-top:10px">
      <div id="mt-ath-wrap" style="display:none;margin-bottom:12px">
        <div style="display:flex;gap:8px"><button class="btn-sm-danger" style="flex:1;padding:10px" onclick="mtAthOpen('new')">➕ Novo atleta</button><button class="btn-sm-danger" style="flex:1;padding:10px" onclick="mtAthOpen('edit')">✏️ Editar atleta</button></div>
        <div id="mt-ath-panel" style="display:none;margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--s2)">
          <div id="mt-ath-title" style="font-weight:800;margin-bottom:8px"></div>
          <div style="display:flex;gap:8px"><input type="text" id="mt-ath-num" inputmode="numeric" placeholder="Nº (vazio = automático)" style="flex:0 0 40%"><input type="text" id="mt-ath-name" placeholder="Nome do atleta" autocapitalize="words"></div>
          <button class="btn btn-blue" style="margin-top:10px" onclick="mtAthSave()">💾 Salvar atleta</button>
          <button class="btn-sm-danger" id="mt-ath-del" style="display:none;width:100%;padding:10px;margin-top:8px" onclick="mtAthDelete()">🗑 Remover da lista</button>
          <button class="btn-sm-danger" style="width:100%;padding:10px;margin-top:8px" onclick="mtAthClose()">Cancelar</button>
        </div>
      </div>
      <button class="btn-sm-danger" id="mt-name-toggle" style="display:none;width:100%;padding:10px" onclick="mtToggleName()">🔎 Buscar pelo nome</button>
    </div>
  </div></div>
  <div class="bd-ov" id="meta-img-ov" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" style="padding:14px;text-align:left">
    <div style="font-weight:800;font-size:17px">📲 Sua imagem para as redes</div>
    <div style="font-size:12px;color:var(--muted);margin:4px 0 10px">O quadriculado mostra que o fundo é transparente. Escolha a cor da letra:</div>
    <div style="display:flex;gap:8px;margin-bottom:10px"><button class="bd-opt on" id="mt-c-white" style="flex:1;padding:12px" onclick="mtImgColor('white')">⚪ Letra branca</button><button class="bd-opt" id="mt-c-black" style="flex:1;padding:12px" onclick="mtImgColor('black')">⚫ Letra preta</button></div>
    <div id="meta-img-wrap" style="background:#4a4a4a;border-radius:12px;padding:8px"><img id="meta-img" alt="" style="width:100%;display:block"></div>
    <button class="btn btn-blue" style="margin-top:12px" onclick="mtCopy()">📋 Copiar para colar nos stories</button>
    <div style="font-size:11px;color:var(--muted);margin:6px 0 2px">Nos stories: toque em <b>Aa</b>, segure e escolha <b>Colar</b> — vira figurinha com fundo transparente. Salvar em Fotos costuma preencher o fundo de preto; para guardar o PNG transparente use <b>Baixar</b> e salve em <b>Arquivos</b>.</div>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="mtDownload()">⬇️ Baixar PNG transparente</button>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="mtShare()">📤 Compartilhar</button>
    <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="document.getElementById('meta-img-ov').classList.remove('open')">Fechar</button>
  </div></div>
</div>

<div class="admin-trigger" onclick="openAdminModal()" title="Admin">⚙</div>


<!-- MODAL -->
<div class="modal-overlay" id="modal-overlay" onclick="overlayClick(event)">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="modal-title">ACESSO</div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">

      <!-- PASSWORD GATE -->
      <div id="pass-gate">
        <div class="pass-label">Área restrita. Digite a senha para continuar.</div>
        <div class="field-group">
          <input type="password" id="pass-input" placeholder="••••••••">
        </div>
        <button class="btn btn-gold" onclick="checkPass()">🔑 Entrar</button>
        <div class="err" id="pass-err"></div>
      </div>

      <!-- ADMIN PANEL -->
      <div id="admin-panel" style="display:none">
        <div class="adm-tabs" style="flex-wrap:wrap;">
          <button class="adm-tab active" onclick="admTab('quick')">⚡ Rápido</button>
          <button class="adm-tab" onclick="admTab('pts')">Pontos</button>
          <button class="adm-tab" onclick="admTab('historico')">📜 Histórico</button>
          <button class="adm-tab" onclick="admTab('members')">Membros</button>
          <button class="adm-tab" onclick="admTab('challenges')">🎬 Desafios</button>
          <button class="adm-tab" onclick="admTab('distintivos')">🏅 Distintivos</button>
          <button class="adm-tab" onclick="admTab('meta')">🏁 Meta</button>
          <button class="adm-tab" onclick="admTab('evento')">🏁 Evento</button>
          <button class="adm-tab" onclick="admTab('arquivados')">📁 Encerrados</button>
          <button class="adm-tab" onclick="admTab('subscribers')">🔒 Assinante</button>
          <button class="adm-tab" onclick="admTab('settings')">Config</button>
        </div>

        <!-- TOQUE RÁPIDO -->
        <div class="adm-panel active" id="tab-quick">
          <div class="section-label">Toque no nome para somar +3 pts</div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="number" id="quick-value" value="3" style="width:70px;text-align:center;font-weight:800;font-size:16px;">
            <div style="flex:1;display:flex;align-items:center;font-size:11px;color:var(--muted);">pontos por toque</div>
          </div>
          <!-- LISTA COLADA: distribui pontos por nome (busca por similaridade) -->
          <details open style="margin-bottom:18px;background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">
            <summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--accent);">📋 Colar lista de nomes</summary>
            <div style="margin-top:12px;">
              <textarea id="lista-input" rows="5" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Cole os nomes, um por linha&#10;Ex:&#10;Danielle&#10;danielle (marcos)&#10;thais"></textarea>
              <button class="btn btn-blue" style="margin-top:10px;" onclick="listaConferir()">🔎 Conferir lista</button>
              <div id="lista-preview" style="margin-top:12px;"></div>
            </div>
          </details>

          <input type="text" id="quick-search" class="qt-search" placeholder="🔍 Buscar membro...">
          <div id="quick-tap-list"></div>
        </div>

        <!-- PONTOS -->
        <div class="adm-panel" id="tab-pts">
          <div class="section-label">Adicionar / Remover Pontos</div>
          <div class="field-group">
            <label class="field-label">Membro</label>
            <select id="a-member"></select>
          </div>
          <div class="field-group">
            <label class="field-label">Pontos (negativo para remover)</label>
            <input type="number" id="a-points" placeholder="ex: 100 ou -30">
          </div>
          <div class="field-group">
            <label class="field-label">Motivo</label>
            <input type="text" id="a-reason" placeholder="ex: Participação no evento">
          </div>
          <div class="field-group">
            <label class="field-label">Categoria</label>
            <select id="a-category" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
              <option value="treino" selected>🏋️ Treino diário</option>
              <option value="desafio">🔥 Desafio</option>
              <option value="evento">⭐ Evento</option>
            </select>
          </div>
          <button class="btn btn-blue" onclick="addPoints()">⚡ Registrar</button>
          <hr class="divider">
          <div class="section-label">Últimos registros</div>
          <div id="recent-history"></div>
        </div>

        <!-- HISTÓRICO (gerenciar ícones de desafio/evento e ver mais lançamentos) -->
        <div class="adm-panel" id="tab-historico">
          <div class="section-label">📜 Histórico de Lançamentos (últimos 30)</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.5">
            Lançou "Evento" ou "Desafio" por engano e o ícone ⭐/🔥 ficou preso no ranking? Troque a categoria aqui pra "Treino diário" — isso remove o ícone <strong>sem mexer nos pontos</strong> da pessoa.
          </div>
          <div id="history-manager-list"></div>
        </div>

        <!-- MEMBROS -->
        <div class="adm-panel" id="tab-members">
          <div class="section-label">Cadastrar Novo Membro</div>
          <div class="field-group">
            <label class="field-label">Nome</label>
            <input type="text" id="n-name" placeholder="Nome completo">
          </div>
          <div class="field-group">
            <label class="field-label">Emoji (avatar)</label>
            <input type="text" id="n-emoji" placeholder="😊" maxlength="4" readonly style="cursor:pointer" onclick="toggleEmojiPicker('n-emoji')">
            <div id="emoji-picker-n-emoji" class="emoji-picker-grid" style="display:none"></div>
          </div>
          <div class="field-group">
            <label class="field-label">Gênero (categoria do ranking)</label>
            <select id="n-gender" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
              <option value="F">👩 Feminino</option>
              <option value="M">👨 Masculino</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Aniversário (data de nascimento)</label>
            <input type="date" id="n-birthday" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
            <div style="font-size:11px;color:var(--muted);margin-top:6px">🧒 Membros de 6 a 14 anos entram automaticamente na categoria Infantil e não aparecem no ranking geral. Ao completar 15, voltam pro geral sozinhos.</div>
          </div>
          <button class="btn btn-blue" onclick="addMember()" style="margin-bottom:20px">✅ Cadastrar</button>
          <hr class="divider">
          <div class="section-label">Membros ativos</div>
          <div id="members-list"></div>
        </div>

        <!-- DESAFIOS (público) -->
        <div class="adm-panel" id="tab-challenges">
          <div class="section-label">🎬 Adicionar Short de Desafio</div>
          <div class="field-group">
            <label class="field-label">Título</label>
            <input type="text" id="cv-title" placeholder="ex: Desafio 12 — Prancha 1min">
          </div>
          <div class="field-group">
            <label class="field-label">Link do YouTube</label>
            <input type="text" id="cv-url" placeholder="Cole o link do vídeo (normal ou Short)">
          </div>
          <div class="field-group">
            <label class="field-label">Descrição (gera interesse)</label>
            <input type="text" id="cv-desc" placeholder="ex: Quantos você consegue fazer em 1 minuto?">
          </div>
          <div class="field-group">
            <label class="field-label">Categoria</label>
            <select id="cv-category" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
              <option value="true" selected>🔓 Aberto (destaque, card grande)</option>
              <option value="false">📋 Lista (miniatura)</option>
            </select>
          </div>
          <button class="btn btn-blue" onclick="addChallengeVideo()" style="margin-bottom:20px">✅ Gerar link de Short</button>
          <hr class="divider">
          <div class="section-label">Desafios publicados</div>
          <div id="challenges-admin-list"></div>
        </div>

        <!-- EVENTO -->
        <div class="adm-panel" id="tab-distintivos">
          <div class="section-label">🏅 Criar / editar distintivo</div>
          <div id="bd-preview" style="text-align:center;margin:6px 0 14px"></div>
          <div class="field-group"><label class="field-label">Padrão</label><div class="bd-opts" id="bd-shapes"></div></div>
          <div class="field-group"><label class="field-label">Cor geral</label>
            <div class="bd-opts" id="bd-colors" style="align-items:center"></div>
            <input type="color" id="bd-color" value="#e8ff00" oninput="bdPickColor(this.value)" style="width:100%;height:44px;margin-top:8px;padding:2px;border-radius:10px;background:var(--s2);border:1px solid var(--border)"></div>
          <div class="field-group"><label class="field-label">Nome do distintivo</label><input type="text" id="bd-name" placeholder="ex: Batalha dos 100" oninput="bdPreview()"></div>
          <div class="field-group"><label class="field-label">Ícone (emoji)</label><input type="text" id="bd-emoji" placeholder="ex: 🔥" oninput="bdPreview()"></div>
          <div class="field-group"><label class="field-label">Texto de cima (modelos Emblema)</label><input type="text" id="bd-top" maxlength="22" placeholder="ex: CANTIL FITNESS" oninput="bdPreview()"></div>
          <div class="field-group"><label class="field-label">Borda colorida (modelos Emblema)</label>
            <label style="display:flex;align-items:center;gap:10px;font-size:14px"><input type="checkbox" id="bd-accent-on" style="width:20px;height:20px" onchange="bdPreview()"> Usar cor na borda</label>
            <input type="color" id="bd-accent" value="#e8ff00" oninput="document.getElementById('bd-accent-on').checked=true;bdPreview()" style="width:100%;height:44px;margin-top:8px;padding:2px;border-radius:10px;background:var(--s2);border:1px solid var(--border)"></div>
          <div class="field-group"><label class="field-label">Posição da mancha (modelos Aquarela)</label><select id="bd-wash" onchange="bdPreview()"><option value="right">Direita</option><option value="left">Esquerda</option><option value="bottom">Embaixo</option></select></div>
          <div class="field-group"><label class="field-label">Texto principal</label><input type="text" id="bd-title" maxlength="18" placeholder="ex: FINISHER" oninput="bdPreview()"></div>
          <div class="field-group"><label class="field-label">Texto de baixo</label><input type="text" id="bd-sub" maxlength="26" placeholder="ex: CANTIL 2026" oninput="bdPreview()"></div>
          <div class="field-group"><label class="field-label">Descrição (aparece ao tocar)</label><textarea id="bd-desc" rows="2" placeholder="ex: Concluiu o treinão de feriado"></textarea></div>
          <button class="btn btn-blue" onclick="bdSave()">💾 Salvar distintivo</button>
          <button class="btn-sm-danger" style="margin-top:8px;width:100%;padding:12px" onclick="bdReset()">Limpar / novo</button>

          <div class="section-label" style="margin-top:26px">📚 Meus distintivos</div>
          <div id="bd-list"></div>

          <div class="section-label" style="margin-top:26px">🎖️ Conceder a membros</div>
          <div class="field-group"><label class="field-label">Distintivo</label><select id="bd-award-badge" onchange="BD_SEL.clear();bdRenderMembers()"></select></div>
          <input type="text" id="bd-search" placeholder="🔍 Buscar membro..." oninput="bdRenderMembers()" style="margin-bottom:10px">
          <div id="bd-members"></div>
          <button class="btn btn-blue" id="bd-award-btn" style="margin-top:8px" onclick="bdAward()">🎖️ Conceder</button>
        </div>

        <div class="adm-panel" id="tab-meta">
          <div class="section-label">🏁 Meta coletiva (link ao vivo)</div>
          <div id="mt-sql-warn" style="display:none;background:rgba(255,95,109,.12);border:1px solid var(--red);border-radius:12px;padding:12px;font-size:13px;margin-bottom:14px">⚠️ A tabela <b>relay_entries</b> ainda não existe no Supabase. Rode o arquivo <b>supabase-meta.sql</b> no SQL Editor.</div>
          <div class="field-group"><label class="field-label">Título</label><input type="text" id="mta-title" placeholder="ex: Desafio 38 km — Aniversário do Coach"></div>
          <div class="field-group"><label class="field-label">Meta única (km ou rounds) — usada quando não há equipes</label><input type="text" id="mta-goal" inputmode="decimal" placeholder="38"></div>
          <div class="field-group"><label class="field-label">Km de cada volta (opcional)</label><input type="text" id="mta-lap" inputmode="decimal" placeholder="ex: 0,4 — cria botões de 1, 2, 3 voltas"></div>
          <div class="field-group"><label style="display:flex;align-items:center;gap:10px;font-size:13px"><input type="checkbox" id="mta-half" style="width:20px;height:20px" onchange="mtRegLinks()"> Usar ponto B (meia volta): o staff no B e o staff no A registram metade da volta cada. Precisa do km da volta.</label></div>
          <div class="field-group"><label class="field-label">Tipo de meta</label><select id="mta-unit"><option value="km">📏 Quilômetros (km)</option><option value="rounds">🔁 Número de rounds</option></select></div>
          <div class="field-group"><label class="field-label">⏱ Time cap: tempo máximo de prova (opcional)</label><input type="text" id="mta-cap" placeholder="ex: 45:00 (minutos:segundos). Vazio = sem limite">
            <select id="mta-capmode" style="margin-top:8px"><option value="down">⏳ Decrescente: conta de trás para frente</option><option value="up">⏱ Crescente: conta até o limite</option></select></div>
          <div class="field-group"><label class="field-label">Lista de nomes para escolher</label><select id="mta-src"><option value="evento">Inscritos do evento atual</option><option value="membros">Membros do clube</option><option value="ambos">Inscritos + membros</option></select></div>
          <div class="field-group"><label class="field-label">🔒 Senha de quem registra</label>
            <div style="font-size:12px;color:var(--muted);line-height:1.45">Agora é uma senha única da equipe, definida na aba <b>Config</b>. Vale para o link da Meta e para o link de Lançar resultados.</div>
            <button class="btn-sm" style="width:100%;padding:10px;margin-top:8px" onclick="admTab('settings')">Abrir Config →</button></div>
                    <div class="field-group"><label class="field-label">Percurso desenhado nos quadros</label><div id="mta-routes"></div></div>
          <div class="section-label" style="margin-top:18px">👥 Equipes / grupos</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Cada equipe tem nome, cor, meta e barra próprios. Para equipe <b>sem números</b>, deixe a lista de atletas vazia: quem registra escolhe só a cor da equipe e informa os km. Com atletas numerados, digite o nº da pulseira. Durante o evento, quem registra também pode cadastrar e editar atletas na própria tela de registro. Sem equipes, vale a meta única.</div>
          <div id="mta-groups"></div>
          <button class="btn-sm-danger" style="width:100%;padding:12px;margin-bottom:16px" onclick="mtaAddGroup()">➕ Adicionar equipe (até 8)</button>
          <div class="field-group"><label class="field-label">Sua logo (vai na imagem para as redes)</label><input type="file" id="mta-logo" accept="image/*" onchange="mtLogoPick(this)"><img id="mta-logo-prev" alt="" style="display:none;max-height:60px;margin-top:8px;background:#fff;border-radius:8px;padding:4px"></div>
          <button class="btn btn-blue" onclick="mtSaveCfg()">💾 Salvar configuração</button>
          <div class="section-label" style="margin-top:22px">🔗 Links</div>
          <div class="mt-links">
            <div class="mt-linkrow"><span>📊 Painel ao vivo</span><span><button class="mt-tiny" onclick="mtCopyLink('mta-link')">Copiar</button><button class="mt-tiny" onclick="mtOpenLink('mta-link')">Abrir</button></span></div>
            <div class="mt-linkrow"><span>📺 TV (lado a lado)</span><span><button class="mt-tiny" onclick="mtCopyLink('mta-link-tv')">Copiar</button><button class="mt-tiny" onclick="mtOpenLink('mta-link-tv')">Abrir</button></span></div>
            <div class="mt-linkrow"><span id="mta-reg-a-l">✍️ Registro · Ponto A</span><span><button class="mt-tiny" onclick="mtCopyLink('mta-reg-a')">Copiar</button><button class="mt-tiny" onclick="mtOpenLink('mta-reg-a')">Abrir</button></span></div>
            <div class="mt-linkrow" id="mta-reg-b-row"><span>✍️ Registro · Ponto B</span><span><button class="mt-tiny" onclick="mtCopyLink('mta-reg-b')">Copiar</button><button class="mt-tiny" onclick="mtOpenLink('mta-reg-b')">Abrir</button></span></div>
            <div class="mt-linkrow"><span>📍 Check-in GPS (QR)</span><span><button class="mt-tiny" onclick="mtCopyLink('mta-cp-link')">Copiar</button><button class="mt-tiny" onclick="mtShowQr()">Ver QR</button></span></div>
          </div>
          <input type="text" id="mta-link" style="display:none"><input type="text" id="mta-link-tv" style="display:none"><input type="text" id="mta-cp-link" style="display:none"><input type="text" id="mta-reg-a" style="display:none"><input type="text" id="mta-reg-b" style="display:none">
          <img id="mta-cp-qr" alt="QR do check-in" style="display:none;width:200px;margin:12px auto 0;border-radius:10px;background:#fff;padding:8px">
          <div class="section-label" style="margin-top:22px">📍 Check-in por GPS (QR no ponto da volta)</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Esta opção não aparece na tela principal: só abre para quem lê o QR. O atleta escolhe a cor e o número e toca em "Passei na linha". O painel só aceita se o GPS do celular estiver perto do ponto e se já passou o tempo mínimo desde a última volta dele.</div>
          <div style="display:flex;gap:8px"><input type="text" id="mta-cp-lat" inputmode="decimal" placeholder="Latitude"><input type="text" id="mta-cp-lng" inputmode="decimal" placeholder="Longitude"></div>
          <button class="btn-sm-danger" style="width:100%;padding:12px;margin:8px 0" onclick="mtCpHere()">📍 Usar minha localização agora como ponto da volta</button>
          <div style="display:flex;gap:8px"><input type="text" id="mta-cp-r" inputmode="numeric" placeholder="Raio em metros (ex: 40)"><input type="text" id="mta-cp-min" inputmode="numeric" placeholder="Mín. entre voltas, s (ex: 60)"></div>
                    <div style="font-size:11px;color:var(--muted)">Salve a configuração para valer. A imagem do QR vem do serviço qrserver.com. Imprima e cole no ponto da volta.</div>
          <div class="section-label" style="margin-top:22px">Controle</div>
          <button class="btn btn-blue" onclick="mtStart()">🏁 Dar a largada (inicia o cronômetro)</button>
          <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="mtToggleClosed()" id="mta-close">⏹ Encerrar registros</button>
          <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="mtPrintFinal()">📄 Relatório por equipe (imprimir / PDF)</button>
          <button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="mtNewChallenge()">🔄 Novo desafio (zera tudo)</button>
          <div class="section-label" style="margin-top:22px">📎 Strava enviado pelos atletas (pendentes primeiro)</div>
          <div id="mta-val-list"></div>
          <div class="section-label" style="margin-top:22px">Últimos registros</div>
          <div id="mta-list"></div>
        </div>

        <div class="adm-panel" id="tab-evento">
          <div class="live-ctl" id="live-ctl">
            <div class="section-label">🔴 Controle ao vivo</div>
            <div id="live-ctl-rows"></div>
            <div class="live-hint">Libere o evento que está acontecendo e toque em ▶ Começar: o cronômetro roda sozinho até você pausar ou encerrar, ou até estourar o Time Cap. A equipe só toca em “Finalizar” em cada participante e o tempo de prova sai na hora. Não precisa salvar o evento.</div>
          </div>
          <div class="section-label">🏁 Configurar Evento</div>
          <div class="field-group">
            <label class="field-label">Nome do evento</label>
            <input type="text" id="ev-cfg-name" placeholder="ex: Desafio de Verão Cantil">
          </div>
          <div class="field-group">
            <label class="field-label">🎯 Este evento tem 2 provas/atividades separadas?</label>
            <div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">
              <input type="checkbox" id="ev-cfg-dual" onchange="toggleDualEventFields()" style="width:18px;height:18px;flex-shrink:0">
              <span style="font-size:13px">Sim, a pessoa pode se inscrever em 1 ou nas 2</span>
            </div>
          </div>
          <div id="ev-dual-fields-wrap" style="display:none">
            <div style="background:rgba(45,125,255,0.06);border:1px solid rgba(45,125,255,0.25);border-radius:14px;padding:14px;margin-bottom:14px;">
              <div style="font-weight:800;font-size:13px;color:#5b9dff;margin-bottom:10px" id="ev-cfg-sub1-header">🥇 Evento 1</div>
              <div class="field-group">
                <label class="field-label">Nome do Evento 1</label>
                <input type="text" id="ev-cfg-sub1" placeholder="ex: Treinamento Funcional">
              </div>
              <div class="field-group">
                <label class="field-label">Data e local (Evento 1)</label>
                <input type="text" id="ev-cfg-meta-1" placeholder="ex: 20/08 às 9h · CT Cantil Fitness">
              </div>
              <div class="field-group">
                <label class="field-label">Descrição (Evento 1)</label>
                <textarea id="ev-cfg-desc-1" rows="3" placeholder="ex: Traga sua garrafinha e disposição!" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;resize:vertical"></textarea>
              </div>
              <div style="height:1px;background:rgba(255,255,255,0.08);margin:6px 0 14px"></div>
              <div class="field-group">
                <label class="field-label">Vagas (Evento 1)</label>
                <input type="number" id="ev-cfg-max-1" placeholder="ex: 40">
              </div>
              <div class="field-group">
                <label class="field-label">Pontos por presença (Evento 1)</label>
                <input type="number" id="ev-cfg-points-1" placeholder="ex: 10">
              </div>
              <div class="field-group">
                <label class="field-label">Tipo de resultado (Evento 1)</label>
                <select id="ev-cfg-result-type-1" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                  <option value="">— Sem resultado (só presença)</option>
                  <option value="tempo">⏱️ Tempo (For Time)</option>
                  <option value="rounds">🔁 Rounds/Reps (AMRAP)</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">⏱ Time Cap (Evento 1) — só para resultados de tempo</label>
                <div style="display:flex;gap:8px;align-items:center">
                  <input type="number" id="ev-cfg-timecap-min-1" placeholder="min" min="0" style="width:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);text-align:center">
                  <span>min</span>
                  <input type="number" id="ev-cfg-timecap-sec-1" placeholder="seg" min="0" max="59" style="width:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);text-align:center">
                  <span>seg</span>
                </div>
              </div>
              <div class="field-group" style="margin-bottom:0">
                <label class="field-label">Status (Evento 1)</label>
                <select id="ev-cfg-active-1" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                  <option value="true">✅ Inscrições abertas</option>
                  <option value="false">🚫 Inscrições fechadas</option>
                </select>
              </div>
            </div>
            <div style="background:rgba(255,208,96,0.06);border:1px solid rgba(255,208,96,0.25);border-radius:14px;padding:14px;margin-bottom:14px;">
              <div style="font-weight:800;font-size:13px;color:var(--gold);margin-bottom:10px" id="ev-cfg-sub2-header">🥈 Evento 2</div>
              <div class="field-group">
                <label class="field-label">Nome do Evento 2</label>
                <input type="text" id="ev-cfg-sub2" placeholder="ex: Corrida 5km">
              </div>
              <div class="field-group">
                <label class="field-label">Data e local (Evento 2)</label>
                <input type="text" id="ev-cfg-meta-2" placeholder="ex: 20/08 às 11h · Parque da Cidade">
              </div>
              <div class="field-group">
                <label class="field-label">Descrição (Evento 2)</label>
                <textarea id="ev-cfg-desc-2" rows="3" placeholder="ex: Nível intermediário/avançado, traga tênis de corrida." style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;resize:vertical"></textarea>
              </div>
              <div style="height:1px;background:rgba(255,255,255,0.08);margin:6px 0 14px"></div>
              <div class="field-group">
                <label class="field-label">Vagas (Evento 2)</label>
                <input type="number" id="ev-cfg-max-2" placeholder="ex: 40">
              </div>
              <div class="field-group">
                <label class="field-label">Pontos por presença (Evento 2)</label>
                <input type="number" id="ev-cfg-points-2" placeholder="ex: 10">
              </div>
              <div class="field-group">
                <label class="field-label">Tipo de resultado (Evento 2)</label>
                <select id="ev-cfg-result-type-2" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                  <option value="">— Sem resultado (só presença)</option>
                  <option value="tempo">⏱️ Tempo (For Time)</option>
                  <option value="rounds">🔁 Rounds/Reps (AMRAP)</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">⏱ Time Cap (Evento 2) — só para resultados de tempo</label>
                <div style="display:flex;gap:8px;align-items:center">
                  <input type="number" id="ev-cfg-timecap-min-2" placeholder="min" min="0" style="width:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);text-align:center">
                  <span>min</span>
                  <input type="number" id="ev-cfg-timecap-sec-2" placeholder="seg" min="0" max="59" style="width:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);text-align:center">
                  <span>seg</span>
                </div>
              </div>
              <div class="field-group" style="margin-bottom:0">
                <label class="field-label">Status (Evento 2)</label>
                <select id="ev-cfg-active-2" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                  <option value="true">✅ Inscrições abertas</option>
                  <option value="false">🚫 Inscrições fechadas</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Campos ÚNICOS de data/local/descrição (só para evento simples, sem dual) -->
          <div id="ev-single-meta-desc-wrap">
            <div class="field-group">
              <label class="field-label">Data e local</label>
              <input type="text" id="ev-cfg-meta" placeholder="ex: 20/08 às 9h · CT Cantil Fitness">
            </div>
            <div class="field-group">
              <label class="field-label">Descrição</label>
              <textarea id="ev-cfg-desc" rows="4" placeholder="ex: Traga sua garrafinha e disposição! Cole aqui também links (ex: https://...) que viram clicáveis." style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;resize:vertical"></textarea>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">🖼️ Imagem do evento (formato post Instagram, otimizada automaticamente)</label>
            <input type="file" id="ev-cfg-image-input" accept="image/*" onchange="handleEventImageUpload(event)" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:13px;">
            <div id="event-image-preview-wrap" style="display:none;margin-top:10px;position:relative;">
              <img id="event-image-preview" style="width:100%;border-radius:12px;border:1px solid var(--border);display:block;">
              <button class="btn-sm-danger" onclick="removeEventImage()" style="position:absolute;top:8px;right:8px;">🗑️ Remover</button>
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:6px">A imagem é comprimida automaticamente (máx ~200KB) para não pesar o banco de dados.</div>
          </div>
          <div class="field-group" id="ev-cfg-max-wrap">
            <label class="field-label">Vagas totais</label>
            <input type="number" id="ev-cfg-max" placeholder="ex: 40">
          </div>

          <!-- Campos ÚNICOS (evento simples, sem dual) -->
          <div id="ev-single-fields-wrap">
            <div class="field-group">
              <label class="field-label">Pontos por presença confirmada (membros)</label>
              <input type="number" id="ev-cfg-points" placeholder="ex: 10">
            </div>
            <div class="field-group">
              <label class="field-label">Tipo de resultado deste evento</label>
              <select id="ev-cfg-result-type" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                <option value="">— Sem resultado (só presença)</option>
                <option value="tempo">⏱️ Tempo (For Time)</option>
                <option value="rounds">🔁 Rounds/Reps (AMRAP)</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">⏱ Time Cap — só para resultados de tempo</label>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="ev-cfg-timecap-min" placeholder="min" min="0" style="width:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);text-align:center">
                <span>min</span>
                <input type="number" id="ev-cfg-timecap-sec" placeholder="seg" min="0" max="59" style="width:80px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);text-align:center">
                <span>seg</span>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Status</label>
              <select id="ev-cfg-active" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                <option value="true">✅ Inscrições abertas</option>
                <option value="false">🚫 Inscrições fechadas</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">🙋 Visitantes (não-membros) podem se inscrever?</label>
              <select id="ev-cfg-allow-visitor" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
                <option value="true">✅ Sim, aceitar visitantes</option>
                <option value="false">🚫 Não, só membros/alunos do CT</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">📝 Pergunta extra no cadastro (opcional)</label>
              <div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:10px">
                <input type="checkbox" id="ev-cfg-custom-q-enabled" onchange="toggleCustomQuestionField()" style="width:18px;height:18px;flex-shrink:0">
                <span style="font-size:13px">Habilitar campo de texto extra pra este evento</span>
              </div>
              <div id="ev-cfg-custom-q-wrap" style="display:none">
                <label class="field-label">Cabeçalho / pergunta a exibir</label>
                <input type="text" id="ev-cfg-custom-q-label" placeholder="ex: Já pagou? Como pagou? Qual sua equipe/tamanho da camisa?" style="margin-bottom:10px">
                <div style="font-size:11px;color:var(--muted)">A pessoa vai ver esse texto como título e um campo livre pra responder abaixo dele, ao se inscrever.</div>
              </div>
            </div>
          </div>

          <!-- Campos DUPLICADOS por sub-evento (só aparecem se dual estiver marcado) -->
          <div id="ev-dual-config-wrap" style="display:none"></div>

          <button class="btn btn-blue" onclick="updateEventConfig()" style="margin-bottom:8px">💾 Salvar Evento</button>
          <button class="btn-sm-danger" onclick="startNewEvent()" style="margin-bottom:20px">🆕 Encerrar e começar evento novo</button>
          <hr class="divider">
          <div class="section-label">🏷️ Categorias da inscrição <span style="font-weight:400;color:var(--muted);font-size:11px">(texto de cada nível que aparece no formulário)</span></div>
            <div class="field-group">
              <label class="field-label">📝 Descrição de cada nível (aparece pequeno abaixo do nome do grupo)</label>
              <div style="display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;gap:8px;align-items:center">
                  <span style="font-size:16px;flex-shrink:0">🟢</span>
                  <input type="text" id="level-desc-Iniciante" placeholder="ex: Iniciante · 1km · 40 squats x2" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-size:13px;">
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <span style="font-size:16px;flex-shrink:0">🟡</span>
                  <input type="text" id="level-desc-Intermediário" placeholder="ex: Intermediário · 1,6km · 50 squats x2" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-size:13px;">
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <span style="font-size:16px;flex-shrink:0">🟠</span>
                  <input type="text" id="level-desc-Avançado" placeholder="ex: Avançado · 2,2km · 60 push up x2" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-size:13px;">
                </div>
              </div>
              <button class="btn btn-blue" style="margin-top:10px" onclick="saveLevelDescriptions()">💾 Salvar Descrições dos Níveis</button>
            </div>
          <hr class="divider">
          <div class="section-label">📌 Regras do Evento <span style="font-weight:400;color:var(--muted);font-size:11px">(fixas — valem para todos os eventos, edite quando quiser)</span></div>
          <div class="field-group">
            <textarea id="ev-cfg-rules" rows="5" placeholder="ex: Chegar 15 min antes • Trazer garrafa d'água • Uso de tênis obrigatório" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:13px;resize:vertical"></textarea>
          </div>
          <button class="btn btn-blue" onclick="updateEventRules()" style="margin-bottom:20px">💾 Salvar Regras</button>
          <hr class="divider">
          <div class="section-label">🔗 Links do evento</div>
          <div class="field-group" style="background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:20px">
            <label class="field-label">✏️ Lançar resultados (equipe, pede a senha da equipe)</label>
            <input type="text" id="ev-launch-link" readonly onclick="this.select()" style="margin-bottom:8px;font-size:12px">
            <div style="display:flex;gap:8px;margin-bottom:14px">
              <button class="btn-sm" style="flex:1;padding:10px" onclick="copyLinkOf('ev-launch-link')">📋 Copiar link</button>
              <button class="btn-sm" style="flex:1;padding:10px" onclick="window.open(document.getElementById('ev-launch-link').value,'_blank')">✏️ Abrir</button>
            </div>
            <label class="field-label">📺 Link da TV (só resultados, letras grandes)</label>
            <input type="text" id="tv-link-input" readonly onclick="this.select()" style="margin-bottom:8px;font-size:12px">
            <div style="display:flex;gap:8px">
              <button class="btn-sm" style="flex:1;padding:10px" onclick="copyTvLink()">📋 Copiar link</button>
              <button class="btn-sm" style="flex:1;padding:10px" onclick="openTvLink()">📺 Abrir</button>
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:10px;line-height:1.4">A senha da equipe (a mesma da Meta) é definida na aba <b>Config</b>. A TV atualiza sozinha a cada 15 s, em ordem alfabética e sem medalhas. Para classificar por tempo (com medalhas), acrescente <b>&amp;ordem=tempo</b> no fim do link.</div>
          </div>
          <div class="section-label">📋 Inscritos (<span id="ev-count">0</span>)</div>
          <button class="btn btn-blue" onclick="printEventReport()" style="margin-bottom:14px">🖨️ Gerar relatório para impressão</button>
          <div id="event-registrations-list"></div>
          <hr class="divider">
          <div class="section-label">🚫 Faltantes de eventos anteriores <span style="font-weight:400;color:var(--muted);font-size:11px">(só você vê essa lista)</span></div>
          <div id="event-noshow-list"></div>
        </div>

        <!-- EVENTOS ENCERRADOS (editar resultados arquivados) -->
        <div class="adm-panel" id="tab-arquivados">
          <div class="section-label">📁 Eventos Encerrados</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.5">
            Mesmo depois de encerrado, você pode editar, corrigir ou inserir resultados que ficaram faltando. As alterações aparecem na hora pra quem já tem o link salvo.
          </div>
          <div id="archived-events-list"></div>
        </div>

        <!-- ASSINANTE -->
        <div class="adm-panel" id="tab-subscribers">
          <div class="section-label">🔑 Gerar Código de Acesso</div>
          <div class="field-group">
            <label class="field-label">Rótulo (opcional, ex: nome da aluna)</label>
            <input type="text" id="code-label" placeholder="ex: Turma Julho/2026">
          </div>
          <button class="btn btn-gold" onclick="generateCode()" style="margin-bottom:20px">🎲 Gerar novo código</button>
          <div id="codes-admin-list"></div>
          <hr class="divider">
          <div class="section-label">✍️ Mensagem: Como virar assinante</div>
          <div class="field-group">
            <label class="field-label">Título</label>
            <input type="text" id="subinfo-title" placeholder="ex: 💛 Quer virar assinante?">
          </div>
          <div class="field-group">
            <label class="field-label">Texto</label>
            <input type="text" id="subinfo-body" placeholder="ex: Fale com a Cantil pelo WhatsApp pra liberar seu código">
          </div>
          <button class="btn btn-blue" onclick="updateSubInfo()" style="margin-bottom:20px">💾 Atualizar mensagem</button>
          <hr class="divider">
          <div class="section-label">🔒 Adicionar Vídeo Exclusivo</div>
          <div class="field-group">
            <label class="field-label">Título</label>
            <input type="text" id="sv-title" placeholder="ex: Treino completo — Assinantes">
          </div>
          <div class="field-group">
            <label class="field-label">Link do YouTube</label>
            <input type="text" id="sv-url" placeholder="Cole o link do vídeo (normal ou Short)">
          </div>
          <div class="field-group">
            <label class="field-label">Descrição (gera interesse)</label>
            <input type="text" id="sv-desc" placeholder="ex: O treino secreto que só assinante vê...">
          </div>
          <button class="btn btn-blue" onclick="addSubscriberVideo()" style="margin-bottom:20px">✅ Gerar link de Short</button>
          <hr class="divider">
          <div class="section-label">Vídeos exclusivos publicados</div>
          <div id="subscriber-videos-admin-list"></div>
        </div>

        <!-- CONFIG -->
        <div class="adm-panel" id="tab-settings">
          <div class="section-label">🔒 Senha da equipe</div>
          <div class="field-group"><label class="field-label">🔒 Senha de quem registra (libera só o registro, não o painel admin)</label>
            <input type="text" id="staff-pw-input" placeholder="digite para definir ou trocar" autocomplete="off" autocapitalize="off">
            <div id="staff-pw-state" style="font-size:12px;margin-top:6px"></div>
            <button class="btn btn-blue" style="margin-top:8px" onclick="saveStaffPw()">💾 Salvar senha</button>
            <button class="btn-sm-danger" style="width:100%;padding:10px;margin-top:8px" onclick="removeStaffPw()">Remover senha</button>
            <div style="font-size:11px;color:var(--muted);margin-top:8px;line-height:1.4">A mesma senha vale para os dois links abaixo: <b>Meta</b> e <b>Lançar resultados</b>.</div>
          </div>
          <div class="field-group" style="background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:20px">
            <label class="field-label">🎯 Link da Meta (equipe)</label>
            <input type="text" id="cfg-link-meta" readonly onclick="this.select()" style="margin-bottom:8px;font-size:12px">
            <button class="btn-sm" style="width:100%;padding:10px;margin-bottom:14px" onclick="copyLinkOf('cfg-link-meta')">📋 Copiar link da Meta</button>
            <label class="field-label">✏️ Link de Lançar resultados (equipe)</label>
            <input type="text" id="cfg-link-launch" readonly onclick="this.select()" style="margin-bottom:8px;font-size:12px">
            <button class="btn-sm" style="width:100%;padding:10px" onclick="copyLinkOf('cfg-link-launch')">📋 Copiar link de Resultados</button>
          </div>
          <hr class="divider">
          <div class="section-label">💬 WhatsApp de Dúvidas (Evento)</div>
          <div class="field-group">
            <label class="field-label">Número com DDD ou link do WhatsApp</label>
            <input type="text" id="whatsapp-number" placeholder="ex: 21999998888  ou  https://wa.me/5521999998888" autocapitalize="off" autocorrect="off" spellcheck="false">
          </div>
          <div class="field-group">
            <label class="field-label">Mensagem padrão (opcional)</label>
            <input type="text" id="whatsapp-msg" placeholder="ex: Olá! Tenho uma dúvida sobre o evento">
          </div>
          <button class="btn btn-blue" onclick="saveWhatsappConfig()" style="margin-bottom:20px">💾 Salvar WhatsApp</button>
          <hr class="divider">
          <div class="section-label">🔥 Editar Banner de Desafios</div>
          <div class="field-group">
            <label class="field-label">Título</label>
            <input type="text" id="ch-title" placeholder="ex: 🔥 DESAFIOS ABERTOS">
          </div>
          <div class="field-group">
            <label class="field-label">Texto principal</label>
            <input type="text" id="ch-body" placeholder="ex: Desafio 8 — Squats | Desafio 11 — Corda 1'">
          </div>
          <div class="field-group">
            <label class="field-label">Texto pequeno (abaixo)</label>
            <input type="text" id="ch-sub" placeholder="ex: Participe e acumule pontos!">
          </div>
          <button class="btn btn-gold" onclick="updateChallenge()" style="margin-bottom:8px">🔥 Atualizar Banner</button>
          <button class="btn-sm-danger" onclick="hideChallenge()" style="margin-bottom:20px">👁️ Ocultar banner</button>
          <hr class="divider">
          <div class="section-label">📅 Última Atualização (manual)</div>
          <div class="field-group">
            <label class="field-label">Texto a exibir</label>
            <input type="text" id="manual-date" placeholder="ex: Segunda-feira, 15/06/2026 · 19:20">
          </div>
          <button class="btn btn-blue" onclick="setManualDate()" style="margin-bottom:20px">📌 Atualizar Data</button>
          <hr class="divider">
          <div class="section-label">Alterar Senha Admin</div>
          <div class="field-group">
            <label class="field-label">Nova Senha</label>
            <input type="text" id="new-pass" placeholder="Mínimo 4 caracteres">
          </div>
          <button class="btn btn-blue" onclick="changePass()" style="margin-bottom:20px">💾 Salvar</button>
          <hr class="divider">
          <div class="section-label" style="color:var(--red)">Zona de Perigo</div>
          <button class="btn-sm-danger" onclick="resetPts()">🔄 Zerar todos os pontos</button>
        </div>
      </div>

    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
// ══════════════════════════════════════════════
//  SUPABASE CONNECTION
// ══════════════════════════════════════════════
// ⚠️ Requer 3 tabelas novas no Supabase: challenge_videos, subscriber_videos, access_codes
// Rode o arquivo supabase-setup.sql (fornecido junto) uma única vez no SQL Editor do Supabase.
const SUPABASE_URL = 'https://nuljckddhhajwjvtvkfx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KtIrookldRFSrxz5NJL0EQ_iBLow_I-';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Local-only settings (per-device, not synced) ──
const LK = { prev:'rk_prev', manualDate:'rk_manualDate', adminSession:'rk_admin_session' };
const lget = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const lset = (k,v) => localStorage.setItem(k, JSON.stringify(v));

let MEMBERS = [];
let HISTORY = [];
let currentFilter = 'all';

// ── CATEGORIA INFANTIL (6 a 14 anos) ──
// Calcula a idade atual a partir da data de nascimento (YYYY-MM-DD)
function calcAge(birthday) {
  if (!birthday) return null;
  const parts = birthday.split('-');
  if (parts.length !== 3) return null;
  const [by, bm, bd] = parts.map(Number);
  const today = new Date();
  let age = today.getFullYear() - by;
  const hasHadBirthdayThisYear = (today.getMonth()+1 > bm) || (today.getMonth()+1 === bm && today.getDate() >= bd);
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

// true se o membro tem entre 6 e 14 anos (inclusive) HOJE — assim que fizer 15, sai
// automaticamente da categoria infantil e passa a contar no ranking geral.
// REGRA: quem não tem data de nascimento cadastrada é considerado ADULTO por padrão
// (a maioria dos membros não vai ter essa data preenchida, então isso evita que
// todo mundo sem data caia sem querer na categoria infantil).
function isKidsCategory(member) {
  if (!member.birthday) return false; // sem data cadastrada = adulto, nunca infantil
  const age = calcAge(member.birthday);
  if (age === null) return false;
  return age >= 6 && age <= 14;
}
let CHALLENGE_VIDEOS = [];
let SUBSCRIBER_VIDEOS = [];
let ACCESS_CODES = [];
let challengesLoaded = false;
const SK = { subUnlocked:'rk_sub_unlocked' };

// ── Configurações persistentes no Supabase (senha, banner, mensagem assinante) ──
async function getSetting(key, fallback) {
  const { data, error } = await sb.from('app_settings').select('value').eq('key', key).order('updated_at', { ascending:false }).limit(1);
  if (error || !data || !data.length) return fallback;
  try { return JSON.parse(data[0].value); } catch { return data[0].value; }
}
async function setSetting(key, value) {
  const strVal = typeof value === 'string' ? value : JSON.stringify(value);
  // onConflict explícito garante que sempre ATUALIZA a linha existente da chave,
  // em vez de criar linhas duplicadas (o que fazia leituras antigas voltarem
  // depois de salvar, como acontecia com as Regras do Evento)
  const { error } = await sb.from('app_settings').upsert({ key, value: strVal, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) { console.error(error); toast('⚠️ Erro ao salvar configuração'); return false; }
  return true;
}

// ── YOUTUBE HELPERS ──
// Transforma URLs em texto plano em hiperlinks clicáveis (abre em nova aba)
function linkify(text) {
  if (!text) return '';
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const urlPattern = /((https?:\/\/|www\.)[^\s<]+)/gi;
  return escaped.replace(urlPattern, (match) => {
    const href = match.startsWith('http') ? match : 'https://' + match;
    return `<a href="${href}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;word-break:break-all;">${match}</a>`;
  });
}

// ── WHATSAPP ──
async function renderWhatsappButton() {
  const raw = String((await getSetting('whatsapp_number', '')) ?? '').trim();
  const msg = String((await getSetting('whatsapp_msg', '')) ?? '').trim();
  const btn = document.getElementById('whatsapp-btn');
  if (!btn) return;
  if (!raw) { btn.classList.remove('show'); btn.style.display='none'; return; }

  let href;
  if (/^(https?:\/\/|wa\.me\/|chat\.whatsapp\.com\/|api\.whatsapp\.com\/|whats\.app\/)/i.test(raw)) {
    // Link colado direto (conversa, grupo, comunidade, wa.me...)
    href = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    // em link de conversa (wa.me / api.whatsapp), acrescenta a mensagem padrão se o link ainda não tiver uma
    if (msg && /^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href) && !/[?&]text=/.test(href))
      href += (href.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(msg);
  } else {
    // Número: só dígitos; se vier só DDD + número (10 ou 11 dígitos), coloca o 55 do Brasil
    let digits = raw.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) digits = '55' + digits;
    href = `https://wa.me/${digits}?text=${encodeURIComponent(msg || 'Olá! Tenho uma dúvida sobre o evento.')}`;
  }
  btn.href = href;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.classList.add('show');
  btn.style.display = 'flex';
}

async function saveWhatsappConfig() {
  const number = document.getElementById('whatsapp-number').value.trim();
  const msg = document.getElementById('whatsapp-msg').value.trim();
  await setSetting('whatsapp_number', number);
  await setSetting('whatsapp_msg', msg);
  await renderWhatsappButton();
  toast('✅ WhatsApp configurado!');
}

async function loadWhatsappConfigIntoForm() {
  const number = await getSetting('whatsapp_number', '');
  const msg = await getSetting('whatsapp_msg', '');
  const numEl = document.getElementById('whatsapp-number');
  const msgEl = document.getElementById('whatsapp-msg');
  if (numEl) numEl.value = number;
  if (msgEl) msgEl.value = msg;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}
function buildShortUrl(id) { return `https://www.youtube.com/shorts/${id}`; }
function buildThumbUrl(id) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }
function genCode(len=6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

// ── DATA LAYER ──
async function loadMembers() {
  const { data, error } = await sb.from('members').select('*').order('points', { ascending:false });
  if (error) { console.error(error); toast('⚠️ Erro ao carregar dados'); return []; }
  MEMBERS = data || [];

  // Fetch last activity date and category badges per member
  const { data: hist, error: histFetchError } = await sb.from('history')
    .select('member_id, points, created_at, reason, balance_after, category')
    .order('created_at', { ascending:false });

  if (histFetchError) {
    console.error('Erro ao buscar histórico para badges:', histFetchError);
    alert('ERRO ao buscar histórico (isso está impedindo o emoji de aparecer):\n\n' + histFetchError.message);
  }

  if (hist) {
    const lastActivity = {};
    const desafioCount = {};
    const eventoCount = {};
    const lastTag = {};
    const lastChange = {};
    const lastGain = {};
    hist.forEach(h => {
      if (h.points > 0 && !lastGain[h.member_id]) lastGain[h.member_id] = h.created_at;  // última vez que PONTUOU
      if (!lastActivity[h.member_id]) {
        lastActivity[h.member_id] = h.created_at;
      }
      if (!lastChange[h.member_id]) {
        lastChange[h.member_id] = {
          date: h.created_at,
          prevPts: h.balance_after != null ? h.balance_after - h.points : null
        };
      }
      if (h.category === 'desafio') {
        desafioCount[h.member_id] = (desafioCount[h.member_id] || 0) + 1;
      }
      if (h.category === 'evento') {
        eventoCount[h.member_id] = (eventoCount[h.member_id] || 0) + 1;
      }
      if ((h.category === 'desafio' || h.category === 'evento') && !lastTag[h.member_id]) {
        lastTag[h.member_id] = { reason: h.reason, category: h.category };
      }
    });
    MEMBERS = MEMBERS.map(m => ({
      ...m,
      lastActivity: lastActivity[m.id] || null,
      desafioCount: desafioCount[m.id] || 0,
      eventoCount: eventoCount[m.id] || 0,
      lastTag: lastTag[m.id] || null,
      lastChange: lastChange[m.id] || null,
      lastGain: lastGain[m.id] || null
    }));
  }
  return MEMBERS;
}

async function loadHistory() {
  const { data, error } = await sb.from('history').select('*').order('created_at', { ascending:false }).limit(60);
  if (error) { console.error(error); return []; }
  HISTORY = data || [];
  return HISTORY;
}

async function loadChallengeVideos() {
  const { data, error } = await sb.from('challenge_videos').select('*').order('created_at', { ascending:false });
  if (error) { console.error(error); toast('⚠️ Erro ao carregar desafios'); return []; }
  CHALLENGE_VIDEOS = data || [];
  challengesLoaded = true;
  return CHALLENGE_VIDEOS;
}

async function loadSubscriberVideos() {
  const { data, error } = await sb.from('subscriber_videos').select('*').order('created_at', { ascending:false });
  if (error) { console.error(error); toast('⚠️ Erro ao carregar vídeos exclusivos'); return []; }
  SUBSCRIBER_VIDEOS = data || [];
  return SUBSCRIBER_VIDEOS;
}

async function loadAccessCodes() {
  const { data, error } = await sb.from('access_codes').select('*').order('created_at', { ascending:false });
  if (error) { console.error(error); toast('⚠️ Erro ao carregar códigos'); return []; }
  ACCESS_CODES = data || [];
  return ACCESS_CODES;
}

async function addPointsToMember(id, pts, reason, category='treino') {
  const member = MEMBERS.find(m=>m.id===id);
  if (!member) return;
  const newPts = Math.max(0, member.points + pts);
  const now_iso = new Date().toISOString();
  const updateData = { points: newPts };
  if (pts !== 0) updateData.last_updated = now_iso;  // update date on any change, add or remove
  const { error } = await sb.from('members').update(updateData).eq('id', id);
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }
  if (pts !== 0) {
    const { error: histError } = await sb.from('history').insert({ member_id:id, member_name:member.name, points:pts, reason: reason||'Sem motivo', balance_after: newPts, category });
    if (histError) {
      console.error('Erro ao salvar histórico:', histError);
      alert('ERRO ao salvar histórico (isso está impedindo o emoji de aparecer):\n\n' + histError.message);
    }
  }
  member.points = newPts;
  const now = new Date();
  const days = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  lset('rk_lastUpdate', { date: now.toLocaleDateString('pt-BR'), time: now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), member: member.name, pts, dayName: days[now.getDay()] });
  return member;
}

// ══════════════════════════════════════════════
//  RENDER PUBLIC RANKING
// ══════════════════════════════════════════════
// 👻 Fantasma = mais de GHOST_DAYS dias sem ganhar pontos
const GHOST_DAYS = 60;
function ghostDays(m) {
  const ref = m.lastGain || m.last_updated || m.created_at;
  if (!ref) return null;
  const d = Math.floor((Date.now() - new Date(ref).getTime()) / 86400000);
  return isNaN(d) ? null : d;
}
function isGhost(m) { const d = ghostDays(m); return d !== null && d > GHOST_DAYS; }

function renderRanking() {
  const all = MEMBERS.slice().sort((a,b)=>b.points-a.points);
  // Membros de 6 a 14 anos (categoria infantil) NÃO entram no ranking geral,
  // feminino ou masculino — só aparecem quando a aba "Infantil" está selecionada.
  // Ao completar 15 anos, calcAge() já reflete a nova idade automaticamente e
  // o membro passa a contar no ranking geral na próxima renderização.
  let members;
  if (currentFilter === 'kids') {
    members = all.filter(m => isKidsCategory(m));
  } else {
    const nonKids = all.filter(m => !isKidsCategory(m));
    members = currentFilter === 'all' ? nonKids : nonKids.filter(m=>m.gender===currentFilter);
  }
  // 👻 Quem está há mais de 60 dias sem pontuar vai para o fim da lista (fora do pódio e da numeração)
  const activeMembers = members.filter(m => !isGhost(m));
  const ghostMembers  = members.filter(m => isGhost(m));
  const max = activeMembers[0]?.points || members[0]?.points || 1;

  const ranked = [];
  let pos = 1;
  for (let i = 0; i < activeMembers.length; i++) {
    if (i > 0 && activeMembers[i].points < activeMembers[i-1].points) pos++;
    ranked.push({ ...activeMembers[i], pos });
  }
  ghostMembers.forEach(m => ranked.push({ ...m, pos: null, ghost: true }));

  const podiumWrap = document.getElementById('podium-wrap');
  const podiumEl = document.getElementById('podium');
  const topPositions = [...new Set(ranked.filter(m=>!m.ghost).map(m=>m.pos))].slice(0,3);
  const podiumMembers = ranked.filter(m=>topPositions.includes(m.pos)).slice(0,3);

  if (!podiumMembers.length) { podiumWrap.style.display='none'; }
  else {
    podiumWrap.style.display='';
    const visual = [podiumMembers[1], podiumMembers[0], podiumMembers[2]].filter(Boolean);
    const clsMap = { 1:'podium-1', 2:'podium-2', 3:'podium-3' };
    podiumEl.innerHTML = visual.map(m => `
      <div class="podium-slot ${clsMap[m.pos]||'podium-3'}">
        ${m.pos===1?'<div class="crown">👑</div>':''}
        <div class="podium-card">
          <div class="podium-pos">${m.pos}º</div>
          <div class="podium-name">${m.name}</div>
          <div class="podium-pts">${m.points}</div>
        </div>
      </div>`).join('');
  }

  const listEl = document.getElementById('ranking-list');
  if (!members.length) {
    listEl.innerHTML='<div class="empty-state">🌱 Nenhum membro ainda.</div>';
    return;
  }

  listEl.innerHTML = ranked.map((m,i) => {
    const pos = m.pos;
    const pct = Math.min(100, Math.round((m.points/max)*100));
    const prev = lget(LK.prev)||{};
    const prevPts = prev[m.id];
    let trend = '';
    if (prevPts !== undefined) {
      if (m.points > prevPts) trend = '<span style="color:#3de89a;font-size:16px;font-weight:900" title="Subindo">▲</span>';
      else if (m.points < prevPts) trend = '<span style="color:#ff5f6d;font-size:16px;font-weight:900" title="Descendo">▼</span>';
      else trend = '<span style="color:#5a6380;font-size:16px" title="Estacionado">●</span>';
    }

    // Emojis de categoria — 🔥 desafio, ⭐ evento (contagem explícita, escolhida no lançamento)
    let categoryBadges = '';
    if (m.desafioCount > 0) {
      categoryBadges += `<span title="${m.desafioCount} desafio(s)">🔥${m.desafioCount>1?'×'+m.desafioCount:''}</span>`;
    }
    if (m.eventoCount > 0) {
      categoryBadges += `<span title="${m.eventoCount} evento(s)" style="margin-left:3px">⭐${m.eventoCount>1?'×'+m.eventoCount:''}</span>`;
    }

    // Tag visível com a descrição do último desafio/evento (ex: "EVENTO CANTIL")
    let challengeTag = '';
    if (m.lastTag && m.lastTag.reason) {
      const tagIcon = m.lastTag.category === 'evento' ? '⭐' : '🔥';
      challengeTag = `<div class="challenge-tag" title="Último registro">${tagIcon} ${m.lastTag.reason}</div>`;
    }

    // Última alteração real (vinda do histórico, com pontuação anterior de verdade)
    let lastSeen = '';
    const lastDate = m.last_updated || m.lastActivity;
    if (lastDate) {
      const d = new Date(lastDate);
      const dateStr = d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'2-digit'});
      const timeStr = d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
      const prevText = (m.lastChange && m.lastChange.prevPts != null) ? ` · antes: ${m.lastChange.prevPts} pts` : '';
      lastSeen = `<div class="rank-last-seen">🕐 última alteração: ${dateStr} às ${timeStr}${prevText}</div>`;
    }

    const ghostDivider = (m.ghost && !ranked[i-1]?.ghost)
      ? `<div class="ghost-divider">👻 sem pontuar há mais de ${GHOST_DAYS} dias</div>` : '';
    return `${ghostDivider}
      <div class="rank-item${pos===1?' top-1':pos===2?' top-2':pos===3?' top-3':''}${m.ghost?' ghost':''}${isKidsCategory(m)?' kids-item':''}" style="animation-delay:${.05*i}s">
        <div class="rank-num">${m.ghost?'👻':pos+'º'}</div>
        <div class="rank-avatar">${m.emoji}</div>
        <div class="rank-info">
          <div class="rank-name"><span class="rank-name-text">${m.name}</span>${m.ghost?'':bdMini(m.id)} ${m.ghost?'':trend}${isKidsCategory(m)?'<span class="kids-badge">🧒 Infantil</span>':''}${categoryBadges ? ` <span class="category-badges">${categoryBadges}</span>` : ''}</div>
          <div class="rank-badge-small">${m.points} pts${m.ghost?` · ${ghostDays(m)} dias sem pontuar`:''}</div>
          ${challengeTag}
          ${lastSeen}
        </div>
        <div class="rank-bar-wrap">
          <div class="rank-bar">
            <div class="rank-bar-fill" style="width:0%" data-pct="${pct}"></div>
          </div>
        </div>
        <div>
          <div class="rank-pts">${m.points}</div>
          <div class="rank-pts-label">pontos</div>
        </div>
      </div>`;
  }).join('');

  setTimeout(()=>{
    document.querySelectorAll('.rank-bar-fill').forEach(el=>{
      el.style.width = el.dataset.pct+'%';
    });
  },120);

  const isRankingActive = document.getElementById('view-ranking')?.classList.contains('active');

  if (isRankingActive) {
    const now = new Date();
    document.getElementById('last-update').textContent =
      'Atualizado às '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const lu = lget('rk_lastUpdate');
    const manualDate = lget(LK.manualDate);
    const banner = document.getElementById('last-launch-banner');
    if (manualDate) {
      banner.style.display='inline-block';
      banner.innerHTML='📋 Última atualização &nbsp;·&nbsp; <strong>'+manualDate+'</strong>';
    } else if (lu && banner) {
      banner.style.display='inline-block';
      banner.innerHTML='📋 Último lançamento &nbsp;·&nbsp; <strong>'+(lu.dayName ? lu.dayName+', ' : '')+lu.date+' &nbsp;·&nbsp; '+lu.time+'</strong>';
    }
    renderChallengeBanner();
    renderBirthdayBanner();
  }
}

function renderBirthdayBanner() {
  const wrap = document.getElementById('birthday-wrap');
  const today = new Date();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  const todaysBirthdays = MEMBERS.filter(m => {
    if (!m.birthday) return false;
    const parts = m.birthday.split('-'); // YYYY-MM-DD
    if (parts.length < 3) return false;
    return parts[1] === mm && parts[2] === dd;
  });
  if (!todaysBirthdays.length) {
    wrap.style.display = 'none';
    return;
  }
  const names = todaysBirthdays.map(m => `${m.emoji} ${m.name}`).join(' e ');
  const isPlural = todaysBirthdays.length > 1;
  document.getElementById('birthday-text').innerHTML =
    `🎂 Aniversário de ${names} hoje! Parabéns! 🎉`;
  wrap.style.display = '';
}

// ══════════════════════════════════════════════
//  MAIN TABS (Ranking / Desafios / Assinante)
// ══════════════════════════════════════════════
async function setMainTab(tab) {
  document.querySelectorAll('.main-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById('mt-'+tab).classList.add('active');
  document.querySelectorAll('.view-section').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+tab).classList.add('active');

  // Cabeçalho (Ranking/Atualizado/Último lançamento), banner de aniversário e
  // banner de desafios só aparecem na aba Ranking — somem nas demais abas
  const challengeWrap = document.getElementById('challenge-wrap');
  const rankingHeader = document.getElementById('ranking-header');
  const birthdayWrap = document.getElementById('birthday-wrap');
  if (tab === 'ranking') {
    if (rankingHeader) rankingHeader.style.display = '';
    await renderChallengeBanner();
    renderBirthdayBanner();
  } else {
    if (challengeWrap) challengeWrap.style.display = 'none';
    if (rankingHeader) rankingHeader.style.display = 'none';
    if (birthdayWrap) birthdayWrap.style.display = 'none';
  }

  if (tab==='desafios') {
    if (!challengesLoaded) await loadChallengeVideos();
    renderDesafiosView();
  }
  if (tab==='evento') {
    await renderEventPublicView();
  }
  if (tab==='assinante') {
    renderSubInfoBox();
    await loadSubscriberVideos();
    const mode = await getSubscriberAccessMode();
    renderVideoGrid('assinante-grid', SUBSCRIBER_VIDEOS, 'Nenhum vídeo exclusivo publicado ainda.', mode);
  }
}

// Revalida o código salvo no aparelho contra o banco: se foi excluído/desativado, revoga o acesso local
async function getSubscriberAccessMode() {
  const savedCode = lget(SK.subUnlocked);
  if (!savedCode) return 'gated';
  const { data, error } = await sb.from('access_codes').select('*').eq('code', savedCode).eq('active', true).limit(1);
  if (error || !data || !data.length) {
    localStorage.removeItem(SK.subUnlocked);
    return 'gated';
  }
  return 'open';
}

// mode: 'open' = clique abre o vídeo direto | 'gated' = clique pede código antes
function renderVideoGrid(elId, videos, emptyMsg, mode) {
  const el = document.getElementById(elId);
  if (!videos.length) { el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:32px 0">${emptyMsg}</div>`; return; }
  el.innerHTML = videos.map((v,i) => `
    <div class="video-card ${mode==='gated' ? 'locked' : ''}" ${mode==='open' ? `onclick="window.open('${v.youtube_url}','_blank')"` : `onclick="openCodeOverlay('${elId}',${i})"`}>
      <div class="video-thumb-wrap">
        <img src="${buildThumbUrl(v.video_id)}" alt="${v.title}" loading="lazy">
        <div class="video-play"></div>
      </div>
      <div class="video-title">${v.title}</div>
      ${v.description ? `<div class="video-desc">${v.description}</div>` : ''}
    </div>`).join('');
}

// Desafios: separa "Abertos" (destaque, card grande) de "Mini" (lista compacta)
// ── 🏁 META COLETIVA (tabela relay_entries + config em app_settings "relay_challenge"; grupos opcionais) ──
let MT_CFG = null, MT_ENTRIES = [], MT_ERR = '', MT_LOGO = '', mtTick = null, mtPoll = null, mtBlob = null, MTA_GROUPS = [];
const mtKm = v => Number((+v||0).toFixed(2)).toLocaleString('pt-BR');
const mtDur = ms => { const t = Math.max(0, Math.floor(ms/1000)), h = Math.floor(t/3600), m = Math.floor(t%3600/60), sc = t%60; return h ? `${h}h${String(m).padStart(2,'0')}` : `${m}min${String(sc).padStart(2,'0')}s`; };
const mtClock = sec => { const h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), sc = sec%60; return (h ? h+':'+String(m).padStart(2,'0') : m) + ':' + String(sc).padStart(2,'0'); };
const mtMulti = () => ((MT_CFG && MT_CFG.groups) || []).length > 0;
function mtGroups() { const gs = (MT_CFG && MT_CFG.groups) || []; return gs.length ? gs : [{ id:'', name:'', color:'#e8ff00', goal:+(MT_CFG && MT_CFG.goal) || 1, names:[] }]; }
const mtGroup = gid => mtGroups().find(x => x.id === (gid||'')) || mtGroups()[0];
async function mtLoadCfg() { const c = await getSetting('relay_challenge', null); MT_CFG = (c && typeof c === 'object') ? c : null; }
async function mtLoadEntries() {
  if (!MT_CFG) { MT_ENTRIES = []; return true; }
  let all = [], from = 0;
  for (;;) {
    const { data, error } = await sb.from('relay_entries').select('*').eq('challenge_id', MT_CFG.id).order('id', { ascending:true }).range(from, from+999);
    if (error) { MT_ERR = error.message || 'erro'; return false; }
    all = all.concat(data||[]); if (!data || data.length < 1000) break; from += 1000;
  }
  MT_ENTRIES = all; MT_ERR = ''; return true;
}
function mtAgg(gid) {
  const g = {}, goal = mtGroup(gid).goal; let total = 0, cross = null;
  MT_ENTRIES.filter(e => (e.grp||'') === (gid||'')).forEach(e => { const km = +e.km, k = listaNorm(e.name), p = g[k] || (g[k] = { name:e.name, km:0, sec:0, kmT:0, n:0 });
    p.km += km; p.n++; if (e.seconds) { p.sec += e.seconds; p.kmT += km; }
    total += km; if (cross === null && total >= goal) cross = e.created_at; });
  return { list:Object.values(g).sort((a,b) => b.km - a.km), total, cross, n:MT_ENTRIES.filter(e => (e.grp||'') === (gid||'')).length };
}
function mtPace(p) { if (!p.kmT || !p.sec) return '—'; const s = p.sec/p.kmT; return `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}/km`; }
function mtTimes(gid) {
  const a = mtAgg(gid), es = MT_ENTRIES.filter(e => (e.grp||'') === (gid||''));
  const t0 = MT_CFG.startedAt ? new Date(MT_CFG.startedAt).getTime() : (MT_ENTRIES.length ? new Date(MT_ENTRIES[0].created_at).getTime() : null);
  const done = a.cross ? new Date(a.cross).getTime() : null, last = es.length ? new Date(es[es.length-1].created_at).getTime() : null;
  return { a, t0, done, end: done || (MT_CFG.closed ? last : null) };
}
function mtMine(name, gid) {
  const k = listaNorm(name); if (!k) return null; let km = 0, n = 0;
  MT_ENTRIES.forEach(e => { if (listaNorm(e.name) === k && (gid === undefined || (e.grp||'') === gid)) { km += +e.km; n++; } });
  return n ? { km, n } : null;
}
function mtRows(a, g) {
  const c = (g && g.color) || 'var(--accent)', lap = mtUnit() === 'km' ? mtLapKm() : 0;
  const num = p => { const r = g && (g.roster||[]).find(x => listaNorm(x.name) === listaNorm(p.name)); return r ? `<span style="color:var(--muted);font-weight:600">#${r.n}</span> ` : ''; };
  return a.list.length ? a.list.map((p,i) => `<div class="mt-row">
    <div style="display:flex;justify-content:space-between;gap:8px"><b>${['🥇','🥈','🥉'][i] || (i+1)+'º'} ${num(p)}${listaEsc(p.name)}${mtValBadge(p.name)}</b><b style="color:${c}">${mtKm(p.km)} ${mtUnit()}</b></div>
    <div class="mt-mini"><div style="width:${Math.min(100, p.km/(a.total||1)*100).toFixed(1)}%;background:${c}"></div></div>
    <div style="font-size:11px;color:var(--muted)">${(p.km/(a.total||1)*100).toFixed(1).replace('.',',')}% do total do grupo · ${p.n} registro${p.n>1?'s':''}${lap ? ' · ≈ ' + Number((p.km/lap).toFixed(1)) + ' voltas' : ''}</div></div>`).join('')
    : '<div style="color:var(--muted);font-size:13px">Ninguém registrou ainda.</div>';
}
// destaque do "quanto falta"
const mtLeft = (done, rem, over, c) => `<div class="mt-left" style="border-color:${c};background:${c}1c">` + (done
  ? `<span>🎉 META SUPERADA</span><b style="color:${c}">+${mtKm(over)}<small> ${mtUnit()}</small></b><span>além da meta</span>`
  : `<span>FALTAM</span><b style="color:${c}">${mtKm(rem)}<small> ${mtUnit()}</small></b><span>para bater a meta</span>`) + '</div>';
const MT_IMG_ON = false;   // download de imagem SUSPENSO: o pessoal tira print do quadro. Troque para true para reativar.
const MT_FOOT = 'TIRE PRINT E POSTE NAS REDES SOCIAIS, MARQUE A CANTIL';
const mtShareBtn = (gid, c) => !MT_IMG_ON ? '' : `<button class="mt-share" style="background:linear-gradient(135deg,${c},${bdShade(c,.3)});color:${bdLum(c) > 140 ? '#0a0a0a' : '#fff'}" onclick="mtShowImage('${gid}')"><span>📲 BAIXAR IMAGEM PARA SEUS STORIES</span><small>Fundo transparente · letra branca ou preta · poste nas suas redes</small></button>`;
const mtStatCells = (persons, regs) => (persons > 0 ? `<div><b>${persons}</b><span>pessoas</span></div>` : '') + `<div><b>${regs}</b><span>registros</span></div>`;
const mtPersons = (a, g) => a.list.filter(p => listaNorm(p.name) !== listaNorm(g.name || '§')).length;
// — percursos desenhados em cada quadro: 6 modelos, com progresso ao vivo, marcos de km e bandeira de chegada —
const MT_ROUTES = { onda:'🌊 Ondulado', circuito:'🔁 Circuito (volta ao ponto de partida)', elevacao:'⛰️ Subidas e descidas', serpentina:'🛣️ Serpentina (estrada de serra)', pista:'🏟️ Pista de atletismo (voltas)', ruas:'🏙️ Ruas da cidade', none:'🚫 Sem percurso' };
let mtRid = 0;
const mtRInfo = (total, goal) => ({ total, goal, lapKm:parseFloat(String((MT_CFG && MT_CFG.lapKm) || '').replace(',', '.')) || 0 });
function mtStadium(off) {   // contorno de uma pista: duas retas e duas curvas (off = deslocamento da raia)
  const R = 17 + off, out = [], cx1 = 68, cx2 = 32, cy = 25;
  for (let x = 50; x <= cx1; x += 2) out.push([x, cy + R]);
  for (let i = 1; i < 28; i++) { const t = Math.PI/2 - i/28*Math.PI; out.push([cx1 + R*Math.cos(t), cy + R*Math.sin(t)]); }
  for (let x = cx1; x >= cx2; x -= 2) out.push([x, cy - R]);
  for (let i = 1; i < 28; i++) { const t = -Math.PI/2 - i/28*Math.PI; out.push([cx2 + R*Math.cos(t), cy + R*Math.sin(t)]); }
  for (let x = cx2; x <= 50; x += 2) out.push([x, cy + R]);
  return out;
}
function mtRoutePts(kind) {   // pontos do percurso numa caixa de 100 x 50
  const out = [];
  if (kind === 'circuito') {
    for (let i = 0; i <= 180; i++) { const t = -Math.PI/2 + i/180*2*Math.PI, r = 1 + .16*Math.sin(2*t + 1) + .09*Math.cos(3*t); out.push([50 + 41*r*Math.cos(t), 25 + 19.5*r*Math.sin(t)]); }
    return out;
  }
  if (kind === 'elevacao') {
    for (let i = 0; i <= 180; i++) { const x = i/180, sm = x*x*(3 - 2*x); out.push([x*100, 40 - 30*sm + 3.4*Math.sin(x*17) * (1 - .4*x)]); }
    return out;
  }
  if (kind === 'pista') return mtStadium(0);
  if (kind === 'serpentina') {
    const L = 6, rr = 3.8, x0 = 10, x1 = 90, y0 = 44, dy = 7.6;
    for (let i = 0; i < L; i++) {
      const y = y0 - i*dy, dir = i % 2 ? -1 : 1, xs = i === 0 ? x0 : (dir > 0 ? x0 + rr : x1 - rr), xe = i === L-1 ? (dir > 0 ? x1 : x0) : (dir > 0 ? x1 - rr : x0 + rr);
      for (let x = xs; dir > 0 ? x <= xe : x >= xe; x += dir*2) out.push([x, y]);
      if (i < L-1) { const cx = dir > 0 ? x1 - rr : x0 + rr, cy = y - dy/2; for (let k = 1; k <= 14; k++) { const t = k/14*Math.PI; out.push([cx + dir*rr*Math.sin(t), cy + rr*Math.cos(t)]); } }
    }
    return out;
  }
  if (kind === 'ruas') {
    const W = [[8,42],[8,26],[26,26],[26,42],[44,42],[44,18],[62,18],[62,34],[80,34],[80,10],[89,10]], r = 3; out.push(W[0]);
    for (let i = 1; i < W.length-1; i++) {
      const a = W[i-1], b = W[i], c = W[i+1], ua = Math.hypot(a[0]-b[0], a[1]-b[1]), uc = Math.hypot(c[0]-b[0], c[1]-b[1]);
      const p1 = [b[0] + (a[0]-b[0])/ua*r, b[1] + (a[1]-b[1])/ua*r], p2 = [b[0] + (c[0]-b[0])/uc*r, b[1] + (c[1]-b[1])/uc*r]; out.push(p1);
      for (let k = 1; k <= 8; k++) { const t = k/8, u = 1 - t; out.push([u*u*p1[0] + 2*u*t*b[0] + t*t*p2[0], u*u*p1[1] + 2*u*t*b[1] + t*t*p2[1]]); }
    }
    out.push(W[W.length-1]); return out;
  }
  const P = [[110,1110],[250,990],[190,830],[400,730],[560,850],[760,690],[900,790],[970,970],[820,1080],[930,1170]].map(([x, y]) => [(x-110)/860*100, (y-690)/480*50]);   // ondulado
  const mid = (a, b) => [(a[0]+b[0])/2, (a[1]+b[1])/2]; let cur = P[0]; out.push(P[0]);
  for (let i = 1; i < P.length-1; i++) { const c = P[i], e = mid(P[i], P[i+1]); for (let k = 1; k <= 14; k++) { const t = k/14, u = 1 - t; out.push([u*u*cur[0] + 2*u*t*c[0] + t*t*e[0], u*u*cur[1] + 2*u*t*c[1] + t*t*e[1]]); } cur = e; }
  out.push(P[P.length-1]); return out;
}
function mtRouteCum(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])); return cum; }
function mtRouteSplit(pts, pct) {   // trecho já percorrido (por distância) e posição atual
  const cum = mtRouteCum(pts), goal = cum[cum.length-1] * Math.min(100, Math.max(0, pct)) / 100; let k = 0; while (k < pts.length-1 && cum[k] < goal) k++;
  return { done:pts.slice(0, k + 1), head:pts[k] };
}
function mtRouteSVG(kind, pct, c, h, info) {
  if (!kind || kind === 'none' || !MT_ROUTES[kind]) return '';
  const id = 'rt' + (++mtRid), pts = mtRoutePts(kind), cum = mtRouteCum(pts), tot = cum[cum.length-1], P = Math.min(100, Math.max(0, pct)), ink = bdLum(c) > 140 ? '#0a0a0a' : '#ffffff';
  const poly = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const at = f => { const t = tot*f; let k = 1; while (k < cum.length-1 && cum[k] < t) k++; const a = pts[k-1], b = pts[k], d = (cum[k]-cum[k-1]) || 1, u = (t-cum[k-1])/d; return [a[0] + (b[0]-a[0])*u, a[1] + (b[1]-a[1])*u]; };
  let frac = P/100, cap = '', extra = '';
  if (kind === 'pista') {   // progresso = volta atual; no centro, o contador de voltas
    const laps = info && info.lapKm > 0 ? info.total/info.lapKm : null;
    if (laps !== null) { const d = Math.floor(laps); frac = P >= 100 && laps - d < .001 ? 1 : laps - d; cap = `<text x="50" y="26" text-anchor="middle" font-size="10" font-weight="800" fill="${c}">${d}</text><text x="50" y="32" text-anchor="middle" font-size="3.4" fill="#9a9a92">de ${Math.round(info.goal/info.lapKm)} voltas</text>`; }
    else cap = `<text x="50" y="28" text-anchor="middle" font-size="10" font-weight="800" fill="${c}">${Math.floor(P)}%</text>`;
    extra = [-3.4, 3.4, 6.8].map(o => `<polyline points="${poly(mtStadium(o).concat([mtStadium(o)[0]]))}" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width=".7"/>`).join('');
  }
  if (kind === 'ruas') {
    let g = ''; for (let k = 0; k < 10; k++) g += `<line x1="${8 + 9*k}" y1="2" x2="${8 + 9*k}" y2="48"/>`; for (let k = 0; k < 5; k++) g += `<line x1="0" y1="${10 + 8*k}" x2="100" y2="${10 + 8*k}"/>`;
    extra = `<g stroke="#fff" stroke-opacity=".07" stroke-width="1.5">${g}</g><rect x="28" y="28" width="14" height="12" rx="1.5" fill="#3de89a" fill-opacity=".07"/><rect x="64" y="20" width="14" height="12" rx="1.5" fill="#5b9dff" fill-opacity=".07"/>`;
  }
  const sp = mtRouteSplit(pts, frac*100), st = pts[0], fin = pts[pts.length-1], same = kind === 'circuito' || kind === 'pista', fl = same ? st : fin;
  if (kind === 'elevacao') extra = `<line x1="0" y1="46" x2="100" y2="46" stroke="#fff" stroke-opacity=".15" stroke-width=".5"/><polygon points="${poly(pts)} 100,46 0,46" fill="${c}" fill-opacity=".07"/><polygon points="${poly(sp.done)} ${sp.head[0].toFixed(1)},46 0,46" fill="${c}" fill-opacity=".22"/>`;
  let marks = '';
  if (info && info.goal > 0 && kind !== 'pista') {   // marcos de km ao longo do percurso
    const step = [1,2,5,10,20,25,50,100,200].find(s => info.goal/s <= 4) || 200;
    for (let km = step; km < info.goal; km += step) { const q = at(km/info.goal), on = P/100 >= km/info.goal;
      marks += kind === 'elevacao' ? `<line x1="${q[0].toFixed(1)}" y1="${(q[1]+1.5).toFixed(1)}" x2="${q[0].toFixed(1)}" y2="46" stroke="#fff" stroke-opacity=".18" stroke-dasharray="1 1.2" stroke-width=".5"/><text x="${q[0].toFixed(1)}" y="50" text-anchor="middle" font-size="3.2" fill="#9a9a92">${km}${mtUnit() === 'km' ? ' km' : ''}</text>`
        : `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="1.4" fill="${on ? c : '#0e0e0e'}" stroke="${on ? '#fff' : '#888'}" stroke-width=".55"/><text x="${q[0].toFixed(1)}" y="${(q[1]-2.8).toFixed(1)}" text-anchor="middle" font-size="3.1" font-weight="700" fill="#cfcfc8" stroke="#0e0e0e" stroke-width=".8" paint-order="stroke">${km}${mtUnit() === 'km' ? ' km' : ''}</text>`; }
  }
  const flag = `<g transform="translate(${(fl[0]+1).toFixed(1)} ${fl[1].toFixed(1)})"><line x1="0" y1="0" x2="0" y2="-9" stroke="#fff" stroke-width=".7"/>` + [0,1,2,3].map(i => [0,1].map(j => `<rect x="${(.35 + i*2.1).toFixed(2)}" y="${(-9 + j*2.1).toFixed(2)}" width="2.1" height="2.1" fill="${(i + j) % 2 ? '#111' : '#fff'}"/>`).join('')).join('') + '</g>';
  const hd = sp.head, by = hd[1] < 12 ? hd[1] + 8 : hd[1] - 8, bx = Math.min(93, Math.max(7, hd[0]));
  const bubble = kind === 'pista' ? '' : `<rect x="${(bx-6.5).toFixed(1)}" y="${(by-3.1).toFixed(1)}" width="13" height="6.2" rx="2.2" fill="${c}"/><text x="${bx.toFixed(1)}" y="${(by+1.4).toFixed(1)}" text-anchor="middle" font-size="3.9" font-weight="800" fill="${ink}">${Math.floor(P)}%</text>`;
  const bgp = `linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/20px 20px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/20px 20px,radial-gradient(120% 90% at 15% 0%,${c}22,transparent 62%),#0e0e0e`;
  return `<div style="margin-top:12px;border-radius:14px;overflow:hidden;border:1px solid ${c}33;background:${bgp}"><svg viewBox="-6 -9 112 66" style="width:100%;height:${h || 150}px;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="${id}g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
${extra}${cap}
<polyline points="${poly(pts)}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>
<polyline points="${poly(pts)}" fill="none" stroke="${c}" stroke-opacity=".3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<polyline points="${poly(sp.done)}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}g)"/>
${marks}<circle cx="${st[0].toFixed(1)}" cy="${st[1].toFixed(1)}" r="2.3" fill="#0e0e0e" stroke="#fff" stroke-width="1"/>${flag}
<circle cx="${hd[0].toFixed(1)}" cy="${hd[1].toFixed(1)}" r="3" fill="${c}" opacity=".4"><animate attributeName="r" values="3;7.5;3" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".45;0;.45" dur="1.8s" repeatCount="indefinite"/></circle>
<circle cx="${hd[0].toFixed(1)}" cy="${hd[1].toFixed(1)}" r="3.1" fill="${c}" stroke="#fff" stroke-width="1.2"/>${bubble}</svg></div>`;
}
// — metas extras: tipo (km ou rounds), time cap crescente/decrescente e relatório final por equipe —
let MT_CAP_SEEN = false, MT_REG = '', MT_OPEN_REG = false;
function mtUnit() { return MT_CFG && MT_CFG.unit === 'rounds' ? 'rounds' : 'km'; }
const mtCapSec = () => (MT_CFG && +MT_CFG.capSec > 0) ? +MT_CFG.capSec : 0;
function mtCapReached() { const cs = mtCapSec(); return !!(cs && MT_CFG.startedAt && Date.now() - new Date(MT_CFG.startedAt).getTime() >= cs*1000); }
const mtEffClosed = () => !!MT_CFG && (!!MT_CFG.closed || mtCapReached());
const mtEnded = () => mtEffClosed() && !!MT_CFG.startedAt;
function mtParseTime(t) {   // "45", "45:00" ou "1:30:00" → segundos
  const p = String(t || '').trim().split(':').map(Number); if (!p[0] && p.length === 1 || p.some(isNaN)) return 0;
  return p.length === 3 ? p[0]*3600 + p[1]*60 + p[2] : p.length === 2 ? p[0]*60 + p[1] : p[0]*60;
}
function mtEndMs() {   // momento do fim da prova (para o relatório)
  if (!MT_CFG || !MT_CFG.startedAt) return null;
  const t0 = new Date(MT_CFG.startedAt).getTime(), cs = mtCapSec()*1000;
  if (MT_CFG.endedAt) return Math.min(new Date(MT_CFG.endedAt).getTime(), cs ? t0 + cs : Infinity);
  if (cs && Date.now() >= t0 + cs) return t0 + cs;
  return MT_ENTRIES.length ? new Date(MT_ENTRIES[MT_ENTRIES.length-1].created_at).getTime() : Date.now();
}
function mtRenderClock() {
  const el = document.getElementById('meta-clock'), cs = mtCapSec();
  if (!mtCapReached()) MT_CAP_SEEN = false;
  if (!MT_CFG || !cs) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const mode = MT_CFG.capMode === 'up' ? 'up' : 'down', ms = mtRaceMs(), over = ms !== null && ms >= cs*1000, ended = mtEffClosed(); let big, sub, col = 'var(--accent)';
  if (ms === null) { big = mtClock(cs); sub = '⏱ TIME CAP · AGUARDANDO LARGADA'; }
  else { const sec = Math.floor(ms/1000); big = mode === 'down' ? mtClock(Math.max(0, cs - sec)) : mtClock(Math.min(sec, cs));
    sub = over ? '⏰ TEMPO ESGOTADO' : ended ? '⏹ PROVA ENCERRADA' : mode === 'down' ? 'RESTAM · TIME CAP ' + mtClock(cs) : 'TEMPO DE PROVA · LIMITE ' + mtClock(cs);
    if (mode === 'down' && !ended && cs - sec <= 60) col = 'var(--red)'; if (over) col = 'var(--red)'; }
  el.innerHTML = `<div style="font-size:11px;letter-spacing:2px;color:var(--muted);font-weight:800">${sub}</div><div style="font-family:'Bebas Neue',sans-serif;font-size:76px;line-height:1.05;color:${col}">${big}</div>`;
}
// — relatório final: quanto cada equipe fez —
const mtTeamStats = () => mtGroups().map(g => { const a = mtAgg(g.id); return { g, a, pers:mtPersons(a, g), pct:g.goal > 0 ? a.total/g.goal*100 : 0 }; });
function mtFinalData() {
  const hm = t => t ? new Date(t).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : '—', ms = mtRaceMs();
  return { unit:mtUnit(), st:mtTeamStats().sort((x, y) => y.pct - x.pct || y.a.total - x.a.total), title:(MT_CFG.title || 'Desafio').replace(/\s+/g, ' ').trim(),
    when:`Largada ${hm(MT_CFG.startedAt && new Date(MT_CFG.startedAt).getTime())} · Fim ${hm(mtEndMs())} · Duração ${ms !== null ? mtDur(ms) : '—'}` + (mtCapSec() ? ` · Time cap ${mtClock(mtCapSec())}` : '') };
}
function mtRenderFinal() {
  const el = document.getElementById('meta-final');
  if (!MT_CFG || !mtEnded()) { el.style.display = 'none'; return; }
  const d = mtFinalData();
  el.style.display = 'block';
  el.innerHTML = `<div style="font-weight:800;font-size:18px">📄 RELATÓRIO FINAL</div><div style="font-size:12px;color:var(--muted);margin:4px 0 12px">${d.when}</div>` + d.st.map((t, i) => `<div class="mt-row">
    <div style="display:flex;justify-content:space-between;gap:8px"><b>${['🥇','🥈','🥉'][i] || (i+1)+'º'} <span style="color:${t.g.color}">${listaEsc(t.g.name || 'Total')}</span></b><b>${mtKm(t.a.total)} / ${mtKm(t.g.goal)} ${d.unit}</b></div>
    <div class="mt-mini"><div style="width:${Math.min(100, t.pct).toFixed(1)}%;background:${t.g.color}"></div></div>
    <div style="font-size:11px;color:var(--muted)">${Math.floor(t.pct)}% da meta${t.pct >= 100 ? ' · 🎉 superada' : ''}${t.pers ? ' · ' + t.pers + ' pessoa' + (t.pers === 1 ? '' : 's') : ''} · ${t.a.n} registro${t.a.n === 1 ? '' : 's'}</div></div>`).join('')
    + `<div style="display:flex;gap:8px;margin-top:12px"><button class="btn-sm-danger" style="flex:1;padding:12px" onclick="mtPrintFinal()">🖨️ Imprimir / PDF</button><button class="btn-sm-danger" style="flex:1;padding:12px" onclick="mtCopyFinal()">📋 Copiar resumo</button></div>`;
}
function mtFinalText() {
  const d = mtFinalData();
  return `🏁 ${d.title.toUpperCase()} — ${mtEnded() ? 'RELATÓRIO FINAL' : 'RELATÓRIO PARCIAL'}\n${d.when}\n\n` + d.st.map((t, i) => `${['🥇','🥈','🥉'][i] || (i+1)+'º'} ${t.g.name || 'Total'} — ${mtKm(t.a.total)} / ${mtKm(t.g.goal)} ${d.unit} (${Math.floor(t.pct)}%)${t.pers ? ' · ' + t.pers + ' pessoas' : ''}`).join('\n');
}
function mtCopyFinal() {
  const t = mtFinalText(), done = () => toast('📋 Resumo copiado!');
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, () => toast('⚠️ Não foi possível copiar')); else { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); done(); }
}
function mtPrintFinal() {
  if (!MT_CFG) return; const d = mtFinalData(), e = listaEsc;
  const rank = d.st.map((t, i) => `<tr><td>${i+1}º</td><td>${e(t.g.name || 'Total')}</td><td>${mtKm(t.a.total)} ${d.unit}</td><td>${mtKm(t.g.goal)} ${d.unit}</td><td>${Math.floor(t.pct)}%</td><td>${t.pers}</td><td>${t.a.n}</td></tr>`).join('');
  const teams = d.st.map(t => `<h2 style="border-left:6px solid ${t.g.color};padding-left:8px">${e(t.g.name || 'Total')} — ${mtKm(t.a.total)} / ${mtKm(t.g.goal)} ${d.unit}</h2><table><thead><tr><th>Nº</th><th>Atleta</th><th>Total (${d.unit})</th><th>Registros</th><th>% da equipe</th><th>Strava</th></tr></thead><tbody>` +
    (t.a.list.map(p => { const r = (t.g.roster || []).find(x => listaNorm(x.name) === listaNorm(p.name)); return `<tr><td>${r ? r.n : '—'}</td><td>${e(p.name)}</td><td>${mtKm(p.km)}</td><td>${p.n}</td><td>${(p.km/(t.a.total||1)*100).toFixed(1).replace('.', ',')}%</td><td>${(() => { const v = mtValState(p.name); return v ? (v.ok ? '✓ conferido' : 'enviado') : '—'; })()}</td></tr>`; }).join('') || '<tr><td colspan="6">Sem registros</td></tr>') + '</tbody></table>').join('');
  const html = `<html><head><meta charset="utf-8"><title>${e(d.title)} — Relatório</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px;margin:0 0 2px}h2{font-size:15px;margin:22px 0 8px}.m{color:#555;font-size:13px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f0f0f0}@media print{button{display:none}}</style></head><body>
    <h1>${e(d.title)} — ${mtEnded() ? 'Relatório final' : 'Relatório parcial'}</h1><div class="m">${d.when} · gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</div>
    <h2>Quanto cada equipe fez</h2><table><thead><tr><th>Pos.</th><th>Equipe</th><th>Total</th><th>Meta</th><th>% da meta</th><th>Pessoas</th><th>Registros</th></tr></thead><tbody>${rank}</tbody></table>${teams}
    <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;font-size:14px">🖨️ Imprimir / Salvar como PDF</button></body></html>`;
  const w = window.open('', '_blank'); w.document.write(html); w.document.close();
}
// — validação da corrida: link do Strava + km do GPS comparados com os km registrados; check-in por GPS no ponto da volta —
let MT_VAL = {}, MT_OPEN_LAP = false, lapGrp = '';
async function mtLoadVal() { const v = await getSetting('relay_validations', {}); MT_VAL = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; }
function mtValState(name) {   // envio do Strava de um atleta: pendente ou conferido pela equipe
  const k = listaNorm(name), v = MT_VAL[k]; if (!v) return null;
  const reg = MT_ENTRIES.filter(e => listaNorm(e.name) === k).reduce((s, e) => s + (+e.km), 0);
  return { v, reg, ok:!!v.approved };
}
function mtValBadge(name) {
  if (mtUnit() !== 'km') return ''; const s = mtValState(name); if (!s) return '';
  const link = mtUnlocked() && staffHash() ? ` <a href="${listaEsc(s.v.link)}" target="_blank" rel="noopener" style="text-decoration:none">🔗</a>` : '';
  return ` <span class="mt-vb ${s.ok ? 'ok' : 'warn'}">${s.ok ? '✓ Strava conferido' : '📎 Strava enviado'}</span>${link}`;
}
let VAL_SUG = [], VAL_M = [];
function valKnown() {   // nomes conhecidos: quem já registrou, atletas cadastrados e inscritos do evento
  const set = new Map(), add = n => { const k = listaNorm(n); if (k && !set.has(k)) set.set(k, n); };
  MT_ENTRIES.forEach(e => add(e.name)); mtGroups().forEach(g => (g.roster || []).forEach(r => add(r.name))); mtNames().forEach(add);
  return [...set.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
function valSuggest(all) {
  const q = listaNorm(document.getElementById('val-name').value), box = document.getElementById('val-sug'), L = valKnown();
  VAL_SUG = (all ? L : q ? L.filter(n => listaNorm(n).includes(q)) : []).slice(0, all ? 300 : 6);
  box.style.display = VAL_SUG.length ? 'block' : 'none'; box.innerHTML = VAL_SUG.map((n, i) => `<div onclick="valChoose(${i})">${listaEsc(n)}</div>`).join('');
}
const valType = () => valSuggest(false);
function valToggleList() { const b = document.getElementById('val-sug'); if (b.style.display === 'block') b.style.display = 'none'; else valSuggest(true); }
function valChoose(i) { if (!VAL_SUG[i]) return; document.getElementById('val-name').value = VAL_SUG[i]; document.getElementById('val-sug').style.display = 'none'; }
function valMatches(num) {   // nº da pulseira = nº de inscrição: acha quem tem esse número nas equipes
  const n = parseInt(num); if (!(n > 0)) return []; const out = [];
  mtGroups().forEach(g => (g.roster || []).forEach(r => { if (r.n === n) out.push({ name:r.name, team:g.name, color:g.color }); }));
  return out;
}
function valNum() {
  const num = document.getElementById('val-num').value, h = document.getElementById('val-hint'), m = valMatches(num); VAL_M = m;
  if (!num.trim()) { h.innerHTML = ''; return; }
  if (!m.length) { h.style.color = 'var(--gold)'; h.textContent = 'Nº não encontrado: digite o nome'; return; }
  if (m.length === 1) { h.style.color = 'var(--green)'; h.textContent = '✅ ' + m[0].name + (m[0].team ? ' · ' + m[0].team : ''); document.getElementById('val-name').value = m[0].name; return; }
  h.style.color = 'var(--muted)'; h.innerHTML = 'Esse número existe em mais de uma equipe. Toque na sua:<div class="mt-roster" style="margin-top:6px">' + m.map((x, i) => `<button class="mt-rchip" style="border-color:${x.color}66" onclick="valPick(${i})">${listaEsc(x.name)} · ${listaEsc(x.team)}</button>`).join('') + '</div>';
}
function valPick(i) { const h = document.getElementById('val-hint'); document.getElementById('val-name').value = VAL_M[i].name; h.style.color = 'var(--green)'; h.textContent = '✅ ' + VAL_M[i].name + ' · ' + VAL_M[i].team; }
function valOpen() {
  if (!MT_CFG) return;
  ['val-name', 'val-num', 'val-link'].forEach(id => document.getElementById(id).value = ''); document.getElementById('val-hint').textContent = ''; document.getElementById('val-res').textContent = ''; document.getElementById('val-sug').style.display = 'none';
  document.getElementById('meta-val').classList.add('open');
}
async function valSave() {
  let name = document.getElementById('val-name').value.trim(); const num = document.getElementById('val-num').value.trim(), link = document.getElementById('val-link').value.trim();
  if (!name && num) { const m = valMatches(num); if (m.length === 1) name = m[0].name; else if (m.length > 1) return toast('⚠️ Esse número existe em mais de uma equipe: toque na sua'); }
  if (!name) return toast('⚠️ Digite o nome ou o número da pulseira/inscrição');
  if (!/^https?:\/\/([a-z0-9-]+\.)?strava\.(com|app\.link)\//i.test(link)) return toast('⚠️ Cole o link da atividade do Strava');
  const k0 = listaNorm(name); name = valKnown().find(n => listaNorm(n) === k0) || mtResolve(name);
  await mtLoadVal(); MT_VAL[listaNorm(name)] = { name, num, link, at:new Date().toISOString() };
  if (!(await setSetting('relay_validations', MT_VAL))) return toast('❌ Não foi possível enviar');
  const s = mtValState(name), el = document.getElementById('val-res'); el.style.color = 'var(--green)';
  el.textContent = `✅ Enviado! O painel tem ${mtKm(s.reg)} ${mtUnit()} registrados para você. A equipe vai conferir.`; mtRender(); toast('📎 Strava enviado!');
}
// lista para a equipe conferir: pendentes primeiro
function mtValEntries() {
  return Object.keys(MT_VAL).map(k => { const v = MT_VAL[k], s = mtValState(v.name); return { k, v, reg:s ? s.reg : 0, ok:!!v.approved }; }).sort((a, b) => (a.ok - b.ok) || a.v.name.localeCompare(b.v.name, 'pt-BR'));
}
function mtValListHtml() {
  const L = mtValEntries(); if (!L.length) return '<div style="color:var(--muted);font-size:13px">Nenhum envio ainda.</div>';
  return L.map(e => `<div class="mt-row"><div style="display:flex;justify-content:space-between;gap:8px"><b>${e.ok ? '✓' : '📎'} ${listaEsc(e.v.name)}${e.v.num ? ` <span style="color:var(--muted);font-weight:600">#${listaEsc(e.v.num)}</span>` : ''}</b><b style="color:${e.ok ? 'var(--green)' : 'var(--gold)'}">${e.ok ? 'conferido' : 'aguardando'}</b></div>
    <div style="font-size:12px;color:var(--muted);margin:3px 0 6px">Registrado no painel: <b>${mtKm(e.reg)} ${mtUnit()}</b></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><a class="mt-tiny" style="text-decoration:none" href="${listaEsc(e.v.link)}" target="_blank" rel="noopener">🔗 Abrir no Strava</a>${e.ok ? '' : `<button class="mt-tiny" onclick="valApprove('${e.k}')">✓ Conferido</button>`}<button class="mt-tiny warn" onclick="valRemove('${e.k}')">Remover</button></div></div>`).join('');
}
function mtValRefreshUI() { const a = document.getElementById('mta-val-list'), b = document.getElementById('meta-vlist-body'); if (a) a.innerHTML = mtValListHtml(); if (b) b.innerHTML = mtValListHtml(); }
async function mtValPatch(fn) { await mtLoadVal(); fn(MT_VAL); await setSetting('relay_validations', MT_VAL); mtRender(); mtValRefreshUI(); }
const valApprove = k => mtValPatch(m => { if (m[k]) m[k].approved = true; });
const valRemove = k => confirm('Remover este envio?') && mtValPatch(m => { delete m[k]; });
function vlistOpen() { mtValRefreshUI(); document.getElementById('meta-vlist').classList.add('open'); }
// check-in por GPS no ponto da volta
const mtHav = (a, b, c, d) => { const t = x => x*Math.PI/180, R = 6371000, h = Math.sin(t(c-a)/2)**2 + Math.cos(t(a))*Math.cos(t(c))*Math.sin(t(d-b)/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
function lapChips() {
  document.getElementById('lap-chips').innerHTML = mtGroups().map(g => { const on = g.id === lapGrp;
    return `<button class="mt-gchip" style="border-color:${g.color};color:${on ? (bdLum(g.color) > 140 ? '#0a0a0a' : '#fff') : g.color};background:${on ? g.color : 'transparent'}" onclick="lapPick('${g.id}')">${listaEsc(g.name || 'Total')}</button>`; }).join('');
}
function lapApply() {
  const multi = mtMulti(), numbered = !multi || !!mtRoster(lapGrp).length || !lapGrp;
  document.getElementById('lap-gwrap').style.display = multi ? 'block' : 'none';
  document.getElementById('lap-nwrap').style.display = multi && lapGrp && !mtRoster(lapGrp).length ? 'none' : (multi ? 'block' : 'none');
}
function lapPick(id) { lapGrp = id; localStorage.setItem('mt_lapgrp', id); lapChips(); lapApply(); lapWho(); }
function lapWho() {
  const el = document.getElementById('lap-who'), n = parseInt(document.getElementById('lap-num').value);
  if (!n || !lapGrp) { el.textContent = ''; return; }
  const r = mtRoster(lapGrp).find(x => x.n === n); el.style.color = r ? 'var(--green)' : 'var(--red)'; el.textContent = r ? '✅ ' + r.name : `⚠️ Nº ${n} não cadastrado nesta cor`;
}
function lapOpen() {
  if (!MT_CFG) return;
  const cp = MT_CFG.checkpoint, sv = localStorage.getItem('mt_lapgrp'); lapGrp = mtGroups().some(g => g.id === sv) ? sv : (mtMulti() ? '' : '');
  document.getElementById('lap-info').textContent = cp ? `Chegue perto da linha (até ${cp.r} m) e toque em "Passei na linha". Intervalo mínimo entre voltas: ${MT_CFG.minLapSec || 60} s.` : '⚠️ O check-in por GPS ainda não foi configurado no painel.';
  document.getElementById('lap-num').value = ''; document.getElementById('lap-who').textContent = ''; document.getElementById('lap-res').textContent = '';
  lapChips(); lapApply(); document.getElementById('meta-lap').classList.add('open');
}
async function lapGo() {
  const res = document.getElementById('lap-res'), say = (t, c) => { res.style.color = c || 'var(--red)'; res.textContent = t; };
  const cp = MT_CFG && MT_CFG.checkpoint, multi = mtMulti(), unit = mtUnit(), lapKm = mtLapKm();
  if (!cp) return say('⚠️ Check-in por GPS não configurado');
  if (mtEffClosed()) return say(mtCapReached() ? '⏰ Tempo esgotado' : '🔒 Prova encerrada');
  if (multi && !lapGrp) return say('⚠️ Escolha a cor da pulseira');
  let name;
  if (multi && !mtRoster(lapGrp).length) name = mtGroup(lapGrp).name;
  else if (multi) { const r = mtRoster(lapGrp).find(x => x.n === parseInt(document.getElementById('lap-num').value)); if (!r) return say('⚠️ Digite um número de pulseira cadastrado'); name = r.name; }
  else return say('⚠️ O check-in por GPS precisa de equipes cadastradas');
  if (unit === 'km' && !(lapKm > 0)) return say('⚠️ Defina o km de cada volta no painel');
  if (!navigator.geolocation) return say('⚠️ Este aparelho não oferece localização');
  const btn = document.getElementById('lap-btn'); btn.disabled = true; say('📡 Buscando sua localização…', 'var(--muted)');
  let pos; try { pos = await new Promise((ok, no) => navigator.geolocation.getCurrentPosition(ok, no, { enableHighAccuracy:true, timeout:15000, maximumAge:0 })); }
  catch (e) { btn.disabled = false; return say(e && e.code === 1 ? '⚠️ Permita a localização no navegador e tente de novo' : '⚠️ Não consegui pegar o GPS. Vá para céu aberto e tente de novo'); }
  const d = mtHav(pos.coords.latitude, pos.coords.longitude, cp.lat, cp.lng), acc = pos.coords.accuracy || 0;
  if (acc > Math.max(80, cp.r * 1.5)) { btn.disabled = false; return say(`⚠️ GPS impreciso (±${Math.round(acc)} m). Tente de novo em céu aberto`); }
  if (d > cp.r + Math.min(acc, 30)) { btn.disabled = false; return say(`📍 Você está a ${Math.round(d)} m da linha (limite ${cp.r} m)`); }
  await mtLoadEntries();
  const mine = MT_ENTRIES.filter(e => (e.grp || '') === (multi ? lapGrp : '') && listaNorm(e.name) === listaNorm(name)), last = mine.length ? new Date(mine[mine.length-1].created_at).getTime() : 0, wait = Math.ceil(((MT_CFG.minLapSec || 60) * 1000 - (Date.now() - last)) / 1000);
  if (wait > 0) { btn.disabled = false; return say(`⏳ Volta recente. Aguarde ${wait} s para registrar outra`); }
  const { error } = await sb.from('relay_entries').insert({ challenge_id:MT_CFG.id, name, km:unit === 'km' ? lapKm : 1, ...(multi ? { grp:lapGrp } : {}) });
  btn.disabled = false; if (error) return say('❌ Não foi possível registrar. Tente de novo');
  await mtRefresh(); const m = mtMine(name, multi ? lapGrp : '');
  say(`✅ Volta registrada! ${name}: ${mtKm(m.km)} ${unit} (${m.n} volta${m.n === 1 ? '' : 's'})`, 'var(--green)'); if (navigator.vibrate) navigator.vibrate(120);
}
function mtCpHere() {
  if (!navigator.geolocation) return toast('⚠️ Este aparelho não oferece localização');
  toast('📡 Buscando localização…');
  navigator.geolocation.getCurrentPosition(p => { document.getElementById('mta-cp-lat').value = p.coords.latitude.toFixed(6); document.getElementById('mta-cp-lng').value = p.coords.longitude.toFixed(6); toast(`📍 Ponto definido (precisão ±${Math.round(p.coords.accuracy)} m). Salve a configuração.`); }, () => toast('⚠️ Permita a localização no navegador'), { enableHighAccuracy:true, timeout:20000, maximumAge:0 });
}
function mtCpLinks() {
  const link = location.origin + location.pathname + '?meta=1&volta=1', has = !!(MT_CFG && MT_CFG.checkpoint), q = document.getElementById('mta-cp-qr');
  document.getElementById('mta-cp-link').value = link; q.style.display = 'none'; if (has) q.src = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=' + encodeURIComponent(link);
}
function mtNamesBox(g, a) {   // quem está na equipe: atletas cadastrados (com nº) + quem já registrou km
  const c = g.color || '#e8ff00', seen = new Set(), items = [];
  (g.roster || []).forEach(r => { seen.add(listaNorm(r.name)); items.push({ n:r.n, name:r.name }); });
  a.list.forEach(p => { const k = listaNorm(p.name); if (!seen.has(k) && k !== listaNorm(g.name || '§')) { seen.add(k); items.push({ n:null, name:p.name }); } });
  const chips = items.map(i => `<span class="mt-chip" style="border-color:${c}66">${i.n != null ? `<i style="color:${c}">#${i.n}</i> ` : ''}${listaEsc(i.name)}</span>`).join('');
  return `<div class="mt-names"><div class="mt-names-t">QUEM ESTÁ NA EQUIPE${items.length ? ' · ' + items.length : ''}</div>${chips || '<div style="font-size:12px;color:var(--muted)">Nenhum atleta cadastrado ainda.</div>'}</div>`;
}
function mtGroupCard(g) {
  const T = mtTimes(g.id), a = T.a, pct = Math.min(100, a.total/g.goal*100), c = g.color, pers = mtPersons(a, g);
  const badge = T.done ? '🎉 SUPERADA' : mtEffClosed() ? '⏹ ENCERRADO' : '<i></i>AO VIVO';
  return `<div class="mt-card" style="border-color:${c}66">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b class="mt-gname" style="color:${c}">${listaEsc(g.name)}</b><span class="mt-live" style="color:${c};background:${c}22">${badge}</span></div>
    <div style="text-align:center;margin-top:8px"><span class="mt-gtotal" style="color:${c}">${mtKm(a.total)}</span><span class="mt-ggoal"> / ${mtKm(g.goal)} ${mtUnit()}</span></div>
    ${mtRouteSVG(MT_CFG.route || 'onda', pct, c, 150, mtRInfo(a.total, g.goal))}
    <div class="mt-bar"><div class="mt-fill" style="width:${pct}%;background:${c}"></div></div>
    <div class="mt-pct">${Math.floor(pct)}% da meta</div>
    ${mtLeft(T.done, g.goal-a.total, a.total-g.goal, c)}
    <div class="mt-stats" style="grid-template-columns:repeat(${pers > 0 ? 2 : 1},1fr)">${mtStatCells(pers, a.n)}</div>
    ${mtNamesBox(g, a)}
    <div class="mt-foot">${MT_FOOT}</div></div>`;
}
const mtUnlocked = () => { const sh = staffHash(); if (!MT_CFG || !sh) return true; try { const u = JSON.parse(localStorage.getItem('mt_unlock') || 'null'); return !!u && u.h === sh && u.c === MT_CFG.id && u.e > Date.now(); } catch (e) { return false; } };
// — controle da prova (largada / fim) e tempo de prova = fim − largada —
function mtRaceMs() {
  if (!MT_CFG || !MT_CFG.startedAt) return null;
  const t0 = new Date(MT_CFG.startedAt).getTime(), cs = mtCapSec()*1000, last = MT_ENTRIES.length ? new Date(MT_ENTRIES[MT_ENTRIES.length-1].created_at).getTime() : Date.now();
  const end = MT_CFG.endedAt ? new Date(MT_CFG.endedAt).getTime() : MT_CFG.closed ? last : Date.now(), ms = Math.max(0, end - t0);
  return cs && ms > cs ? cs : ms;
}
async function mtCfgPatch(patch) {   // relê a configuração antes de gravar
  if (!mtUnlocked() || !staffHash()) { toast('🔒 Entre com a senha da equipe'); return false; }
  await mtLoadCfg(); if (!MT_CFG) return false;
  MT_CFG = { ...MT_CFG, ...patch }; return await setSetting('relay_challenge', MT_CFG);
}
async function mtRaceStart() { if (!confirm('Dar a largada agora? O cronômetro da prova começa a contar a partir deste momento.')) return; if (await mtCfgPatch({ startedAt:new Date().toISOString(), endedAt:null, closed:false })) { toast('🏁 Largada dada!'); mtRefresh(); } }
async function mtRaceEnd() { if (!confirm('Encerrar a prova agora? Os registros fecham e o tempo final fica gravado.')) return; if (await mtCfgPatch({ closed:true, endedAt:new Date().toISOString() })) { toast('⏹ Prova encerrada'); mtRefresh().then(() => { const f = document.getElementById('meta-final'); if (f && f.style.display !== 'none' && f.scrollIntoView) f.scrollIntoView({ behavior:'smooth', block:'start' }); }); } }
async function mtRaceReopen() { if (await mtCfgPatch({ closed:false, endedAt:null })) { toast('▶ Prova reaberta'); mtRefresh(); } }
function mtLogout() { localStorage.removeItem('mt_unlock'); mtRender(); }
function mtLockClick() { document.getElementById('mt-pw').value = ''; document.getElementById('meta-pw-ov').classList.add('open'); setTimeout(() => document.getElementById('mt-pw').focus(), 100); }
function mtRenderStaff() {
  const el = document.getElementById('meta-staff'), pub = document.getElementById('meta-pub'), lockBtn = document.getElementById('meta-lock-btn');
  const hasPw = !!staffHash(), un = mtUnlocked(), multi = mtMulti();
  lockBtn.style.display = hasPw && !un ? 'inline-block' : 'none';
  pub.style.display = 'none'; pub.innerHTML = '';   // sem botões grandes para o atleta; o check-in por GPS só abre pelo link do QR
  document.getElementById('meta-cad-btn').style.display = MT_CFG && multi ? 'inline-block' : 'none';
  document.getElementById('meta-val-btn').style.display = MT_CFG && mtUnit() === 'km' ? 'inline-block' : 'none';
  if (!MT_CFG || !un) { el.style.display = 'none'; return; }
  const c = MT_CFG, ms = mtRaceMs(), hm = t => new Date(t).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
  const eff = mtEffClosed(), running = !!c.startedAt && !eff;
  const status = `Largada: <b>${c.startedAt ? hm(c.startedAt) : '—'}</b> · Fim: <b>${c.endedAt ? hm(c.endedAt) : '—'}</b>` + (ms !== null ? ` · Duração: <b>${mtDur(ms)}</b>${running ? ' (em andamento)' : ''}` : '');
  const ctrl = !hasPw ? '<div style="font-size:12px;color:var(--gold)">⚠️ Defina uma senha no admin (🏁 Meta) para liberar a largada e o fim da prova.</div>'
    : !c.startedAt ? '<button class="btn btn-blue" onclick="mtRaceStart()">🏁 DAR A LARGADA</button>'
    : running ? '<button class="mt-tiny warn" onclick="mtRaceEnd()">⏹ Encerrar prova</button>'
    : `<div style="display:flex;gap:8px;flex-wrap:wrap">${mtCapReached() ? '' : '<button class="mt-tiny" onclick="mtRaceReopen()">▶ Reabrir</button>'}<button class="mt-tiny warn" onclick="mtRaceStart()">🏁 Nova largada (zera o tempo)</button></div>`;
  el.style.display = 'block';
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="color:var(--green)">✅ Acesso liberado</b>${hasPw ? '<button class="btn-sm-danger" style="padding:6px 12px" onclick="mtLogout()">Sair</button>' : ''}</div>
    <button class="btn btn-blue" ${eff ? 'disabled' : ''} onclick="mtOpenSheet()" style="font-size:17px;padding:16px">${eff ? '🔒 Prova encerrada' : '➕ Registrar ' + (mtUnit() === 'km' ? 'km' : 'rounds')}</button>
    ${mtUnit() === 'km' ? `<button class="btn-sm-danger" style="width:100%;padding:12px;margin-top:8px" onclick="vlistOpen()">📎 Conferir Strava${mtValEntries().filter(e => !e.ok).length ? ' · ' + mtValEntries().filter(e => !e.ok).length + ' pendente(s)' : ''}</button>` : ''}
    <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:11px;letter-spacing:1.5px;color:var(--muted);font-weight:800">CONTROLE DA PROVA</div><div style="font-size:13px;margin:6px 0 10px">${status}</div>${ctrl}</div>`;
}
// — cadastro de atleta: nome + cor da equipe + nº da pulseira (entra direto na lista) —
let cadGrp = '', CAD_NAMES = [], CAD_SHOWN = [];
async function mtRosterAdd(gid, name, want) {
  let finalN = null;
  const ok = await mtRosterSave(gid, list => {
    const used = new Set(list.map(r => r.n)), dup = list.find(r => listaNorm(r.name) === listaNorm(name));
    if (dup) throw new Error(`${dup.name} já está nesta cor (nº ${dup.n})`);
    if (used.has(want)) throw new Error(`O nº ${want} já é de ${list.find(r => r.n === want).name}`);
    finalN = want; list.push({ n:want, name }); return list.sort((a, b) => a.n - b.n);
  });
  if (!ok) throw new Error('Não foi possível salvar');
  return finalN;
}
// nome: digite livremente ou use a seta ▾ / as sugestões (só aparecem nomes que ainda não estão em nenhuma equipe)
function cadNames() {
  const taken = new Set(mtGroups().flatMap(g => (g.roster || []).map(r => listaNorm(r.name))));
  CAD_NAMES = mtNames().filter(n => !taken.has(listaNorm(n))); cadHide();
}
const cadHide = () => { document.getElementById('cad-sug').style.display = 'none'; };
function cadSuggest(all) {
  const q = listaNorm(document.getElementById('cad-name').value), box = document.getElementById('cad-sug');
  CAD_SHOWN = (all ? CAD_NAMES : q ? CAD_NAMES.filter(n => listaNorm(n).includes(q)) : []).slice(0, all ? 300 : 6);
  box.style.display = CAD_SHOWN.length ? 'block' : 'none';
  box.innerHTML = CAD_SHOWN.map((n, i) => `<div onclick="cadChoose(${i})">${listaEsc(n)}</div>`).join('');
}
const cadType = () => cadSuggest(false);
function cadToggleList() { const b = document.getElementById('cad-sug'); if (b.style.display === 'block') cadHide(); else cadSuggest(true); }
function cadChoose(i) { if (!CAD_SHOWN[i]) return; document.getElementById('cad-name').value = CAD_SHOWN[i]; cadHide(); document.getElementById('cad-num').focus(); }
function cadChips() {
  document.getElementById('cad-chips').innerHTML = mtGroups().map(g => { const on = g.id === cadGrp;
    return `<button class="mt-gchip" style="border-color:${g.color};color:${on ? (bdLum(g.color) > 140 ? '#0a0a0a' : '#fff') : g.color};background:${on ? g.color : 'transparent'}" onclick="cadPick('${g.id}')">${listaEsc(g.name)}</button>`; }).join('');
}
function cadPick(id) { cadGrp = id; cadChips(); cadCheck(); document.getElementById('cad-num').focus(); }
function cadCheck() {
  const el = document.getElementById('cad-who'), n = parseInt(document.getElementById('cad-num').value);
  if (!n) { el.textContent = ''; return; }
  if (!cadGrp) { el.style.color = 'var(--gold)'; el.textContent = 'Escolha a cor da equipe'; return; }
  const r = mtRoster(cadGrp).find(x => x.n === n);
  el.style.color = r ? 'var(--red)' : 'var(--green)'; el.textContent = r ? `⚠️ Nº ${n} já é de ${r.name}` : `✅ Nº ${n} livre no ${mtGroup(cadGrp).name}`;
}
function cadOpen() {
  if (!MT_CFG || !mtMulti()) return toast('⚠️ As equipes ainda não foram criadas');
  const sv = localStorage.getItem('mt_cadgrp'); cadGrp = mtGroups().some(g => g.id === sv) ? sv : '';
  cadNames(); cadChips(); document.getElementById('cad-name').value = ''; document.getElementById('cad-num').value = ''; document.getElementById('cad-who').textContent = ''; document.getElementById('cad-last').textContent = '';
  document.getElementById('meta-cad').classList.add('open');
}
async function cadSave() {
  const name0 = document.getElementById('cad-name').value.trim(), want = parseInt(document.getElementById('cad-num').value);
  if (!name0) return toast('⚠️ Digite ou escolha o nome'); if (!cadGrp) return toast('⚠️ Escolha a cor da equipe'); if (!(want > 0)) return toast('⚠️ Digite o número da pulseira');
  const name = mtResolve(name0).toUpperCase(), other = mtGroups().find(g => g.id !== cadGrp && (g.roster || []).some(r => listaNorm(r.name) === listaNorm(name)));
  if (other && !confirm(`${name} já está no ${other.name}. Cadastrar também nesta equipe?`)) return;
  let n; try { n = await mtRosterAdd(cadGrp, name, want); } catch (e) { return toast('⚠️ ' + e.message); }
  localStorage.setItem('mt_cadgrp', cadGrp);
  const msg = `✅ ${name} — ${mtGroup(cadGrp).name.toUpperCase()} Nº ${n}`; document.getElementById('cad-last').textContent = msg;
  document.getElementById('cad-num').value = ''; document.getElementById('cad-name').value = ''; document.getElementById('cad-who').textContent = ''; cadNames();
  await mtRefresh(); toast(msg);
}
function mtRender() {
  const el = id => document.getElementById(id);
  if (!MT_CFG) { el('meta-title').textContent = 'Nenhum desafio ativo'; mtRenderStaff(); return; }
  el('meta-title').textContent = MT_CFG.title || 'Meta coletiva';
  if (MT_LOGO) { el('meta-logo').src = MT_LOGO; el('meta-logo').style.display = 'block'; }
  const multi = mtMulti(); el('meta-single').style.display = multi ? 'none' : 'block'; el('meta-groups').style.display = multi ? '' : 'none'; el('meta-groups').style.setProperty('--cols', Math.min(4, Math.max(1, mtGroups().length)));
  el('meta-img-single').style.display = multi ? 'none' : 'block';
  if (!multi) {
    const g = mtGroups()[0], T = mtTimes(''), a = T.a, pct = Math.min(100, a.total/g.goal*100), c = g.color;
    el('meta-total').textContent = mtKm(a.total); el('meta-goal').textContent = ' / ' + mtKm(g.goal) + ' ' + mtUnit();
    el('meta-fill').style.width = pct + '%'; el('meta-pct').textContent = Math.floor(pct) + '% da meta';
    el('meta-leftbox').innerHTML = mtLeft(T.done, g.goal-a.total, a.total-g.goal, c);
    el('meta-stats').style.gridTemplateColumns = `repeat(${a.list.length > 0 ? 2 : 1},1fr)`; el('meta-stats').innerHTML = mtStatCells(a.list.length, a.n);
    el('meta-badge').innerHTML = T.done ? '🎉 META SUPERADA' : mtEffClosed() ? '⏹ ENCERRADO' : '<i></i>AO VIVO';
    el('meta-report').innerHTML = mtRows(a, g); el('meta-img-single').innerHTML = mtShareBtn('', c); el('meta-names').innerHTML = mtNamesBox(g, a); el('meta-route').innerHTML = mtRouteSVG(MT_CFG.route || 'onda', pct, c, 150, mtRInfo(a.total, g.goal));
  } else {
    el('meta-groups').innerHTML = mtGroups().map(mtGroupCard).join('');
    el('meta-report').innerHTML = mtGroups().map(g => `<div class="section-label" style="color:${g.color};margin-top:6px">${listaEsc(g.name)}</div>` + mtRows(mtAgg(g.id), g)).join('');
  }
  mtRenderStaff();
  mtRenderClock(); mtRenderFinal();
  if (document.getElementById('meta-sheet').classList.contains('open') && !mtEffClosed()) mtRosterList();
  if (mtEffClosed()) document.getElementById('meta-sheet').classList.remove('open');   // prova encerrada ou tempo esgotado: fecha o formulário de registro
  el('meta-upd').textContent = 'atualizado ' + new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
async function mtRefresh() {
  try { await mtLoadCfg(); await mtLoadEntries(); await mtLoadVal(); } catch (e) { console.error(e); }
  mtRender();
}
async function mtStartPublic() {
  document.getElementById('meta-view').style.display = 'block'; document.body.classList.add('meta-mode');
  await mtLoadCfg(); await loadStaffPw(); MT_LOGO = String((await getSetting('relay_logo', '')) || '');
  try { await getEventInfo(); await loadEventRegistrations(); } catch (e) {}
  if (MT_CFG && /membros|ambos/.test(MT_CFG.source||'')) await loadMembers();
  await mtLoadEntries(); try { await mtLoadVal(); } catch (e) {} mtRender();
  mtPoll = setInterval(() => { if (!document.hidden) mtRefresh(); }, 6000);
  setInterval(() => { mtRenderClock(); if (mtCapReached() && !MT_CAP_SEEN) { MT_CAP_SEEN = true; mtRender(); } }, 1000);
  if (MT_OPEN_LAP) lapOpen();   // link do QR: abre direto o check-in por GPS
  if (MT_OPEN_REG) mtOpenSheet();   // link de registro (pede a senha da equipe, se houver)
}
function mtNames() {
  const src = (MT_CFG && MT_CFG.source) || 'evento', m = new Map(), add = n => { n = String(n||'').trim(); if (n) m.set(listaNorm(n), n); };
  if (src !== 'membros') { const id = EVENT_INFO && EVENT_INFO.id; (EVENT_REGISTRATIONS||[]).filter(r => !id || r.event_id === id).forEach(r => add(r.name)); }
  if (src !== 'evento') MEMBERS.forEach(x => add(x.name));
  return [...m.values()].sort((a,b) => a.localeCompare(b,'pt-BR'));
}
let mtSelGrp = '', MT_LAST = null;
function mtRoster(gid) { return (mtGroup(gid).roster || []); }
function mtCurName() { return document.getElementById('mt-name').value.trim(); }
const mtTeamMode = () => mtMulti() && !!mtSelGrp && !mtRoster(mtSelGrp).length;
function mtGchips() {
  document.getElementById('mt-gchips').innerHTML = mtGroups().map(g => { const on = g.id === mtSelGrp;
    return `<button class="mt-gchip" style="border-color:${g.color};color:${on ? (bdLum(g.color) > 140 ? '#0a0a0a' : '#fff') : g.color};background:${on ? g.color : 'transparent'}" onclick="mtPickGroup('${g.id}')">${listaEsc(g.name)}</button>`; }).join('');
}
// — cadastro/edição de atletas direto na tela de registro (vale para a cor escolhida) —
let MT_ATH = null;
async function mtRosterSave(gid, fn) {   // relê a configuração mais recente antes de gravar, para não sobrescrever o que outra pessoa mudou
  await mtLoadCfg();
  if (!MT_CFG || !(MT_CFG.groups || []).length) return false;
  MT_CFG = { ...MT_CFG, groups:MT_CFG.groups.map(g => g.id === gid ? { ...g, roster:fn((g.roster || []).map(r => ({ ...r }))) } : g) };
  return await setSetting('relay_challenge', MT_CFG);
}
function mtAthOpen(mode) {
  const gid = mtSelGrp; if (!gid) return toast('⚠️ Escolha a cor da equipe');
  let n = '', name = '';
  if (mode === 'edit') {
    const r = mtRoster(gid).find(x => x.n === parseInt(document.getElementById('mt-num').value));
    if (!r) return toast('⚠️ Digite o nº de um atleta cadastrado para editar');
    MT_ATH = { mode, n:r.n, name:r.name }; n = r.n; name = r.name;
  } else MT_ATH = { mode:'new' };
  document.getElementById('mt-ath-title').textContent = (mode === 'edit' ? '✏️ Editar atleta — ' : '➕ Novo atleta — ') + mtGroup(gid).name;
  document.getElementById('mt-ath-num').value = n; document.getElementById('mt-ath-name').value = name;
  document.getElementById('mt-ath-del').style.display = mode === 'edit' ? 'block' : 'none';
  document.getElementById('mt-ath-panel').style.display = 'block'; document.getElementById('mt-ath-name').focus();
}
function mtAthClose() { MT_ATH = null; document.getElementById('mt-ath-panel').style.display = 'none'; }
async function mtRenameEntries(gid, oldName, newName) {   // o banco não libera "update": copia os registros com o nome novo e apaga os antigos
  await mtLoadEntries();
  const rows = MT_ENTRIES.filter(e => (e.grp||'') === gid && listaNorm(e.name) === listaNorm(oldName)); if (!rows.length) return;
  const ins = await sb.from('relay_entries').insert(rows.map(e => ({ challenge_id:e.challenge_id, name:newName, km:e.km, seconds:e.seconds, grp:e.grp, created_at:e.created_at })));
  if (ins.error) return toast('⚠️ Nome alterado, mas os km antigos não foram migrados');
  await sb.from('relay_entries').delete().in('id', rows.map(e => e.id));
}
async function mtAthSave() {
  if (!MT_ATH) return;
  const gid = mtSelGrp, name0 = document.getElementById('mt-ath-name').value.trim(), nraw = document.getElementById('mt-ath-num').value.trim();
  if (!name0) return toast('⚠️ Digite o nome do atleta');
  const want = nraw ? parseInt(nraw) : null; if (nraw && !(want > 0)) return toast('⚠️ Número inválido');
  if (MT_ATH.mode === 'new' && !mtRoster(gid).length && !confirm('Esta equipe é sem números. Cadastrar um atleta passa a pedir o número da pulseira nela. Continuar?')) return;
  const name = mtResolve(name0), old = MT_ATH.mode === 'edit' ? MT_ATH : null; let finalN = null;
  try {
    const ok = await mtRosterSave(gid, list => {
      if (old) list = list.filter(r => r.n !== old.n);
      const used = new Set(list.map(r => r.n)), dup = list.find(r => listaNorm(r.name) === listaNorm(name));
      if (dup) throw new Error(`${dup.name} já está cadastrado(a) nesta cor (nº ${dup.n})`);
      let n = want; if (n !== null && used.has(n)) throw new Error(`O nº ${n} já é de ${list.find(r => r.n === n).name}`);
      if (n === null) n = old ? old.n : Math.max(0, ...list.map(r => r.n)) + 1;
      if (used.has(n)) n = Math.max(...list.map(r => r.n)) + 1;
      finalN = n; list.push({ n, name }); return list.sort((a, b) => a.n - b.n);
    });
    if (!ok) return toast('❌ Não foi possível salvar');
  } catch (e) { return toast('⚠️ ' + e.message); }
  if (old && listaNorm(old.name) !== listaNorm(name)) await mtRenameEntries(gid, old.name, name);
  mtAthClose(); document.getElementById('mt-num').value = finalN; mtWho(); mtShowMine(); await mtRefresh();
  toast(`✅ ${name} — nº ${finalN} (${mtGroup(gid).name})`);
}
async function mtAthDelete() {
  if (!MT_ATH || MT_ATH.mode !== 'edit' || !confirm(`Remover ${MT_ATH.name} da lista desta cor? Os km já registrados continuam.`)) return;
  const n = MT_ATH.n, ok = await mtRosterSave(mtSelGrp, list => list.filter(r => r.n !== n));
  if (!ok) return toast('❌ Não foi possível remover');
  mtAthClose(); document.getElementById('mt-num').value = ''; mtWho(); await mtRefresh(); toast('🗑 Atleta removido da lista');
}
// mostra só o que faz sentido: nº da pulseira (equipe numerada) ou nome opcional (equipe sem números)
function mtApplyMode() {
  const multi = mtMulti(), team = mtTeamMode(), numbered = multi && mtSelGrp && !team, $ = id => document.getElementById(id);
  $('mt-num-wrap').style.display = numbered ? 'block' : 'none';
  $('mt-name-toggle').style.display = numbered ? 'block' : 'none';
  $('mt-ath-wrap').style.display = multi && mtSelGrp ? 'block' : 'none';
  $('mt-name-block').style.display = !multi || team ? 'block' : (numbered && $('mt-name-block').dataset.open === '1' ? 'block' : 'none');
  $('mt-name-label').textContent = team ? 'Quem correu? (opcional — sem nome conta para a equipe)' : 'Nome';
  $('mt-more-btn').style.display = multi && mtSelGrp ? 'inline-block' : 'none'; if (!(multi && mtSelGrp)) $('mt-more').style.display = 'none';
  mtRosterList();
}
function mtRosterList() {   // ao tocar na cor, lista todos da equipe com o número da pulseira
  const el = document.getElementById('mt-roster'), r = mtSelGrp ? mtRoster(mtSelGrp) : [], g = mtSelGrp ? mtGroup(mtSelGrp) : null, cur = parseInt(document.getElementById('mt-num').value);
  if (!r.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'flex';
  el.innerHTML = r.map(a => `<button class="mt-rchip${a.n === cur ? ' on' : ''}" style="${a.n === cur ? '' : 'border-color:' + g.color + '66'}" onclick="mtPickAth(${a.n})"><i style="${a.n === cur ? '' : 'color:' + g.color}">#${a.n}</i>${listaEsc(a.name)}</button>`).join('');
}
function mtPickAth(n) { document.getElementById('mt-num').value = n; mtWho(); mtRosterList(); }
function mtToggleMore() { const m = document.getElementById('mt-more'); m.style.display = m.style.display === 'none' ? 'block' : 'none'; }
function mtPickGroup(id) { mtAthClose(); mtSelGrp = id; localStorage.setItem('mt_grp', id); mtGchips(); mtApplyMode(); mtWho(); mtShowMine(); if (!mtTeamMode()) document.getElementById('mt-num').focus(); }
function mtWho() {
  const el = document.getElementById('mt-who'), n = parseInt(document.getElementById('mt-num').value);
  if (!n) { el.textContent = ''; return; }
  if (!mtSelGrp) { el.style.color = 'var(--gold)'; el.textContent = 'Escolha a cor da pulseira'; return; }
  const r = mtRoster(mtSelGrp).find(x => x.n === n), g = mtGroup(mtSelGrp);
  if (r) { const m = mtMine(r.name, mtSelGrp), last = mtHalf() ? mtLastPt(r.name, mtSelGrp) : null, exp = last === 'B' ? 'A' : 'B', bad = mtHalf() && mtPt !== exp; el.style.color = bad ? 'var(--gold)' : 'var(--green)'; el.textContent = `${bad ? '⚠️' : '✅'} ${r.name}` + (m ? ` — já fez ${mtKm(m.km)} ${mtUnit()}` : '') + (mtHalf() ? (bad ? ` · esperado ponto ${mtPtShort(exp)}` : ` · ponto ${mtPtShort(mtPt)} ok`) : ''); }
  else { el.style.color = 'var(--red)'; el.textContent = `⚠️ Nº ${n} não está cadastrado no ${g.name}`; }
}
function mtToggleName() { const b = document.getElementById('mt-name-block'); b.dataset.open = b.dataset.open === '1' ? '0' : '1'; mtApplyMode(); }
// acesso ao registro: senha própria (não dá acesso ao painel admin)
async function mtHash(t) { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('cantil:' + t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join(''); } catch (e) { return 'p:' + t; } }
function mtOpenSheet() {
  if (!MT_CFG || mtEffClosed()) return;
  if (mtUnlocked()) return mtOpenSheetNow();
  document.getElementById('mt-pw').value = ''; document.getElementById('meta-pw-ov').classList.add('open'); setTimeout(() => document.getElementById('mt-pw').focus(), 100);
}
async function mtPwSubmit() {
  const h = await mtHash(document.getElementById('mt-pw').value.trim());
  if (h !== staffHash()) { document.getElementById('mt-pw').value = ''; return toast('❌ Senha incorreta'); }
  localStorage.setItem('mt_unlock', JSON.stringify({ h, c:MT_CFG.id, e:Date.now() + 12*3600e3 }));
  document.getElementById('meta-pw-ov').classList.remove('open'); mtRender();
  if (MT_OPEN_REG && !mtEffClosed()) mtOpenSheetNow();
}
function mtOpenSheetNow() {
  mtKmU = 'km';
  const multi = mtMulti(), me = localStorage.getItem('mt_me') || '', names = mtNames();
  document.getElementById('mt-name').value = !multi && names.some(n => listaNorm(n) === listaNorm(me)) ? me : ''; document.getElementById('mt-sug').style.display = 'none';
  document.getElementById('mt-group-wrap').style.display = multi ? 'block' : 'none';
  document.getElementById('mt-name-block').dataset.open = '0';
  if (multi) { const sv = localStorage.getItem('mt_grp'); mtSelGrp = mtGroups().some(g => g.id === sv) ? sv : ''; mtGchips(); } else mtSelGrp = '';
  document.getElementById('mt-num').value = ''; document.getElementById('mt-who').textContent = ''; document.getElementById('mt-last').textContent = '';
  mtApplyMode(); mtNameChange(); document.getElementById('mt-km').value = ''; mtUndoBtn();
  const lap = mtLapKm(), rnd = mtUnit() === 'rounds';
  document.getElementById('mt-km-label').textContent = rnd ? 'Rounds feitos agora' : 'Km percorridos agora'; document.getElementById('mt-km').placeholder = rnd ? 'ex: 1' : 'ex: 2,4';
  document.getElementById('mt-chips').innerHTML = rnd ? [1,2,3,4,5].map(n => `<button class="bd-opt" data-v="${n}" onclick="mtSetKm('${n}')">${n} round${n>1?'s':''}</button>`).join('')
    : lap > 0 ? [1,2,3,4,5].map(n => `<button class="bd-opt" data-v="${n*lap}" onclick="mtSetKm('${mtFmtKm(n*lap)}')">${n} volta${n>1?'s':''}</button>`).join('') : '';
  const hl = mtHalf(), fixed = MT_OPEN_REG && hl;   // link de registro A ou B: o ponto já vem definido
  if (fixed) mtPt = MT_REG === 'B' ? 'B' : 'A';
  document.getElementById('mt-pt-wrap').style.display = hl && !fixed ? 'block' : 'none';
  const rb = document.getElementById('mt-reg-badge'); rb.style.display = fixed ? 'inline-block' : 'none'; rb.textContent = mtPt === 'A' ? '📍 Ponto A · largada/chegada' : '📍 Ponto B · ponto de volta';
  document.getElementById('mt-kmu').style.display = mtUnit() === 'km' ? 'flex' : 'none';
  if (hl) { document.getElementById('mt-chips').innerHTML = ''; document.getElementById('mt-km-label').textContent = 'Passagem de meia volta (' + (rnd ? 'rounds' : 'km') + ')'; mtSetPt(mtPt); }
  mtDefaultKm();   // já vem preenchido com 1 volta (ou meia volta, se usar os pontos A e B)
  mtSetKmUnit('km');
  document.getElementById('meta-sheet').classList.add('open');
}
const mtFmtKm = v => String(+(+v).toFixed(2)).replace('.', ',');
const mtLapKm = () => parseFloat(String((MT_CFG && MT_CFG.lapKm) || '').replace(',', '.')) || 0;
function mtChipSync() { const cur = parseFloat(document.getElementById('mt-km').value.replace(',', '.')) / (mtKmU === 'm' ? 1000 : 1); document.querySelectorAll('#mt-chips .bd-opt').forEach(b => b.classList.toggle('on', Math.abs(cur - parseFloat(b.dataset.v)) < 0.001)); }
function mtSetKm(v) { document.getElementById('mt-km').value = v; mtChipSync(); }
// ponto A (largada/chegada) e ponto B (meia volta): cada passagem soma meia volta; o ponto fica gravado em "seconds" (1 = A, 2 = B)
const mtHalf = () => !!(MT_CFG && MT_CFG.halfLap);
const mtHalfVal = () => mtUnit() === 'rounds' ? 0.5 : mtLapKm() / 2;
let mtPt = localStorage.getItem('mt_pt') === 'B' ? 'B' : 'A';
const mtPtShort = p => p === 'A' ? 'A (chegada)' : 'B (volta)';
function mtLastPt(name, gid) { const k = listaNorm(name); let r = null; MT_ENTRIES.forEach(e => { if ((e.grp || '') === (gid || '') && listaNorm(e.name) === k && (e.seconds === 1 || e.seconds === 2)) r = e.seconds === 1 ? 'A' : 'B'; }); return r; }
function mtSetPt(pt) {
  mtPt = pt; localStorage.setItem('mt_pt', pt);
  [['mt-pt-a', 'A'], ['mt-pt-b', 'B']].forEach(([id, k]) => { const el = document.getElementById(id), on = mtPt === k; el.style.background = on ? 'var(--accent)' : 'transparent'; el.style.color = on ? '#0a0a0a' : 'var(--accent)'; el.style.borderColor = 'var(--accent)'; });
  mtWho();
}
let mtKmU = 'km';
function mtKmLabel() { const u = mtKmU === 'm' ? 'metros' : 'km'; document.getElementById('mt-km-label').textContent = mtUnit() === 'rounds' ? 'Rounds feitos' : (mtHalf() ? 'Meia volta' : 'Distância') + ' (' + u + ')'; }
function mtSetKmUnit(u) {   // km ou metros avulsos: ao trocar, converte o número que já está digitado
  const el = document.getElementById('mt-km'), cur = parseFloat(el.value.replace(',', '.'));
  if (u !== mtKmU && cur > 0) el.value = u === 'm' ? String(Math.round(cur*1000)) : mtFmtKm(cur/1000);
  mtKmU = u; el.placeholder = mtUnit() === 'rounds' ? 'ex: 1' : (u === 'm' ? 'ex: 350' : 'ex: 2,4');
  [['mt-u-km', 'km'], ['mt-u-m', 'm']].forEach(([id, k]) => { const b = document.getElementById(id); b.style.background = u === k ? 'var(--accent)' : ''; b.style.color = u === k ? '#0a0a0a' : ''; });
  mtKmLabel(); mtChipSync();
}
function mtKmInput() {   // aceita "350" (na unidade escolhida), "350m" ou "0,35km"; devolve km com 2 casas
  const m = String(document.getElementById('mt-km').value).trim().toLowerCase().replace(',', '.').match(/^(\d*\.?\d+)\s*(km|m)?$/); if (!m) return NaN;
  const u = mtUnit() === 'km' ? (m[2] || mtKmU) : 'km';
  return Math.round((u === 'm' ? parseFloat(m[1]) / 1000 : parseFloat(m[1])) * 100) / 100;
}
function mtDefaultKm() { if (mtHalf()) { const h = mtHalfVal(); return mtSetKm(h > 0 ? mtFmtKm(h) : ''); } if (mtUnit() === 'rounds') return mtSetKm('1'); const l = mtLapKm(); mtSetKm(l > 0 ? mtFmtKm(l) : ''); }
function mtNameChange() { mtShowMine(); }
let MT_SUG = [];
function mtNameCands() {   // atletas da equipe escolhida primeiro, depois os inscritos
  const set = new Map(), add = n => { const k = listaNorm(n); if (k && !set.has(k)) set.set(k, n); };
  if (mtMulti() && mtSelGrp) mtRoster(mtSelGrp).forEach(r => add(r.name)); mtNames().forEach(add); return [...set.values()];
}
function mtNameSuggest(all) {
  const q = listaNorm(document.getElementById('mt-name').value), box = document.getElementById('mt-sug'), L = mtNameCands();
  MT_SUG = (all ? L : q ? L.filter(n => listaNorm(n).includes(q)) : []).slice(0, all ? 300 : 6);
  box.style.display = MT_SUG.length ? 'block' : 'none'; box.innerHTML = MT_SUG.map((n, i) => `<div onclick="mtNameChoose(${i})">${listaEsc(n)}</div>`).join('');
}
const mtNameType = () => { mtNameSuggest(false); mtShowMine(); };
function mtNameList() { const b = document.getElementById('mt-sug'); if (b.style.display === 'block') b.style.display = 'none'; else mtNameSuggest(true); }
function mtNameChoose(i) { if (!MT_SUG[i]) return; document.getElementById('mt-name').value = MT_SUG[i]; document.getElementById('mt-sug').style.display = 'none'; mtShowMine(); }
function mtCanon(n) {   // usa a grafia do atleta cadastrado ou do inscrito, se for parecido
  n = String(n || '').trim(); if (!n) return ''; const k = listaNorm(n), r = mtSelGrp ? mtRoster(mtSelGrp).find(x => listaNorm(x.name) === k) : null; return r ? r.name : mtResolve(n);
}
function mtShowMine() {
  const m = mtMine(mtCurName(), mtMulti() ? (mtSelGrp || undefined) : ''), el = document.getElementById('mt-mine');
  el.style.display = m ? 'block' : 'none'; el.textContent = '';
  if (m) el.textContent = `Já registrou ${mtKm(m.km)} ${mtUnit()} (${m.n} vez${m.n>1?'es':''}). Este novo registro vai somar.`;
}
function mtUndoBtn() { const b = document.getElementById('mt-undo'); b.style.display = MT_LAST ? 'block' : 'none'; if (MT_LAST) b.textContent = `↩ Desfazer último: ${MT_LAST.name} · ${mtKm(MT_LAST.km)} ${mtUnit()}`; }
async function mtUndo() {
  if (!MT_LAST || !confirm(`Desfazer o registro de ${MT_LAST.name} (${mtKm(MT_LAST.km)} ${mtUnit()})?`)) return;
  const { error } = await sb.from('relay_entries').delete().eq('id', MT_LAST.id);
  if (error) return toast('❌ Não foi possível desfazer');
  MT_LAST = null; mtUndoBtn(); document.getElementById('mt-last').textContent = ''; toast('↩ Registro desfeito'); mtRefresh();
}
async function mtSubmit() {
  if (mtEffClosed()) return toast(mtCapReached() ? '⏰ Tempo esgotado: registros encerrados' : '🔒 Prova encerrada');
  const multi = mtMulti(), grp = multi ? mtSelGrp : '', team = mtTeamMode(), num = parseInt(document.getElementById('mt-num').value); let name = '';
  if (multi && !grp) return toast('⚠️ Escolha a cor da equipe');
  if (team) name = mtCurName() ? mtResolve(mtCurName()) : mtGroup(grp).name;
  else if (multi && num) { const r = mtRoster(grp).find(x => x.n === num); if (!r) return toast(`⚠️ Nº ${num} não cadastrado nesta cor`); name = r.name; }
  else name = mtCanon(mtCurName());
  if (!name) return toast(multi ? '⚠️ Digite o número da pulseira (ou busque pelo nome)' : '⚠️ Digite seu nome');
  const km = mtKmInput();
  if (mtUnit() === 'km' && km > 0 && km < 0.01) return toast('⚠️ Distância mínima: 10 metros');
  if (!(km > 0) || km > 60) return toast(mtUnit() === 'km' ? '⚠️ Informe a distância (mínimo 10 m, máximo 60 km)' : '⚠️ Informe os rounds (máximo 60)');
  if (km > 15 && !confirm(`Confirma ${mtKm(km)} ${mtUnit()} de uma vez?`)) return;
  const btn = document.getElementById('mt-send'); btn.disabled = true;
  if (mtHalf()) { await mtLoadEntries(); const last = mtLastPt(name, multi ? grp : ''), exp = last === 'B' ? 'A' : 'B';   // confere a sequência B → A → B → A
    if (mtPt !== exp && !confirm(`${name}: ${last ? 'o último registro foi no ponto ' + mtPtShort(last) : 'ainda não passou no ponto B (volta)'}. Registrar no ponto ${mtPtShort(mtPt)} mesmo assim?`)) { btn.disabled = false; return; } }
  const { data, error } = await sb.from('relay_entries').insert({ challenge_id:MT_CFG.id, name, km, ...(multi ? { grp } : {}), ...(mtHalf() ? { seconds:mtPt === 'A' ? 1 : 2 } : {}) }).select().single();
  btn.disabled = false;
  if (error) return toast('❌ Não foi possível registrar. Tente de novo.');
  const id = Array.isArray(data) ? (data[0] || {}).id : (data || {}).id; MT_LAST = id ? { id, name, km } : null;
  await mtRefresh(); const mm = mtMine(name, multi ? grp : ''), msg = `✅ ${name} +${mtKm(km)} ${mtUnit()}` + (mtHalf() ? ` (ponto ${mtPtShort(mtPt)})` : '') + (mm ? ` · total ${mtKm(mm.km)} ${mtUnit()}` : '');
  if (multi) {  // registro rápido: a tela fica aberta para o próximo
    document.getElementById('mt-num').value = ''; mtDefaultKm(); document.getElementById('mt-who').textContent = ''; document.getElementById('mt-name').value = ''; mtRosterList();
    document.getElementById('mt-last').textContent = msg; mtUndoBtn(); mtNameChange(); if (!team) document.getElementById('mt-num').focus();
  } else { localStorage.setItem('mt_me', name); document.getElementById('meta-sheet').classList.remove('open'); }
  toast(msg);
}
// — imagem para as redes: PNG 1080x1920 com FUNDO TRANSPARENTE, letra branca ou preta —
let MT_IMG_GID = '', MT_IMG_COLOR = 'white';
function mtWrap(x, t, cx, y, maxW, lh) { const w = t.split(' '); let l = '', ys = y; w.forEach(wd => { const tt = l ? l+' '+wd : wd; if (x.measureText(tt).width > maxW && l) { x.fillText(l, cx, ys); l = wd; ys += lh; } else l = tt; }); x.fillText(l, cx, ys); return ys; }
async function mtMakeImage(gid, fontColor) {
  try { await Promise.all([document.fonts.load('120px "Bebas Neue"'), document.fonts.load('800 40px "Outfit"')]); } catch (e) {}
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');   // nada é pintado no fundo: fica transparente
  const g = mtGroup(gid), col = g.color, T = mtTimes(g.id), a = T.a, goal = g.goal, t0 = T.t0, end = T.end, done = T.done, pct = Math.min(100, Math.round(a.total/goal*100));
  const fg = fontColor === 'black' ? '#0a0a0a' : '#ffffff', sh = fontColor === 'black' ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.55)';
  const rgba = (h, al) => { const [r,gg,b] = bdRGB(h); return `rgba(${r},${gg},${b},${al})`; };
  x.textAlign = 'center'; x.shadowColor = sh; x.shadowBlur = 14; x.fillStyle = fg;
  if (MT_LOGO) { const im = new Image(); await new Promise(r => { im.onload = r; im.onerror = r; im.src = MT_LOGO; }); if (im.width) { const k = Math.min(520/im.width, 190/im.height); x.drawImage(im, W/2-im.width*k/2, 90, im.width*k, im.height*k); } }
  else { x.font = '84px "Bebas Neue",Impact,sans-serif'; x.fillText('CANTIL FITNESS', W/2, 190); }
  const tt = String(MT_CFG.title||'').toUpperCase().replace(/\s+/g, ' ').trim(); let ts = 92;
  const lines = () => { x.font = `${ts}px "Bebas Neue",Impact,sans-serif`; let n = 1, l = ''; tt.split(' ').forEach(w => { const t = l ? l+' '+w : w; if (x.measureText(t).width > 920 && l) { n++; l = w; } else l = t; }); return n; };
  while (lines() > 2 && ts > 52) ts -= 4;
  x.font = `${ts}px "Bebas Neue",Impact,sans-serif`; let ye = mtWrap(x, tt, W/2, 380, 920, ts + 4);
  if (g.name) { let gs = 84; do { x.font = `${gs}px "Bebas Neue",Impact,sans-serif`; gs -= 4; } while (x.measureText(g.name.toUpperCase()).width > 920 && gs > 40); x.fillStyle = col; ye += 92; x.fillText(g.name.toUpperCase(), W/2, ye); }
  const label = done ? 'SUPERADO' : mtEffClosed() ? 'ENCERRADO' : `EM ANDAMENTO  ${pct}%`;
  x.font = '800 44px Outfit,Arial,sans-serif'; const pw = x.measureText(label).width + 80; x.fillStyle = col;
  { const px = W/2-pw/2, py = ye+40, r = 42; x.beginPath(); x.moveTo(px+r,py); x.arcTo(px+pw,py,px+pw,py+84,r); x.arcTo(px+pw,py+84,px,py+84,r); x.arcTo(px,py+84,px,py,r); x.arcTo(px,py,px+pw,py,r); x.closePath(); x.fill(); }
  x.shadowBlur = 0; x.fillStyle = bdLum(col) > 140 ? '#0a0a0a' : '#ffffff'; x.fillText(label, W/2, ye+99); x.shadowColor = sh; x.shadowBlur = 14;
  const rows = a.list.slice(), yTop = ye + 124 + 56;
  if (rows.length) {
    x.fillStyle = fg; x.globalAlpha = .8; x.font = '800 30px Outfit,Arial,sans-serif'; x.fillText('QUANTO CADA UM FEZ', W/2, yTop); x.globalAlpha = 1;
    const cols = rows.length <= 9 ? 1 : rows.length <= 22 ? 2 : 3, fs = [0, 44, 34, 28][cols], rh = Math.round(fs*1.38), y0 = yTop + 62, cap = cols * Math.max(1, Math.floor((1280 - y0) / rh));
    const show = rows.length > cap ? rows.slice(0, cap - 1) : rows, extra = rows.length - show.length, all = show.concat(extra ? [{ name:`+ ${extra} pessoas`, km:null }] : []);
    const per = Math.ceil(all.length / cols), colW = (W - 140 - 40*(cols-1)) / cols;
    all.forEach((p, i) => {
      const cx0 = 70 + Math.floor(i / per) * (colW + 40), yy = y0 + (i % per) * rh, kmT = p.km === null ? '' : mtKm(p.km) + ' ' + mtUnit();
      x.font = `700 ${fs}px Outfit,Arial,sans-serif`; let nm = p.name; const mw = colW - (kmT ? x.measureText(kmT).width + 16 : 0);
      if (x.measureText(nm).width > mw) { while (nm.length > 1 && x.measureText(nm + '…').width > mw) nm = nm.slice(0, -1); nm += '…'; }
      x.textAlign = 'left'; x.fillStyle = fg; x.fillText(nm, cx0, yy);
      if (kmT) { x.textAlign = 'right'; x.fillStyle = col; x.fillText(kmT, cx0 + colW, yy); }
    });
    x.textAlign = 'center';
  } else {
  const kind = MT_CFG.route || 'onda';
  if (kind !== 'none') {
    const rp = mtRoutePts(kind).map(([px, py]) => [90 + px*9, 760 + py*9]), sp = mtRouteSplit(rp, pct);
    const draw = (arr, alpha) => { x.globalAlpha = alpha; x.strokeStyle = col; x.lineWidth = 16; x.lineCap = x.lineJoin = 'round'; x.beginPath(); arr.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); x.globalAlpha = 1; };
    x.shadowColor = rgba(col,.7); x.shadowBlur = 30; draw(rp, .25); draw(sp.done, 1); x.shadowColor = sh; x.shadowBlur = 14;
    x.fillStyle = fg; x.beginPath(); x.arc(rp[0][0], rp[0][1], 20, 0, 7); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(sp.head[0], sp.head[1], 26, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = fg; x.stroke();
  }
  }
  const fit = (t, mk, maxW, sz) => { do { x.font = mk(sz); sz -= 4; } while (x.measureText(t).width > maxW && sz > 40); };
  const big = mtKm(a.total), sub = (mtUnit() === 'km' ? 'QUILÔMETROS' : 'ROUNDS') + (done ? ` · META ${mtKm(goal)} ${mtUnit().toUpperCase()}` : '');
  x.fillStyle = fg; fit(big, s => `${s}px "Bebas Neue",Impact,sans-serif`, 940, 280); x.fillText(big, W/2, 1500);
  fit(sub, s => `${s}px "Bebas Neue",Impact,sans-serif`, 940, 80); x.fillText(sub, W/2, 1598);
  const pers = gid === '' && !mtMulti() ? a.list.length : mtPersons(a, g), cols = [];
  if (pers > 0) cols.push(['PESSOAS', String(pers)]); { const rms = mtRaceMs(); if (rms !== null) cols.push([MT_CFG.endedAt || MT_CFG.closed ? 'TEMPO DE PROVA' : 'TEMPO ATÉ AGORA', mtDur(rms)]); } if (!cols.length) cols.push(['REGISTROS', String(a.n)]);
  cols.forEach(([l, v], i) => { const cx = cols.length === 1 ? W/2 : (i ? 780 : 300); x.fillStyle = fg; x.globalAlpha = .75; x.font = '800 34px Outfit,Arial,sans-serif'; x.fillText(l, cx, 1690); x.globalAlpha = 1; x.font = '120px "Bebas Neue",Impact,sans-serif'; x.fillText(v, cx, 1800); });
  const me = localStorage.getItem('mt_me'), mine = !mtMulti() && me && mtMine(me, g.id);
  x.fillStyle = fg; x.globalAlpha = .8; x.font = '700 34px Outfit,Arial,sans-serif'; x.fillText(mine ? `Eu fiz ${mtKm(mine.km)} ${mtUnit()}  ·  #DesafioCantil` : '#DesafioCantil', W/2, 1880); x.globalAlpha = 1;
  return new Promise(r => c.toBlob(r, 'image/png'));
}
async function mtRenderImage() {
  mtBlob = await mtMakeImage(MT_IMG_GID, MT_IMG_COLOR);
  document.getElementById('meta-img').src = URL.createObjectURL(mtBlob);
  { const dk = MT_IMG_COLOR !== 'black', w = document.getElementById('meta-img-wrap'), c1 = dk ? '#3a3a3a' : '#ffffff', c2 = dk ? '#4f4f4f' : '#d9d9d9'; w.style.backgroundColor = c1; w.style.backgroundImage = `linear-gradient(45deg,${c2} 25%,transparent 25%,transparent 75%,${c2} 75%),linear-gradient(45deg,${c2} 25%,transparent 25%,transparent 75%,${c2} 75%)`; w.style.backgroundSize = '20px 20px'; w.style.backgroundPosition = '0 0,10px 10px'; }
  document.getElementById('mt-c-white').classList.toggle('on', MT_IMG_COLOR === 'white'); document.getElementById('mt-c-black').classList.toggle('on', MT_IMG_COLOR === 'black');
  document.getElementById('meta-img-ov').classList.add('open');
}
async function mtShowImage(gid) { if (!MT_CFG) return; MT_IMG_GID = gid || ''; toast('⏳ Gerando imagem...'); await mtRenderImage(); }
const mtImgColor = c => { MT_IMG_COLOR = c; return mtRenderImage(); };
const mtFile = () => 'desafio-cantil-' + (mtGroup(MT_IMG_GID).name || 'meta').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + MT_IMG_COLOR + '.png';
async function mtCopy() {
  try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': mtBlob })]); toast('📋 Imagem copiada! Nos stories: toque em Aa, segure e cole como figurinha'); }
  catch (e) { toast('⚠️ Este navegador não permite copiar. Use Baixar PNG.'); }
}
function mtDownload() { const a = document.createElement('a'); a.href = URL.createObjectURL(mtBlob); a.download = mtFile(); document.body.appendChild(a); a.click(); a.remove(); }
async function mtShare() {
  const f = new File([mtBlob], mtFile(), { type:'image/png' });
  if (navigator.canShare && navigator.canShare({ files:[f] })) { try { await navigator.share({ files:[f], title:MT_CFG.title }); } catch (e) {} } else mtDownload();
}
// — admin —
let MTA_ROUTE = 'onda';
function mtaRenderRoutes() {
  document.getElementById('mta-routes').innerHTML = Object.keys(MT_ROUTES).map(k => `<button class="bd-opt${k === MTA_ROUTE ? ' on' : ''}" style="display:block;width:100%;text-align:left;margin-bottom:8px;padding:10px 12px" onclick="mtaPickRoute('${k}')"><div>${MT_ROUTES[k]}</div>${k === 'none' ? '' : mtRouteSVG(k, 55, '#e8ff00', 96, { total:21, goal:38, lapKm:parseFloat(String(document.getElementById('mta-lap').value).replace(',', '.')) || 0.4 })}</button>`).join('');
}
function mtaPickRoute(k) { MTA_ROUTE = k; mtaRenderRoutes(); }
function mtaCollect() {
  MTA_GROUPS = MTA_GROUPS.map((g, i) => { const v = id => (document.getElementById(id + i) || {}).value;
    return v('mtg-n') === undefined ? g : { ...g, name:v('mtg-n').trim(), color:v('mtg-c'), goal:v('mtg-g'), rosterText:v('mtg-p') }; });
  return MTA_GROUPS;
}
function mtaRenderGroups() {
  document.getElementById('mta-groups').innerHTML = MTA_GROUPS.map((g, i) => `<div class="mt-card" style="padding:12px;margin-bottom:10px;border-color:${g.color}66">
    <div style="display:flex;gap:8px;margin-bottom:8px"><input type="text" id="mtg-n${i}" value="${listaEsc(g.name)}" placeholder="Nome (ex: Grupo Verde)"><input type="color" id="mtg-c${i}" value="${g.color}" style="width:64px;padding:2px"><span style="color:var(--red);cursor:pointer;align-self:center;padding:0 6px" onclick="mtaDelGroup(${i})">✕</span></div>
    <input type="text" id="mtg-g${i}" inputmode="decimal" value="${g.goal||''}" placeholder="Meta (ex: 38 km ou 40 rounds)" style="margin-bottom:8px">
    <textarea id="mtg-p${i}" rows="5" placeholder="Atletas com nº da pulseira (opcional), um por linha:&#10;1 Ana Souza&#10;2 Bruno Lima&#10;Deixe vazio para equipe sem números.">${listaEsc(g.rosterText || '')}</textarea></div>`).join('');
}
function mtaAddGroup() {
  mtaCollect(); if (MTA_GROUPS.length >= 8) return toast('⚠️ Máximo de 8 equipes');
  const n = MTA_GROUPS.length; MTA_GROUPS.push({ id:'g' + Date.now().toString(36) + n, name:'Equipe ' + ['Verde','Laranja','Azul','Roxo','Vermelha','Amarela','Rosa','Preta'][n], color:['#3de89a','#ff9f43','#5b9dff','#b07cff','#ff5f6d','#ffd060','#ff7ac8','#c8d6e5'][n], goal:document.getElementById('mta-goal').value || 38, rosterText:'' });
  mtaRenderGroups();
}
function mtaDelGroup(i) { mtaCollect(); MTA_GROUPS.splice(i, 1); mtaRenderGroups(); }
function mtResolve(line) { const n = listaNorm(line); let best = null, bs = 0; mtNames().forEach(nm => { const sc = listaScore(n, listaNorm(nm)); if (sc > bs) { bs = sc; best = nm; } }); return bs >= .8 ? best : line.trim(); }
// "12 Ana Souza" → nº 12; linhas sem número recebem o próximo livre; repetidos viram automáticos
function mtParseRoster(text) {
  const rows = [], used = new Set();
  String(text||'').split('\n').map(l => l.trim()).filter(Boolean).forEach(l => {
    const m = l.match(/^(\d{1,4})\s*[-.:)]*\s*(.+)$/), n = m && !used.has(+m[1]) ? +m[1] : null;
    if (n !== null) used.add(n); rows.push({ n, name:m ? m[2].trim() : l }); });
  let next = 1; rows.forEach(r => { if (r.n === null) { while (used.has(next)) next++; r.n = next; used.add(next); } r.name = mtResolve(r.name); });
  return rows.sort((a, b) => a.n - b.n);
}
async function mtAdminInit() {
  await mtLoadCfg(); await loadStaffPw(); MT_LOGO = String((await getSetting('relay_logo', '')) || '');
  try { await getEventInfo(); await loadEventRegistrations(); } catch (e) {}
  const c = MT_CFG || {}, v = (id, val) => document.getElementById(id).value = val ?? '';
  v('mta-title', c.title || 'Desafio 38 km'); v('mta-goal', c.goal || 38); v('mta-lap', c.lapKm || ''); v('mta-src', c.source || 'evento'); v('mta-cp-lat', c.checkpoint ? c.checkpoint.lat : ''); v('mta-cp-lng', c.checkpoint ? c.checkpoint.lng : ''); v('mta-cp-r', c.checkpoint ? c.checkpoint.r : 40); v('mta-cp-min', c.minLapSec || 60); document.getElementById('mta-half').checked = !!c.halfLap; mtCpLinks(); mtRegLinks(); v('mta-unit', c.unit || 'km'); v('mta-cap', c.capSec ? mtClock(c.capSec) : ''); v('mta-capmode', c.capMode || 'down');
  MTA_ROUTE = c.route || 'onda'; mtaRenderRoutes();
  MTA_GROUPS = (c.groups || []).map(g => ({ ...g, rosterText:(g.roster || (g.names||[]).map((n, i) => ({ n:i+1, name:n }))).map(r => r.n + ' ' + r.name).join('\n') })); mtaRenderGroups();
  const lp = document.getElementById('mta-logo-prev'); lp.src = MT_LOGO; lp.style.display = MT_LOGO ? 'block' : 'none';
  v('mta-link', location.origin + location.pathname + '?meta=1'); v('mta-link-tv', location.origin + location.pathname + '?meta=1&tv=1');
  document.getElementById('mta-close').textContent = c.closed ? '▶ Reabrir registros' : '⏹ Encerrar registros';
  /* senha da equipe: agora na aba Config */
  await mtLoadVal().catch(() => {}); const ok = await mtLoadEntries(); document.getElementById('mt-sql-warn').style.display = ok ? 'none' : 'block'; mtAdminList(); mtValRefreshUI();
}
function mtAdminList() {
  const gn = id => { const g = ((MT_CFG && MT_CFG.groups) || []).find(x => x.id === id); return g ? ` <span class="bd-chip" style="margin:0;border-color:${g.color};color:${g.color}">${listaEsc(g.name)}</span>` : ''; };
  document.getElementById('mta-list').innerHTML = MT_ENTRIES.slice(-40).reverse().map(e => `<div class="bd-mem" style="justify-content:space-between"><span>${listaEsc(e.name)} · <b>${mtKm(e.km)} ${mtUnit()}</b>${mtHalf() && (e.seconds === 1 || e.seconds === 2) ? ' · ponto ' + (e.seconds === 1 ? 'A' : 'B') : ''}${gn(e.grp)}</span><span style="cursor:pointer;color:var(--red)" onclick="mtDel(${e.id})">✕</span></div>`).join('') || '<div style="color:var(--muted);font-size:13px">Sem registros.</div>';
}
async function mtDel(id) { if (!confirm('Remover este registro?')) return; await sb.from('relay_entries').delete().eq('id', id); await mtLoadEntries(); mtAdminList(); }
async function mtSaveCfg(extra) {
  const cpNum = id => parseFloat(String(document.getElementById(id).value).replace(',', '.')), cpLat = cpNum('mta-cp-lat'), cpLng = cpNum('mta-cp-lng');
  const checkpoint = isFinite(cpLat) && isFinite(cpLng) ? { lat:cpLat, lng:cpLng, r:Math.max(10, cpNum('mta-cp-r') || 40) } : null, minLapSec = cpNum('mta-cp-min') || 60;
  const staffPw = (MT_CFG && MT_CFG.staffPw) || '';   // senha antiga preservada; a senha atual é a da aba Config
  const num = id => parseFloat(document.getElementById(id).value.replace(',', '.'));
  const groups = mtaCollect().map(g => ({ id:g.id, name:g.name || 'Grupo', color:g.color, goal:parseFloat(String(g.goal).replace(',', '.')), roster:mtParseRoster(g.rosterText) }));
  if (groups.some(g => !(g.goal > 0))) return toast('⚠️ Informe a meta de cada equipe');
  const goal = num('mta-goal') || (groups[0] && groups[0].goal);
  if (!(goal > 0)) return toast('⚠️ Informe a meta');
  MT_CFG = { id:(MT_CFG && MT_CFG.id) || 'm' + Date.now().toString(36), startedAt:null, closed:false, ...(MT_CFG||{}), title:document.getElementById('mta-title').value.trim(), goal, lapKm:num('mta-lap') || '', source:document.getElementById('mta-src').value, groups, staffPw, route:MTA_ROUTE, checkpoint, minLapSec, halfLap:document.getElementById('mta-half').checked, unit:document.getElementById('mta-unit').value, capSec:mtParseTime(document.getElementById('mta-cap').value), capMode:document.getElementById('mta-capmode').value, ...(extra||{}) };
  if (await setSetting('relay_challenge', MT_CFG)) { toast('✅ Salvo!'); mtAdminInit(); }
}
const mtClearPw = () => confirm('Remover a senha? Qualquer pessoa com o link poderá registrar.') && mtSaveCfg({ staffPw:'' });
const mtStart = () => confirm('Iniciar o cronômetro agora?') && mtSaveCfg({ startedAt:new Date().toISOString(), endedAt:null, closed:false });
const mtToggleClosed = () => mtSaveCfg(MT_CFG && MT_CFG.closed ? { closed:false, endedAt:null } : { closed:true, endedAt:new Date().toISOString() });
const mtNewChallenge = () => confirm('Criar um novo desafio? Os registros atuais deixam de aparecer no link.') && (MT_CFG = null, mtSaveCfg());
function mtRegLinks() {
  const half = document.getElementById('mta-half').checked, base = location.origin + location.pathname + '?meta=1&reg=';
  document.getElementById('mta-reg-a').value = base + (half ? 'A' : '1'); document.getElementById('mta-reg-b').value = base + 'B';
  document.getElementById('mta-reg-a-l').textContent = half ? '✍️ Registro · Ponto A' : '✍️ Registro (staff)';
  document.getElementById('mta-reg-b-row').style.display = half ? 'flex' : 'none';
}
function mtCopyLink(id) {
  const i = document.getElementById(id || 'mta-link'), ok = () => toast('📋 Link copiado!');
  if (navigator.clipboard) navigator.clipboard.writeText(i.value).then(ok, () => toast('⚠️ Não foi possível copiar'));
  else { i.style.display = 'block'; i.select(); document.execCommand('copy'); i.style.display = 'none'; ok(); }
}
const mtOpenLink = id => window.open(document.getElementById(id).value, '_blank');
function mtShowQr() { const q = document.getElementById('mta-cp-qr'); if (!(MT_CFG && MT_CFG.checkpoint)) return toast('⚠️ Defina o ponto da volta e salve a configuração primeiro'); q.style.display = q.style.display === 'block' ? 'none' : 'block'; }
function mtLogoPick(inp) {
  const f = inp.files[0]; if (!f) return; const fr = new FileReader();
  fr.onload = () => { const im = new Image(); im.onload = async () => { const k = Math.min(1, 600/im.width), c = document.createElement('canvas'); c.width = im.width*k; c.height = im.height*k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    MT_LOGO = c.toDataURL('image/png'); await setSetting('relay_logo', MT_LOGO); const lp = document.getElementById('mta-logo-prev'); lp.src = MT_LOGO; lp.style.display = 'block'; toast('✅ Logo salva!'); }; im.src = fr.result; };
  fr.readAsDataURL(f);
}

// ── DISTINTIVOS (guardados em app_settings: "badges" e "badge_awards") ──
let BADGES = [], BADGE_AWARDS = {}, bdShape = 'shield', bdEditId = null, bdUid = 0;
const BD_SEL = new Set();
const BD_SHAPES = { wcRound:'🎨 Aquarela redondo', wcShield:'🎨 Aquarela escudo', wcHex:'🎨 Aquarela hexágono', embShield:'🛡️ Emblema escudo', embRound:'🔘 Emblema selo', embStar:'⭐ Emblema estrela', embBanner:'🎗️ Emblema faixa', bravus:'⚔️ Bravus (ouro velho)', shield:'Escudo', medal:'Medalha', star:'Estrela', hex:'Hexágono', diamond:'Losango', seal:'Selo' };
const BD_COLORS = ['#1e6bff','#111111','#f4f4ef','#b8902b','#e8ff00','#ffd060','#3de89a','#5b9dff','#ff5f6d','#b07cff','#ff9f43','#ff7ac8','#c8d6e5','#e8965a'];
const BD_W = { shield:[130,120], medal:[130,120], hex:[130,120], seal:[130,120], star:[96,80], diamond:[110,84] };
const BD_LAY = { shield:[92,140,164], diamond:[86,132,154], hex:[92,138,162], star:[98,142,166], seal:[92,138,162], medal:[78,120,142] };

async function loadBadges() {
  const b = await getSetting('badges', []), a = await getSetting('badge_awards', {});
  BADGES = Array.isArray(b) ? b : [];
  BADGE_AWARDS = (a && typeof a === 'object' && !Array.isArray(a)) ? a : {};
}
function bdRGB(h) { h = String(h||'#e8ff00').replace('#',''); if (h.length===3) h = h.split('').map(x=>x+x).join(''); return [0,2,4].map(i => parseInt(h.substr(i,2),16)||0); }
function bdLum(h) { const [r,g,b] = bdRGB(h); return .299*r + .587*g + .114*b; }
function bdShade(h, f) { const t = f<0?0:255, q = Math.abs(f); return '#' + bdRGB(h).map(v => Math.round(v+(t-v)*q).toString(16).padStart(2,'0')).join(''); }
function bdPoly(cx, cy, R, r, n, rot) { const p=[]; for (let i=0;i<n*2;i++){ const a=rot+Math.PI*i/n, d=i%2?r:R; p.push((cx+d*Math.cos(a)).toFixed(1)+','+(cy+d*Math.sin(a)).toFixed(1)); } return p.join(' '); }
function bdShapeEl(k, at) {
  const T = -Math.PI/2;
  if (k==='shield')  return `<path ${at} d="M100 8L184 34V108C184 160 144 196 100 214C56 196 16 160 16 108V34Z"/>`;
  if (k==='diamond') return `<path ${at} d="M100 6L194 110L100 214L6 110Z"/>`;
  if (k==='hex')     return `<polygon ${at} points="${bdPoly(100,110,102,102,3,T)}"/>`;
  if (k==='star')    return `<polygon ${at} points="${bdPoly(100,114,108,58,5,T)}"/>`;
  if (k==='seal')    return `<polygon ${at} points="${bdPoly(100,110,102,92,18,T)}"/>`;
  return `<circle ${at} cx="100" cy="92" r="84"/>`;
}
// Medalha BRAVUS guerreiro, ouro velho: tudo em vetor (sem imagens), ~3 KB
function bdBravus(b, px) {
  const id = 'bv' + (++bdUid), c = b.color || '#b8902b', hi = bdShade(c,.6), md = bdShade(c,.15), lo = bdShade(c,-.5), dk = '#2b1d05', T = -Math.PI/2;
  const title = String(b.title||'BRAVUS').toUpperCase().slice(0,16), sub = String(b.sub||'GUERREIRO').toUpperCase().slice(0,22);
  const ts = Math.max(11, Math.min(26, Math.floor(130/(title.length*.66)))), ss = Math.max(8, Math.min(12, Math.floor(80/(sub.length*.64))));
  let leaves = '';
  [[132,1],[48,-1]].forEach(([a0,dir]) => { for (let i=0;i<8;i++) {
    const a = (a0 + dir*i*14) * Math.PI/180, x = (100+70*Math.cos(a)).toFixed(1), y = (100+70*Math.sin(a)).toFixed(1), r = ((a*180/Math.PI) + 90 + dir*-28).toFixed(0);
    leaves += `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="8.5" transform="rotate(${r} ${x} ${y})"/>`; } });
  const sword = (m) => { const X = v => m ? 200-v : v;
    return `<path d="M${X(68)} 36L${X(126)} 98" stroke="${dk}" stroke-width="8" stroke-linecap="round"/><path d="M${X(68)} 36L${X(126)} 98" stroke="${hi}" stroke-width="4" stroke-linecap="round"/>
<path d="M${X(83.5)} 42.4L${X(73.3)} 52" stroke="${dk}" stroke-width="6" stroke-linecap="round"/><path d="M${X(83.5)} 42.4L${X(73.3)} 52" stroke="${md}" stroke-width="3" stroke-linecap="round"/><circle cx="${X(68)}" cy="36" r="4" fill="${hi}" stroke="${dk}" stroke-width="1.5"/>`; };
  const emblem = b.emoji ? `<text x="100" y="98" text-anchor="middle" font-size="56">${listaEsc(b.emoji)}</text>`
    : `${sword(0)}${sword(1)}<polygon points="${bdPoly(100,46,11,4.6,5,T)}" fill="${hi}" stroke="${dk}" stroke-width="1.2"/>`;
  return `<svg viewBox="0 0 200 220" width="${px}" height="${Math.round(px*1.1)}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".45" stop-color="${md}"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
<radialGradient id="${id}b" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="${md}"/><stop offset="1" stop-color="${lo}"/></radialGradient></defs>
<path d="M62 168L46 216L74 205L90 218L98 176Z" fill="#8a2323" stroke="#4d1010" stroke-width="2"/><path d="M138 168L154 216L126 205L110 218L102 176Z" fill="#8a2323" stroke="#4d1010" stroke-width="2"/>
<g transform="translate(100 92) scale(.9) translate(-100 -100)">
<polygon points="${bdPoly(100,100,98,91,24,T)}" fill="url(#${id}a)" stroke="${lo}" stroke-width="2"/>
<circle cx="100" cy="100" r="86" fill="none" stroke="${lo}" stroke-width="2"/><circle cx="100" cy="100" r="84" fill="none" stroke="${hi}" stroke-opacity=".7"/>
<circle cx="100" cy="100" r="80" fill="url(#${id}b)" stroke="${lo}" stroke-width="2"/><circle cx="100" cy="100" r="76" fill="none" stroke="${hi}" stroke-opacity=".45"/>
<g fill="${md}" stroke="${dk}" stroke-width="1">${leaves}</g>${emblem}
<polygon points="12,112 188,112 178,128 188,144 12,144 22,128" fill="url(#${id}a)" stroke="${dk}" stroke-width="2"/>
<text x="100" y="${(129+ts*.34+.8).toFixed(1)}" text-anchor="middle" fill="${hi}" font-family="'Bebas Neue','Outfit',sans-serif" font-weight="800" font-size="${ts}" letter-spacing="2">${listaEsc(title)}</text>
<text x="100" y="${(128.2+ts*.34).toFixed(1)}" text-anchor="middle" fill="${dk}" font-family="'Bebas Neue','Outfit',sans-serif" font-weight="800" font-size="${ts}" letter-spacing="2">${listaEsc(title)}</text>
<text x="100" y="164" text-anchor="middle" fill="${hi}" stroke="${dk}" stroke-width=".5" font-family="'Outfit',sans-serif" font-weight="800" font-size="${ss}" letter-spacing="1.5">${listaEsc(sub)}</text></g></svg>`;
}
// Emblemas preto e branco (estilo distintivo): corpo + detalhes em contraste, borda colorida opcional
function bdEmblem(b, px) {
  const k = b.shape, id = 'em' + (++bdUid), body = b.color || '#111111', ink = bdLum(body) > 150 ? '#111111' : '#ffffff', bor = b.accent || ink, T = -Math.PI/2, esc = listaEsc;
  const up = (t, n) => String(t||'').toUpperCase().slice(0, n), top = up(b.top,22), title = up(b.title,16), sub = up(b.sub,22);
  const fsz = (t, base, w) => Math.max(8, Math.min(base, Math.floor(w / ((t.length||1) * .72))));
  const FF = `font-family="'Black Ops One','Bebas Neue',sans-serif" font-weight="400"`;
  const star = (cx, cy, R, f) => `<polygon points="${bdPoly(cx,cy,R,R*.42,5,T)}" fill="${f}"/>`;
  const txt = (x, y, t, sz, f) => t ? `<text x="${x}" y="${y}" text-anchor="middle" fill="${f}" ${FF} font-size="${sz}" letter-spacing="1.5">${esc(t)}</text>` : '';
  const onArc = (pid, r, bottom, t, sz) => t ? `<path id="${id}${pid}" d="M${100-r} 110A${r} ${r} 0 0 ${bottom?0:1} ${100+r} 110" fill="none"/><text fill="${ink}" ${FF} font-size="${sz}" letter-spacing="2" text-anchor="middle"><textPath href="#${id}${pid}" xlink:href="#${id}${pid}" startOffset="50%">${esc(t)}</textPath></text>` : '';
  const center = (cx, cy, R, sz, f) => b.emoji ? `<text x="${cx}" y="${cy+sz*.35}" text-anchor="middle" font-size="${sz}">${esc(b.emoji)}</text>` : star(cx, cy, R, f);
  const leaves = (cx, cy, r, a0, n, step) => { let o = ''; [1,-1].forEach(d => { for (let i=0;i<n;i++) { const a = (a0 + (d>0?0:180-2*a0) + d*i*step) * Math.PI/180, x = (cx+r*Math.cos(a)).toFixed(1), y = (cy+r*Math.sin(a)).toFixed(1);
    o += `<ellipse cx="${x}" cy="${y}" rx="2.8" ry="6.5" transform="rotate(${((a*180/Math.PI)+90-d*28).toFixed(0)} ${x} ${y})"/>`; } }); return `<g fill="${ink}">${o}</g>`; };
  const ribbon = (y0, y1) => `<polygon points="4,${y0} 196,${y0} 184,${(y0+y1)/2} 196,${y1} 4,${y1} 16,${(y0+y1)/2}" fill="${ink}" stroke="${bor}" stroke-width="2"/>`;
  const SH = 'M100 8L184 34V108C184 160 144 196 100 214C56 196 16 160 16 108V34Z';
  let g = '';
  if (k === 'embRound') {
    g = `<circle cx="100" cy="100" r="95" fill="${body}" stroke="${bor}" stroke-width="5"/><circle cx="100" cy="100" r="86" fill="none" stroke="${ink}" stroke-width="1.5"/>
${onArc('t', 66, false, top, fsz(top,15,170))}${center(100, 84, 24, 44, ink)}${ribbon(112,146)}${txt(100, 137, title, fsz(title,24,150), body)}
${txt(100, 172, sub, fsz(sub,13,100), ink)}${star(58,168,6,ink)}${star(142,168,6,ink)}`;
  } else if (k === 'embStar') {
    g = `<polygon points="${bdPoly(100,108,104,68,6,T)}" fill="${body}" stroke="${bor}" stroke-width="5" stroke-linejoin="round"/><circle cx="100" cy="108" r="57" fill="none" stroke="${ink}" stroke-width="2.5"/><circle cx="100" cy="108" r="33" fill="none" stroke="${ink}" stroke-width="1"/>
${onArc('t', 42, false, title, fsz(title,13,105))}${onArc('b', 49, true, sub, fsz(sub,12,115))}${center(100, 108, 17, 30, ink)}`;
  } else if (k === 'embBanner') {
    g = `<path d="${SH}" fill="${body}" stroke="${bor}" stroke-width="5" stroke-linejoin="round"/><g transform="translate(100 110) scale(.9) translate(-100 -110)"><path d="${SH}" fill="none" stroke="${ink}" stroke-width="1.5"/></g>
${leaves(100,118,46,128,5,16)}<circle cx="100" cy="118" r="31" fill="${ink}"/>${center(100, 118, 21, 36, body)}${ribbon(34,70)}${txt(100, 61, title, fsz(title,26,150), body)}
${txt(100, 176, sub, fsz(sub,13,100), ink)}${star(78,194,5,ink)}${star(100,196,6,ink)}${star(122,194,5,ink)}`;
  } else {
    g = `<path d="${SH}" fill="${body}" stroke="${bor}" stroke-width="5" stroke-linejoin="round"/><g transform="translate(100 110) scale(.9) translate(-100 -110)"><path d="${SH}" fill="none" stroke="${ink}" stroke-width="1.5"/></g>
${txt(100, 50, top, fsz(top,14,110), ink)}${leaves(100,88,42,128,5,17)}<circle cx="100" cy="88" r="29" fill="${ink}"/>${center(100, 88, 20, 34, body)}
${txt(100, 166, title, fsz(title,26,120), ink)}${txt(100, 186, sub, fsz(sub,12,100), ink)}`;
  }
  return `<svg viewBox="0 0 200 220" width="${px}" height="${Math.round(px*1.1)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${g}</svg>`;
}
// Emblemas "Aquarela": aro preto, fundo branco, mancha de tinta colorida e monograma grande
function bdWash(b, px) {
  const k = b.shape, id = 'wc' + (++bdUid), col = b.color || '#1e6bff', esc = listaEsc, ink = '#111111', round = k === 'wcRound';
  const up = (t, n) => String(t||'').toUpperCase().slice(0, n), top = up(b.top,22), mono = up(b.title,4), sub = up(b.sub,24);
  const ms = Math.max(38, Math.min(92, Math.floor(124 / ((mono.length||1) * .8))));
  const SH = 'M100 16L182 40V110C182 158 142 192 100 208C58 192 18 158 18 110V40Z';
  const shape = (at) => k === 'wcShield' ? `<path d="${SH}" ${at}/>` : k === 'wcHex' ? `<polygon points="${bdPoly(100,112,98,98,3,-Math.PI/2)}" ${at}/>` : `<circle cx="100" cy="110" r="92" ${at}/>`;
  const tf = b.wash === 'left' ? 'translate(200 0) scale(-1 1)' : b.wash === 'bottom' ? 'rotate(90 100 110)' : '';
  const dark = bdShade(col,-.28), light = bdShade(col,.45);
  const subSize = Math.max(7, Math.min(12, Math.floor((((round ? 138 : 96) / (sub.length||1)) - 4) / .62)));
  const subEl = !sub ? '' : round
    ? `<path id="${id}p" d="M26 110A74 74 0 0 0 174 110" fill="none"/><text fill="${ink}" font-family="'Outfit',sans-serif" font-weight="800" font-size="${subSize}" letter-spacing="4.5" text-anchor="middle"><textPath href="#${id}p" xlink:href="#${id}p" startOffset="50%">${esc(sub)}</textPath></text>`
    : `<text x="100" y="${k==='wcHex'?170:172}" text-anchor="middle" fill="${ink}" font-family="'Outfit',sans-serif" font-weight="800" font-size="${subSize}" letter-spacing="4">${esc(sub)}</text>`;
  const stars = [76,100,124].map(x => `<polygon points="${bdPoly(x,50,5,2.2,5,-Math.PI/2)}" fill="${ink}"/>`).join('');
  return `<svg viewBox="0 0 200 220" width="${px}" height="${Math.round(px*1.1)}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<defs><clipPath id="${id}c">${shape('')}</clipPath>
<filter id="${id}f" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="${id}g"><feGaussianBlur stdDeviation="2.4"/></filter>
<filter id="${id}t" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 ${(bdRGB(dark)[0]/255).toFixed(3)} 0 0 0 0 ${(bdRGB(dark)[1]/255).toFixed(3)} 0 0 0 0 ${(bdRGB(dark)[2]/255).toFixed(3)} 0 0 0 1.8 -.72" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in"/></filter></defs>
${shape('fill="#ffffff"')}
<g clip-path="url(#${id}c)"><g transform="${tf}"><g filter="url(#${id}f)">
<path d="M118 0C134 14 120 30 110 46C100 60 122 68 130 82C140 94 128 106 136 120C146 136 128 152 118 172C112 186 108 198 104 220L220 220L220 0Z" fill="${col}" fill-opacity=".9"/>
<path d="M118 0C134 14 120 30 110 46C100 60 122 68 130 82C140 94 128 106 136 120C146 136 128 152 118 172C112 186 108 198 104 220L220 220L220 0Z" fill="#000" filter="url(#${id}t)"/>
<path d="M156 24C170 56 142 88 156 120C166 150 140 172 132 200L220 220L220 10Z" fill="${dark}" fill-opacity=".45" filter="url(#${id}g)"/>
<ellipse cx="132" cy="96" rx="13" ry="26" fill="${light}" fill-opacity=".4" filter="url(#${id}g)"/>
<circle cx="98" cy="56" r="2.4" fill="${col}"/><circle cx="92" cy="152" r="3.2" fill="${col}"/><circle cx="104" cy="122" r="1.7" fill="${col}"/></g></g></g>
${shape('fill="none" stroke="#f4f4ef" stroke-width="13"')}${shape(`fill="none" stroke="${ink}" stroke-width="8"`)}
${stars}
${top ? `<text x="100" y="72" text-anchor="middle" fill="${ink}" font-family="'Outfit',sans-serif" font-weight="800" font-size="${Math.max(7, Math.min(13, Math.floor(112/(top.length*.72))))}" letter-spacing="2.5">${esc(top)}</text>` : ''}
<text x="100" y="${(112+ms*.4).toFixed(1)}" text-anchor="middle" fill="${ink}" font-family="'Archivo Black','Arial Black',sans-serif" font-size="${ms}" letter-spacing="-1">${esc(mono)}</text>
${subEl}</svg>`;
}
function bdSVG(b, px) {
  if (b.shape === 'bravus') return bdBravus(b, px);
  if (String(b.shape).startsWith('wc')) return bdWash(b, px);
  if (String(b.shape).startsWith('emb')) return bdEmblem(b, px);
  const id = 'bg' + (++bdUid), c = b.color || '#e8ff00', hi = bdShade(c,.35), lo = bdShade(c,-.35);
  const tx = bdLum(c) > 150 ? '#1a1a14' : '#ffffff', k = BD_LAY[b.shape] ? b.shape : 'shield', [ey,ty,sy] = BD_LAY[k];
  const title = String(b.title||'').toUpperCase().slice(0,18), sub = String(b.sub||'').toUpperCase().slice(0,26);
  const [tw, sw] = BD_W[k], base = title.length<=8 ? 30 : title.length<=12 ? 24 : 19;
  const ts = Math.max(11, Math.min(base, Math.floor(tw/((title.length||1)*.62)))), ss = Math.max(8, Math.min(12, Math.floor(sw/((sub.length||1)*.62))));
  const esc = listaEsc;
  const ribbon = k==='medal' ? `<path d="M62 150L46 214L80 198L98 160Z M138 150L154 214L120 198L102 160Z" fill="${lo}"/>` : '';
  const cy = k==='medal' ? 92 : 110;
  return `<svg viewBox="0 0 200 220" width="${px}" height="${Math.round(px*1.1)}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>${ribbon}
${bdShapeEl(k, `fill="url(#${id})" stroke="${lo}" stroke-width="3"`)}
<g transform="translate(100 ${cy}) scale(.86) translate(-100 -${cy})">${bdShapeEl(k, `fill="none" stroke="${tx}" stroke-opacity=".4" stroke-width="3"`)}</g>
<text x="100" y="${ey+16}" text-anchor="middle" font-size="${k==='star'?40:52}">${esc(b.emoji||'')}</text>
<text x="100" y="${ty}" text-anchor="middle" fill="${tx}" font-family="'Bebas Neue','Outfit',sans-serif" font-weight="800" font-size="${ts}" letter-spacing="1">${esc(title)}</text>
<text x="100" y="${sy}" text-anchor="middle" fill="${tx}" fill-opacity=".85" font-family="'Outfit',sans-serif" font-weight="700" font-size="${ss}">${esc(sub)}</text></svg>`;
}
function bdHolders(id) { return (BADGE_AWARDS[id]||[]).filter(a => MEMBERS.some(m => m.id===a.m)); }
function bdMini(mid) {
  const own = BADGES.filter(b => (BADGE_AWARDS[b.id]||[]).some(a => a.m===mid));
  return own.length ? `<span class="bd-mini">${own.slice(0,4).map(b=>bdSVG(b,20)).join('')}${own.length>4?'+'+(own.length-4):''}</span>` : '';
}
function renderBadgesPublic() {
  const wrap = document.getElementById('badges-wrap'); if (!wrap) return;
  wrap.style.display = BADGES.length ? 'block' : 'none';
  document.getElementById('badges-grid').innerHTML = BADGES.map(b => { const n = bdHolders(b.id).length;
    return `<div class="bd-card" onclick="bdOpen('${b.id}')">${bdSVG(b,96)}<div class="bd-name">${listaEsc(b.name||b.title||'')}</div><div class="bd-count">${n?n+(n===1?' pessoa':' pessoas'):'ninguém ainda'}</div></div>`; }).join('');
}
function bdOpen(id) {
  const b = BADGES.find(x => x.id===id); if (!b) return;
  const hs = bdHolders(id).map(a => { const m = MEMBERS.find(x => x.id===a.m); return `<span class="bd-chip">${m.emoji||''} ${listaEsc(m.name)}</span>`; }).join('');
  document.getElementById('bd-box').innerHTML = `${bdSVG(b,150)}<div style="font-weight:800;font-size:18px;margin-top:8px">${listaEsc(b.name||'')}</div>
    ${b.desc?`<div style="font-size:13px;color:var(--muted);margin-top:6px;white-space:pre-line">${listaEsc(b.desc)}</div>`:''}
    <div class="section-label" style="margin-top:16px">Quem conquistou</div><div>${hs||'<span style="color:var(--muted);font-size:13px">Ninguém ainda.</span>'}</div>
    <button class="btn-sm-danger" style="margin-top:16px;width:100%;padding:12px" onclick="document.getElementById('bd-ov').classList.remove('open')">Fechar</button>`;
  document.getElementById('bd-ov').classList.add('open');
}
// — admin —
function bdForm() { return { shape:bdShape, color:document.getElementById('bd-color').value, name:document.getElementById('bd-name').value.trim(), emoji:document.getElementById('bd-emoji').value.trim(), wash:document.getElementById('bd-wash').value, top:document.getElementById('bd-top').value.trim(), accent:document.getElementById('bd-accent-on').checked ? document.getElementById('bd-accent').value : '', title:document.getElementById('bd-title').value.trim(), sub:document.getElementById('bd-sub').value.trim(), desc:document.getElementById('bd-desc').value.trim() }; }
function bdPreview() { document.getElementById('bd-preview').innerHTML = bdSVG(bdForm(), 170); }
function bdDrawOpts() {
  document.getElementById('bd-shapes').innerHTML = Object.entries(BD_SHAPES).map(([k,v]) => `<button class="bd-opt${k===bdShape?' on':''}" onclick="bdPickShape('${k}')">${v}</button>`).join('');
  const cur = document.getElementById('bd-color').value.toLowerCase();
  document.getElementById('bd-colors').innerHTML = BD_COLORS.map(c => `<button class="bd-sw${c===cur?' on':''}" style="background:${c}" onclick="bdPickColor('${c}')"></button>`).join('');
}
function bdPickShape(k) { bdShape = k;
  if (k.startsWith('wc')) { document.getElementById('bd-color').value = '#1e6bff';
    [['bd-name','Distintivo Aquarela'],['bd-top','CANTIL FITNESS'],['bd-title','CF'],['bd-sub','TEAM CANTIL']].forEach(([i,v]) => { const e = document.getElementById(i); if (!e.value) e.value = v; }); }
  if (k.startsWith('emb')) { document.getElementById('bd-color').value = '#111111';
    [['bd-name','Distintivo Cantil'],['bd-top','CANTIL FITNESS'],['bd-title','FINISHER'],['bd-sub','2026']].forEach(([i,v]) => { const e = document.getElementById(i); if (!e.value) e.value = v; }); }
  if (k === 'bravus') { document.getElementById('bd-color').value = '#b8902b';
    [['bd-name','Bravus Guerreiro'],['bd-title','BRAVUS'],['bd-sub','GUERREIRO']].forEach(([i,v]) => { const e = document.getElementById(i); if (!e.value) e.value = v; }); } bdDrawOpts(); bdPreview(); }
function bdPickColor(c) { document.getElementById('bd-color').value = c; bdDrawOpts(); bdPreview(); }
function bdReset() {
  bdEditId = null; bdShape = 'shield';
  ['bd-name','bd-emoji','bd-top','bd-title','bd-sub','bd-desc'].forEach(i => document.getElementById(i).value = ''); document.getElementById('bd-accent-on').checked = false; document.getElementById('bd-wash').value = 'right';
  document.getElementById('bd-color').value = '#e8ff00'; bdDrawOpts(); bdPreview();
}
function bdEdit(id) {
  const b = BADGES.find(x => x.id===id); if (!b) return;
  bdEditId = id; bdShape = b.shape || 'shield';
  document.getElementById('bd-name').value = b.name||''; document.getElementById('bd-emoji').value = b.emoji||'';
  document.getElementById('bd-title').value = b.title||''; document.getElementById('bd-sub').value = b.sub||''; document.getElementById('bd-top').value = b.top||''; document.getElementById('bd-wash').value = b.wash || 'right'; document.getElementById('bd-accent-on').checked = !!b.accent; if (b.accent) document.getElementById('bd-accent').value = b.accent;
  document.getElementById('bd-desc').value = b.desc||''; document.getElementById('bd-color').value = b.color || '#e8ff00';
  bdDrawOpts(); bdPreview(); document.getElementById('bd-preview').scrollIntoView({ behavior:'smooth', block:'center' });
}
async function bdPersist() {
  const ok = await setSetting('badges', BADGES) && await setSetting('badge_awards', BADGE_AWARDS);
  renderBadgesPublic(); renderRanking(); bdRenderList(); bdRenderAwardSelect();
  return ok;
}
async function bdSave() {
  const f = bdForm(); if (!f.name) return toast('⚠️ Dê um nome ao distintivo');
  if (bdEditId) BADGES = BADGES.map(b => b.id===bdEditId ? { ...f, id:bdEditId } : b);
  else BADGES.push({ ...f, id:'b' + Date.now().toString(36) });
  if (await bdPersist()) { toast('✅ Distintivo salvo!'); bdReset(); }
}
async function bdDelete(id) {
  if (!confirm('Excluir este distintivo e retirar de todos que o receberam?')) return;
  BADGES = BADGES.filter(b => b.id!==id); delete BADGE_AWARDS[id]; await bdPersist(); toast('🗑️ Distintivo excluído');
}
async function bdRevoke(id, mid) {
  BADGE_AWARDS[id] = (BADGE_AWARDS[id]||[]).filter(a => a.m!==mid); await bdPersist();
}
function bdRenderList() {
  const el = document.getElementById('bd-list');
  if (!BADGES.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px">Nenhum distintivo criado ainda.</div>'; return; }
  el.innerHTML = BADGES.map(b => { const hs = bdHolders(b.id);
    return `<div style="background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:12px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px">${bdSVG(b,56)}
        <div style="flex:1;min-width:0"><div style="font-weight:800">${listaEsc(b.name)}</div><div style="font-size:11px;color:var(--muted)">${hs.length} pessoa(s)</div></div>
        <button class="btn-sm-danger" onclick="bdEdit('${b.id}')">editar</button><button class="btn-sm-danger" onclick="bdDelete('${b.id}')">🗑️</button></div>
      <div>${hs.map(a => { const m = MEMBERS.find(x => x.id===a.m); return `<span class="bd-chip">${listaEsc(m.name)} <span style="cursor:pointer;color:var(--red)" onclick="bdRevoke('${b.id}',${m.id})">✕</span></span>`; }).join('')}</div></div>`; }).join('');
}
function bdRenderAwardSelect() {
  const sel = document.getElementById('bd-award-badge'), cur = sel.value;
  sel.innerHTML = BADGES.length ? BADGES.map(b => `<option value="${b.id}" ${b.id===cur?'selected':''}>${listaEsc(b.name)}</option>`).join('') : '<option value="">— crie um distintivo primeiro —</option>';
  bdRenderMembers();
}
function bdToggle(id, on) { on ? BD_SEL.add(id) : BD_SEL.delete(id); bdRenderMembers(true); }
function bdRenderMembers(keep) {
  const bid = document.getElementById('bd-award-badge').value, q = listaNorm(document.getElementById('bd-search').value);
  const held = new Set((BADGE_AWARDS[bid]||[]).map(a => a.m));
  document.getElementById('bd-members').innerHTML = MEMBERS.slice().sort((a,b) => a.name.localeCompare(b.name,'pt-BR')).filter(m => !q || listaNorm(m.name).includes(q)).map(m =>
    `<label class="bd-mem"><input type="checkbox" style="width:20px;height:20px" ${held.has(m.id)?'checked disabled':BD_SEL.has(m.id)?'checked':''} onchange="bdToggle(${m.id},this.checked)"> ${m.emoji||''} ${listaEsc(m.name)}${held.has(m.id)?' <span style="color:var(--green);font-size:11px">✓ já tem</span>':''}</label>`).join('');
  const n = BD_SEL.size, btn = document.getElementById('bd-award-btn');
  btn.textContent = `🎖️ Conceder a ${n} pessoa${n===1?'':'s'}`; btn.disabled = !n || !bid;
}
async function bdAward() {
  const bid = document.getElementById('bd-award-btn') && document.getElementById('bd-award-badge').value;
  if (!bid || !BD_SEL.size) return;
  const d = new Date().toISOString().slice(0,10), list = BADGE_AWARDS[bid] || [];
  BD_SEL.forEach(m => { if (!list.some(a => a.m===m)) list.push({ m, d }); });
  BADGE_AWARDS[bid] = list; const n = BD_SEL.size; BD_SEL.clear();
  if (await bdPersist()) toast(`🎖️ Distintivo concedido a ${n} pessoa${n===1?'':'s'}!`);
}
function bdInit() { bdDrawOpts(); bdPreview(); bdRenderList(); bdRenderAwardSelect(); }

function renderDesafiosView() {
  renderBadgesPublic();
  const abertos = CHALLENGE_VIDEOS.filter(v => v.is_open !== false);
  const minis = CHALLENGE_VIDEOS.filter(v => v.is_open === false);
  renderVideoGrid('desafios-grid', abertos, 'Nenhum desafio em destaque ainda.', 'open');
  document.getElementById('desafios-mini-label').style.display = minis.length ? 'block' : 'none';
  renderMiniList('desafios-mini-list', minis);
}

function renderMiniList(elId, videos) {
  const el = document.getElementById(elId);
  if (!videos.length) { el.innerHTML=''; return; }
  el.innerHTML = `<div class="mini-list">` + videos.map(v => `
    <div class="mini-row" onclick="window.open('${v.youtube_url}','_blank')">
      <div class="mini-thumb-wrap"><img src="${buildThumbUrl(v.video_id)}" alt="${v.title}" loading="lazy"></div>
      <div class="mini-info">
        <div class="mini-title">${v.title}</div>
        ${v.description ? `<div class="mini-desc">${v.description}</div>` : ''}
      </div>
    </div>`).join('') + `</div>`;
}

// ── DESAFIOS (admin) ──
async function addChallengeVideo() {
  const title = document.getElementById('cv-title').value.trim();
  const url = document.getElementById('cv-url').value.trim();
  const description = document.getElementById('cv-desc').value.trim();
  const is_open = document.getElementById('cv-category').value === 'true';
  if (!title) return toast('⚠️ Digite o título!');
  const id = extractYouTubeId(url);
  if (!id) return toast('⚠️ Link do YouTube inválido!');
  const { data, error } = await sb.from('challenge_videos').insert({ title, youtube_url: buildShortUrl(id), video_id: id, description, is_open }).select();
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }
  CHALLENGE_VIDEOS.unshift(data[0]);
  challengesLoaded = true;
  document.getElementById('cv-title').value='';
  document.getElementById('cv-url').value='';
  document.getElementById('cv-desc').value='';
  renderChallengesAdminList();
  toast('✅ Short de desafio publicado!');
}

async function toggleChallengeCategory(id, newVal) {
  await sb.from('challenge_videos').update({ is_open: newVal }).eq('id', id);
  const v = CHALLENGE_VIDEOS.find(v=>v.id===id);
  if (v) v.is_open = newVal;
  renderChallengesAdminList();
}

let editingChallengeId = null;
function renderChallengesAdminList() {
  const el = document.getElementById('challenges-admin-list');
  if (!CHALLENGE_VIDEOS.length) { el.innerHTML='<div style="color:var(--muted);font-size:13px">Nenhum desafio ainda.</div>'; return; }
  el.innerHTML = CHALLENGE_VIDEOS.map(v => {
    if (editingChallengeId === v.id) {
      return `
      <div class="vid-chip" style="flex-direction:column;align-items:stretch;gap:10px;padding:14px 0">
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Título</label><input type="text" id="ecv-title-${v.id}" value="${v.title.replace(/"/g,'&quot;')}"></div>
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Link do YouTube</label><input type="text" id="ecv-url-${v.id}" value="${v.youtube_url}"></div>
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Descrição</label><input type="text" id="ecv-desc-${v.id}" value="${(v.description||'').replace(/"/g,'&quot;')}"></div>
        <div class="field-group" style="margin-bottom:0">
          <label class="field-label">Categoria</label>
          <select id="ecv-category-${v.id}" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
            <option value="true" ${v.is_open!==false?'selected':''}>🔓 Aberto (destaque, card grande)</option>
            <option value="false" ${v.is_open===false?'selected':''}>📋 Lista (miniatura)</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-blue" style="flex:1;padding:10px" onclick="saveEditChallenge(${v.id})">💾 Salvar</button>
          <button class="btn" style="flex:1;padding:10px;background:var(--s2);color:var(--text)" onclick="cancelEditChallenge()">Cancelar</button>
        </div>
      </div>`;
    }
    return `
    <div class="vid-chip">
      <img class="vid-chip-thumb" src="${buildThumbUrl(v.video_id)}" alt="">
      <div class="vid-chip-title">${v.title}${v.description ? `<div style="color:var(--muted);font-size:11px;font-weight:400">${v.description}</div>` : ''}</div>
      <span class="category-badge ${v.is_open !== false ? 'open' : 'mini'}" onclick="toggleChallengeCategory(${v.id}, ${v.is_open === false})">${v.is_open !== false ? '🔓 ABERTO' : '📋 MINI'}</span>
      <button class="btn-sm-danger" style="background:none;color:var(--muted);border:1px solid var(--border)" onclick="startEditChallenge(${v.id})">✏️</button>
      <button class="btn-sm-danger" onclick="deleteChallengeVideo(${v.id})">✕</button>
    </div>`;
  }).join('');
}

function startEditChallenge(id) { editingChallengeId = id; renderChallengesAdminList(); }
function cancelEditChallenge() { editingChallengeId = null; renderChallengesAdminList(); }
async function saveEditChallenge(id) {
  const title = document.getElementById(`ecv-title-${id}`).value.trim();
  const url = document.getElementById(`ecv-url-${id}`).value.trim();
  const description = document.getElementById(`ecv-desc-${id}`).value.trim();
  const is_open = document.getElementById(`ecv-category-${id}`).value === 'true';
  if (!title) return toast('⚠️ Digite o título!');
  const vid = extractYouTubeId(url);
  if (!vid) return toast('⚠️ Link do YouTube inválido!');
  const { error } = await sb.from('challenge_videos').update({ title, youtube_url: buildShortUrl(vid), video_id: vid, description, is_open }).eq('id', id);
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }
  const v = CHALLENGE_VIDEOS.find(v=>v.id===id);
  if (v) Object.assign(v, { title, youtube_url: buildShortUrl(vid), video_id: vid, description, is_open });
  editingChallengeId = null;
  renderChallengesAdminList();
  toast('✅ Desafio atualizado!');
}

async function deleteChallengeVideo(id) {
  await sb.from('challenge_videos').delete().eq('id', id);
  CHALLENGE_VIDEOS = CHALLENGE_VIDEOS.filter(v=>v.id!==id);
  renderChallengesAdminList();
  toast('🗑️ Removido!');
}

// ══════════════════════════════════════════════
//  EVENTO
// ══════════════════════════════════════════════
let EVENT_INFO = null;
let EVENT_REGISTRATIONS = [];
let eventRegLoaded = false;
let eventIsMember = false;

function defaultEventInfo() {
  return { id:null, name:'', meta:'', desc:'', max:0, points:10, active:false, result_type:null, time_cap_seconds:0 };
}
async function getEventInfo() {
  if (EVENT_INFO) return EVENT_INFO;
  EVENT_INFO = await getSetting('event_info', defaultEventInfo());
  return EVENT_INFO;
}
async function loadEventRegistrations() {
  const { data, error } = await sb.from('event_registrations').select('*').order('created_at', { ascending:false });
  if (error) { console.error(error); toast('⚠️ Erro ao carregar inscrições'); return []; }
  EVENT_REGISTRATIONS = data || [];
  eventRegLoaded = true;
  return EVENT_REGISTRATIONS;
}

// ── Público ──
function formatTimeCap(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds/60);
  const s = seconds%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

async function renderResultsBoard(info) {
  const board = document.getElementById('results-board');
  await loadResultNotes();

  if (info.is_dual) {
    await renderDualResultsBoard(info);
    return;
  }

  if (!info.result_type) { board.style.display = 'none'; setEventDetailsCollapsed(false); return; }

  const regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id && r.result_value);
  if (!regs.length) { board.style.display = 'none'; setEventDetailsCollapsed(false); return; }

  const groupDescs = await getSetting('level_descriptions', {});
  const capLabel = formatTimeCap(info.time_cap_seconds);
  const titleEl = document.getElementById('results-title');
  if (titleEl) {
    titleEl.innerHTML = capLabel
      ? `<span style="color:var(--red);font-weight:800">TIME CAP: ${capLabel}</span>`
      : '';
  }

  const html = renderResultsGroupsHtml(regs, info.result_type, groupDescs);
  document.getElementById('results-groups').innerHTML = html;
  board.style.display = html ? '' : 'none';
  setEventDetailsCollapsed(!!html);
}

// Gera o HTML dos grupos (Verde/Amarelo/Laranja) para uma lista de inscrições e um tipo de resultado
function renderResultsGroupsHtml(regs, resultType, groupDescs, resultField) {
  resultField = resultField || 'result_value';
  const groupsOrder = [
    { key:'Iniciante', emoji:'🟢', name:'Verde' },
    { key:'Intermediário', emoji:'🟡', name:'Amarelo' },
    { key:'Avançado', emoji:'🟠', name:'Laranja' }
  ];
  const colLabel = resultType === 'tempo' ? 'TEMPO DE PROVA' : 'RESULTADO';
  let html = '';
  groupsOrder.forEach(g => {
    const items = regs.filter(r => (r.fitness_level||'Iniciante') === g.key)
                       .slice().sort((a,b)=>a.name.localeCompare(b.name));
    if (!items.length) return;
    const desc = groupDescs[g.key];
    // Se o admin escreveu uma descrição pra essa categoria (ex: "2K"), ela vira
    // o título principal do grupo — assim o resultado mostra a mesma categoria
    // que a pessoa escolheu ao se inscrever, não o nome fixo Verde/Amarelo/Laranja
    const titleText = desc ? desc : `Grupo ${g.name}`;
    html += `
      <div class="results-group">
        <div class="results-group-title">${g.emoji} ${titleText}</div>
        <div class="results-list">
          <div class="results-header-row"><span>PARTICIPANTES</span><span>${colLabel}</span></div>
          ${items.map(r => `
            <div class="results-item">
              <span class="results-item-name">${r.name}${getResultNote(r, resultField.replace('result_value','')) ? `<span class="results-item-note">${tvEsc(getResultNote(r, resultField.replace('result_value','')))}</span>` : ''}</span>
              <span class="results-item-value">${r[resultField]}</span>
            </div>`).join('')}
        </div>
      </div>`;
  });
  return html;
}

// Versão para eventos com 2 sub-eventos: renderiza 2 blocos de resultado separados,
// cada um só com quem tem resultado lançado NAQUELE sub-evento específico
async function renderDualResultsBoard(info) {
  const board = document.getElementById('results-board');
  const hasType1 = !!info.result_type_1;
  const hasType2 = !!info.result_type_2;
  if (!hasType1 && !hasType2) { board.style.display = 'none'; setEventDetailsCollapsed(false); return; }

  const groupDescs = await getSetting('level_descriptions', {});
  const allRegs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);

  const regs1 = hasType1 ? allRegs.filter(r => r.result_value_1) : [];
  const regs2 = hasType2 ? allRegs.filter(r => r.result_value_2) : [];

  if (!regs1.length && !regs2.length) { board.style.display = 'none'; setEventDetailsCollapsed(false); return; }

  const titleEl = document.getElementById('results-title');
  if (titleEl) titleEl.innerHTML = '';

  let html = '';

  if (regs1.length) {
    const cap1 = formatTimeCap(info.time_cap_seconds_1);
    html += `<div class="results-subevent-header">🥇 ${info.sub1_name || 'Evento 1'}${cap1 ? ` <span style="color:var(--red);font-weight:800">— TIME CAP: ${cap1}</span>` : ''}</div>`;
    html += renderResultsGroupsHtml(regs1, info.result_type_1, groupDescs, 'result_value_1');
  }
  if (regs2.length) {
    const cap2 = formatTimeCap(info.time_cap_seconds_2);
    html += `<div class="results-subevent-header">🥈 ${info.sub2_name || 'Evento 2'}${cap2 ? ` <span style="color:var(--red);font-weight:800">— TIME CAP: ${cap2}</span>` : ''}</div>`;
    html += renderResultsGroupsHtml(regs2, info.result_type_2, groupDescs, 'result_value_2');
  }

  document.getElementById('results-groups').innerHTML = html;
  board.style.display = html ? '' : 'none';
  setEventDetailsCollapsed(!!html);
}

// Quando o evento já tem resultados lançados, o card de descrição/imagem do evento
// fica recolhido por padrão (mostrando só o nome), dando prioridade visual aos resultados.
// A pessoa pode clicar para expandir e ver os detalhes completos se quiser.
function setEventDetailsCollapsed(shouldOffer) {
  const toggleBtn = document.getElementById('event-details-toggle');
  const detailsBody = document.getElementById('event-details-body');
  if (!toggleBtn || !detailsBody) return;
  if (shouldOffer) {
    toggleBtn.style.display = 'block';
    detailsBody.style.display = 'none';
    toggleBtn.textContent = '📋 Ver detalhes do evento';
    toggleBtn.dataset.expanded = '0';
  } else {
    toggleBtn.style.display = 'none';
    detailsBody.style.display = '';
  }
}

// Resultados públicos: só o título "RESULTADOS" aparece; toque para abrir/fechar
function toggleResultsBoard() {
  const body = document.getElementById('results-body'), tg = document.getElementById('results-toggle');
  if (!body || !tg) return;
  const open = body.style.display === 'none';
  body.style.display = open ? '' : 'none';
  tg.setAttribute('aria-expanded', open ? 'true' : 'false');
  tg.classList.toggle('open', open);
}

function toggleEventDetails() {
  const toggleBtn = document.getElementById('event-details-toggle');
  const detailsBody = document.getElementById('event-details-body');
  const expanded = toggleBtn.dataset.expanded === '1';
  detailsBody.style.display = expanded ? 'none' : '';
  toggleBtn.textContent = expanded ? '📋 Ver detalhes do evento' : '🔼 Ocultar detalhes';
  toggleBtn.dataset.expanded = expanded ? '0' : '1';
}

// % de vagas livres: nunca mostra 0% enquanto ainda sobra vaga (ex: 199 de 200)
function capPctAvail(count, max) {
  if (!(max > 0)) return null;
  if (count >= max) return 0;
  return Math.max(1, Math.ceil(((max - count) / max) * 100));
}
// A pessoa está inscrita neste sub-evento? (evita contar errado quando um nome contém o outro)
function evRegInSub(r, name, other) {
  let t = r.sub_events || '';
  if (other && other !== name && other.includes(name)) t = t.split(other).join('');
  return t.includes(name);
}

async function renderEventPublicView() {
  const info = await getEventInfo();
  if (!eventRegLoaded) await loadEventRegistrations();

  await renderResultsBoard(info);
  await populateLevelSelect();

  document.getElementById('event-name').textContent = info.name || 'Nenhum evento no momento';

  if (info.is_dual) {
    // Em evento duplo, o cabeçalho principal fica só com o nome do evento;
    // data/local e descrição de cada prova aparecem nos cards separados abaixo
    document.getElementById('event-meta').textContent = '';
    document.getElementById('event-desc').innerHTML = '';
  } else {
    document.getElementById('event-meta').textContent = info.meta || '';
    document.getElementById('event-desc').innerHTML = linkify(info.desc || '');
  }

  const imgEl = document.getElementById('event-image-display');
  if (imgEl) {
    if (info.image) { imgEl.src = info.image; imgEl.style.display = 'block'; }
    else { imgEl.style.display = 'none'; }
  }

  const dualWrap = document.getElementById('ev-dual-select-wrap');
  if (info.is_dual) {
    document.getElementById('ev-sub1-label').textContent = info.sub1_name || 'Evento 1';
    document.getElementById('ev-sub2-label').textContent = info.sub2_name || 'Evento 2';
    dualWrap.style.display = '';
  } else {
    dualWrap.style.display = 'none';
    document.getElementById('ev-sub1-check').checked = false;
    document.getElementById('ev-sub2-check').checked = false;
  }

  // Pergunta extra customizável (habilitada e escrita pelo admin, evento por evento)
  const customQWrap = document.getElementById('ev-custom-q-field-wrap');
  if (!info.is_dual && info.custom_question_enabled && info.custom_question_label) {
    document.getElementById('ev-custom-q-field-label').textContent = info.custom_question_label;
    document.getElementById('ev-custom-q-answer').value = '';
    customQWrap.style.display = '';
  } else {
    customQWrap.style.display = 'none';
  }

  try { await renderWhatsappButton(); } catch (e) { console.error('WhatsApp:', e); }

  const rules = String((await getEventRules()) ?? '');
  const rulesWrap = document.getElementById('event-rules-wrap');
  if (rules) {
    document.getElementById('event-rules-text').innerHTML = linkify(rules);
    rulesWrap.style.display = '';
  } else {
    rulesWrap.style.display = 'none';
  }

  const currentRegs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
  const capWrap = document.getElementById('event-capacity-wrap');
  const formWrap = document.getElementById('event-form-wrap');
  const jumpBtn = document.getElementById('jump-to-form-btn');

  let isFull, isClosed;

  if (info.is_dual) {
    const sub1Name = info.sub1_name || 'Evento 1';
    const sub2Name = info.sub2_name || 'Evento 2';
    const count1 = currentRegs.filter(r => evRegInSub(r, sub1Name, sub2Name)).length;
    const count2 = currentRegs.filter(r => evRegInSub(r, sub2Name, sub1Name)).length;
    const max1 = info.max_1 || 0;
    const max2 = info.max_2 || 0;
    const active1 = info.active_1 !== false;
    const active2 = info.active_2 !== false;
    const full1 = max1 > 0 && count1 >= max1;
    const full2 = max2 > 0 && count2 >= max2;
    const closed1 = !active1 || full1;
    const closed2 = !active2 || full2;

    // Esconde a capacidade genérica única — cada sub-evento mostra a sua própria dentro do checkbox
    capWrap.style.display = 'none';

    // Monta os 2 cards de informação (nome, data/local, descrição e % de vagas) de cada sub-evento
    const infoBlocksEl = document.getElementById('event-dual-info-blocks');
    if (infoBlocksEl) {
      const pctText1 = closed1
        ? (!active1 ? '🚫 Inscrições fechadas' : '🎟️ Vagas esgotadas')
        : (max1 > 0 ? `🎟️ ${capPctAvail(count1, max1)}% das vagas disponíveis` : '✅ Inscrições abertas');
      const pctText2 = closed2
        ? (!active2 ? '🚫 Inscrições fechadas' : '🎟️ Vagas esgotadas')
        : (max2 > 0 ? `🎟️ ${capPctAvail(count2, max2)}% das vagas disponíveis` : '✅ Inscrições abertas');

      infoBlocksEl.innerHTML = `
        <div class="dual-info-card dual-info-card-1">
          <div class="dual-info-title">🥇 ${sub1Name}</div>
          ${info.meta_1 ? `<div class="dual-info-meta">${info.meta_1}</div>` : ''}
          ${info.desc_1 ? `<div class="dual-info-desc">${linkify(info.desc_1)}</div>` : ''}
          <div class="dual-info-capacity ${closed1 ? 'full' : 'ok'}">${pctText1}</div>
        </div>
        <div class="dual-info-card dual-info-card-2">
          <div class="dual-info-title">🥈 ${sub2Name}</div>
          ${info.meta_2 ? `<div class="dual-info-meta">${info.meta_2}</div>` : ''}
          ${info.desc_2 ? `<div class="dual-info-desc">${linkify(info.desc_2)}</div>` : ''}
          <div class="dual-info-capacity ${closed2 ? 'full' : 'ok'}">${pctText2}</div>
        </div>`;
      infoBlocksEl.style.display = 'flex';
    }

    const cap1El = document.getElementById('ev-sub1-capacity');
    const cap2El = document.getElementById('ev-sub2-capacity');
    const sub1CheckWrap = document.getElementById('ev-sub1-wrap');
    const sub2CheckWrap = document.getElementById('ev-sub2-wrap');
    const sub1Check = document.getElementById('ev-sub1-check');
    const sub2Check = document.getElementById('ev-sub2-check');

    if (closed1) {
      cap1El.textContent = !active1 ? '🚫 Inscrições fechadas' : '🎟️ Vagas esgotadas';
      sub1CheckWrap.style.opacity = '0.45';
      sub1Check.disabled = true;
      sub1Check.checked = false;
    } else {
      const pctAvail1 = max1 > 0 ? capPctAvail(count1, max1) : null;
      cap1El.textContent = max1 > 0 ? `🎟️ ${pctAvail1}% das vagas disponíveis` : '✅ Inscrições abertas';
      sub1CheckWrap.style.opacity = '1';
      sub1Check.disabled = false;
    }

    if (closed2) {
      cap2El.textContent = !active2 ? '🚫 Inscrições fechadas' : '🎟️ Vagas esgotadas';
      sub2CheckWrap.style.opacity = '0.45';
      sub2Check.disabled = true;
      sub2Check.checked = false;
    } else {
      const pctAvail2 = max2 > 0 ? capPctAvail(count2, max2) : null;
      cap2El.textContent = max2 > 0 ? `🎟️ ${pctAvail2}% das vagas disponíveis` : '✅ Inscrições abertas';
      sub2CheckWrap.style.opacity = '1';
      sub2Check.disabled = false;
    }

    // O formulário inteiro só some se os DOIS sub-eventos estiverem fechados/lotados
    isClosed = !info.name;
    isFull = closed1 && closed2;
  } else {
    const infoBlocksEl = document.getElementById('event-dual-info-blocks');
    if (infoBlocksEl) infoBlocksEl.style.display = 'none';

    const count = currentRegs.length;
    const max = info.max || 0;
    if (max > 0) {
      capWrap.style.display = '';
      const pctFilled = Math.min(100, (count/max)*100);
      const pctAvailable = capPctAvail(count, max);
      const fill = document.getElementById('capacity-fill');
      fill.style.width = pctFilled+'%';
      fill.classList.toggle('full', count >= max);
      const text = document.getElementById('capacity-text');
      if (count >= max) {
        text.textContent = '🎟️ Vagas esgotadas';
      } else if (pctAvailable <= 20) {
        text.textContent = `🔥 Últimas vagas — ${pctAvailable}% disponíveis, corre!`;
      } else {
        text.textContent = `🎟️ ${pctAvailable}% das vagas ainda disponíveis`;
      }
    } else {
      capWrap.style.display = 'none';
    }
    isFull = max > 0 && count >= max;
    isClosed = !info.name || info.active === false;
  }

  // populate member select
  const sel = document.getElementById('ev-member-select');
  sel.innerHTML = MEMBERS.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(m=>`<option value="${m.id}">${m.emoji} ${m.name}</option>`).join('');

  // Sempre remove a mensagem de "fechado/esgotado" antiga antes de decidir se
  // precisa mostrar uma nova — evita que várias mensagens empilhem na tela
  // toda vez que o evento é salvo com o status fechado.
  const existingClosedMsg = document.getElementById('event-closed-msg');
  if (existingClosedMsg) existingClosedMsg.remove();

  if (isClosed || isFull) {
    formWrap.style.display = 'none';
    if (jumpBtn) jumpBtn.style.display = 'none';
    let msg = isClosed ? 'Inscrições fechadas no momento.' : 'Vagas esgotadas! 🎉';
    capWrap.insertAdjacentHTML('afterend', `<div class="capacity-full-msg" id="event-closed-msg">${msg}</div>`);
  } else {
    formWrap.style.display = '';
    if (jumpBtn) jumpBtn.style.display = 'block';
  }

  // Controla se o botão "Visitante" fica disponível — só quando o admin liberou
  // essa opção especificamente pra este evento (padrão: liberado, se não configurado)
  const visitorBtn = document.getElementById('mt-not-member');
  const allowVisitor = info.is_dual ? true : (info.allow_visitor !== false);
  if (visitorBtn) {
    visitorBtn.disabled = !allowVisitor;
    visitorBtn.style.opacity = allowVisitor ? '1' : '0.4';
    visitorBtn.style.cursor = allowVisitor ? 'pointer' : 'not-allowed';
    visitorBtn.title = allowVisitor ? '' : 'Inscrições de visitantes fechadas para este evento — só membros/alunos do CT';
  }
}

function goToEventForm() {
  const wrap = document.getElementById('event-form-wrap');
  if (!wrap) return;
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const t = wrap.querySelector('.member-toggle');
  if (t) { t.classList.remove('attn'); void t.offsetWidth; t.classList.add('attn'); }
}

function setEventPersonType(isInternal) {
  // Proteção extra: mesmo que o botão "Visitante" seja clicado forçadamente
  // (ex: via inspecionar elemento), bloqueia se o admin desativou essa opção
  if (!isInternal) {
    const info = EVENT_INFO || defaultEventInfo();
    const allowVisitor = info.is_dual ? true : (info.allow_visitor !== false);
    if (!allowVisitor) {
      toast('🚫 Inscrições de visitantes estão fechadas para este evento. Só membros/alunos do CT podem se inscrever.');
      return;
    }
  }
  eventIsMember = isInternal; // mantém nome da variável por compatibilidade interna
  document.getElementById('mt-is-member').classList.toggle('active', isInternal);
  document.getElementById('mt-not-member').classList.toggle('active', !isInternal);
  document.getElementById('event-fields-wrap').style.display = 'block';
  document.getElementById('ev-internal-checks-wrap').style.display = isInternal ? '' : 'none';
  document.getElementById('ev-age-wrap').style.display = isInternal ? 'none' : '';
  document.getElementById('ev-source-wrap').style.display = isInternal ? 'none' : '';
  document.getElementById('ev-referral-wrap').style.display = 'none';
  if (isInternal) {
    document.getElementById('ev-source').value = 'Instagram';
  } else {
    document.getElementById('ev-is-clube').checked = false;
    document.getElementById('ev-is-ct').checked = false;
  }
  toggleInternalFields();
  setTimeout(() => document.getElementById('event-form-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}

function toggleInternalFields() {
  const isInternal = eventIsMember;
  const isClube = isInternal && document.getElementById('ev-is-clube').checked;
  const isCTOnly = isInternal && document.getElementById('ev-is-ct').checked && !isClube;
  // Se for membro do clube, seleciona o nome na lista; senão, digita o nome (visitante ou aluno do CT sem ser membro)
  document.getElementById('ev-member-select-wrap').style.display = isClube ? '' : 'none';
  document.getElementById('ev-name-wrap').style.display = isClube ? 'none' : '';
  // Aluno do CT (sem ser membro do clube com ranking) precisa confirmar telefone,
  // pra podermos comparar corretamente com a lista de bloqueados por falta
  document.getElementById('ev-phone-wrap').style.display = (isCTOnly || !isInternal) ? '' : 'none';
  // Repopula a lista de nomes toda vez que "Membro do Clube" é marcado — corrige o
  // bug de aparecer vazio quando MEMBERS ainda não tinha sido carregado antes
  if (isClube) {
    const sel = document.getElementById('ev-member-select');
    if (sel) {
      sel.innerHTML = MEMBERS.slice().sort((a,b)=>a.name.localeCompare(b.name))
        .map(m=>`<option value="${m.id}">${m.emoji||''} ${m.name}</option>`).join('');
    }
  }
}

function toggleReferralField() {
  const isReferral = document.getElementById('ev-source').value === 'Indicação de amigo(a)';
  document.getElementById('ev-referral-wrap').style.display = isReferral ? '' : 'none';
}

async function submitEventRegistration() {
  const info = await getEventInfo();
  document.getElementById('ev-error').textContent = '';
  document.getElementById('ev-blocked').style.display = 'none';

  // Proteção final: bloqueia envio se for visitante e o admin fechou essa opção
  // pra este evento (evita inscrição feita numa janela em que a página não
  // teve tempo de reagir à mudança do admin)
  if (!eventIsMember) {
    const allowVisitor = info.is_dual ? true : (info.allow_visitor !== false);
    if (!allowVisitor) {
      return toast('🚫 Inscrições de visitantes estão fechadas para este evento. Só membros/alunos do CT podem se inscrever.');
    }
  }

  const isClube = eventIsMember && document.getElementById('ev-is-clube').checked;
  const isCT = eventIsMember && document.getElementById('ev-is-ct').checked;
  if (eventIsMember && !isClube && !isCT) return toast('⚠️ Marque ao menos uma opção: Membro do Clube ou Aluno do CT!');

  let name, memberId = null;
  if (isClube) {
    const sel = document.getElementById('ev-member-select');
    memberId = parseInt(sel.value);
    const m = MEMBERS.find(m=>m.id===memberId);
    if (!m) return toast('⚠️ Selecione seu nome!');
    name = m.name;
  } else {
    name = document.getElementById('ev-name').value.trim();
    if (!name) return toast('⚠️ Digite seu nome!');
  }
  const age = eventIsMember ? null : (parseInt(document.getElementById('ev-age').value) || null);
  const level = document.getElementById('ev-level').value;
  const needsPhone = !isClube; // Visitante e Aluno do CT (sem ranking) precisam confirmar telefone
  const phone = needsPhone ? document.getElementById('ev-phone').value.trim() : '';
  const heardFrom = eventIsMember ? null : document.getElementById('ev-source').value;
  const isReferral = !eventIsMember && heardFrom === 'Indicação de amigo(a)';
  const referredBy = isReferral ? document.getElementById('ev-referral').value.trim() : null;
  if (needsPhone && !phone) return toast('⚠️ Digite seu telefone!');
  if (isReferral && !referredBy) return toast('⚠️ Digite o nome de quem indicou!');
  if (!document.getElementById('ev-consent').checked) return toast('⚠️ Você precisa concordar com os termos pra continuar!');

  // Se o evento tem 2 sub-eventos, a pessoa precisa marcar pelo menos 1
  let subEvents = null;
  if (info.is_dual) {
    const sub1 = document.getElementById('ev-sub1-check').checked;
    const sub2 = document.getElementById('ev-sub2-check').checked;
    if (!sub1 && !sub2) return toast('⚠️ Marque em qual(is) evento(s) você quer se inscrever!');
    const parts = [];
    if (sub1) parts.push(info.sub1_name || 'Evento 1');
    if (sub2) parts.push(info.sub2_name || 'Evento 2');
    subEvents = parts.join(' + ');
  }

  // Checa lista de faltantes de eventos anteriores.
  // Regra: só bloqueia quem realmente está na lista de "faltou" (attended === false,
  // ou attended_1/attended_2 === false em eventos com 2 sub-eventos),
  // comparando pelo critério certo conforme o tipo de inscrição:
  //  - Membro do Clube (tem member_id cadastrado no ranking) → compara por member_id
  //  - Aluno do CT (sem ranking) ou Visitante → compara por telefone, e SÓ se o telefone
  //    foi realmente informado (nunca compara telefone vazio com telefone vazio)
  let blocked = null;
  if (isClube && memberId) {
    const { data } = await sb.from('event_registrations')
      .select('id').or('attended.eq.false,attended_1.eq.false,attended_2.eq.false').eq('member_id', memberId).limit(1);
    blocked = data;
  } else if (phone) {
    const { data } = await sb.from('event_registrations')
      .select('id').or('attended.eq.false,attended_1.eq.false,attended_2.eq.false').eq('phone', phone).limit(1);
    blocked = data;
  }
  if (blocked && blocked.length) {
    document.getElementById('ev-blocked').style.display = 'block';
    return;
  }

  const customAnswer = (!info.is_dual && info.custom_question_enabled)
    ? document.getElementById('ev-custom-q-answer').value.trim()
    : null;

  const { error } = await sb.from('event_registrations').insert({
    event_name: info.name, event_id: info.id, name, age, fitness_level: level, phone, heard_from: heardFrom, referred_by: referredBy,
    is_member: isClube, is_ct_student: isCT, member_id: isClube ? memberId : null,
    sub_events: subEvents, custom_answer: customAnswer
  });
  if (error) { console.error(error); toast('⚠️ Erro ao inscrever'); return; }

  document.getElementById('ev-name').value='';
  document.getElementById('ev-age').value='';
  document.getElementById('ev-phone').value='';
  document.getElementById('ev-referral').value='';
  document.getElementById('ev-consent').checked = false;
  document.getElementById('ev-is-clube').checked = false;
  document.getElementById('ev-is-ct').checked = false;
  document.getElementById('ev-sub1-check').checked = false;
  document.getElementById('ev-sub2-check').checked = false;
  document.getElementById('mt-is-member').classList.remove('active');
  document.getElementById('mt-not-member').classList.remove('active');
  document.getElementById('event-fields-wrap').style.display = 'none';
  eventRegLoaded = false;
  await loadEventRegistrations();
  try { await ensureBibs(info); } catch (e) { console.error(e); }       // dá o próximo nº de inscrição de cada prova
  await renderEventPublicView();
  try { renderRegistrationsList(); } catch (e) { console.error(e); }   // atualiza também a lista do admin

  const mine = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id && r.name === name).sort((a, b) => b.id - a.id)[0];
  let successDetail;
  if (subEvents) {
    const n1 = info.sub1_name || 'Evento 1', n2 = info.sub2_name || 'Evento 2';
    const parts = [];
    if (mine) {
      if (evRegInSub(mine, n1, n2)) parts.push(n1 + (bibOf(mine, '1') != null ? ` (nº ${bibPad(bibOf(mine, '1'))})` : ''));
      if (evRegInSub(mine, n2, n1)) parts.push(n2 + (bibOf(mine, '2') != null ? ` (nº ${bibPad(bibOf(mine, '2'))})` : ''));
    }
    successDetail = `Você está inscrito(a) em: ${parts.length ? parts.join(' + ') : subEvents}`;
  } else {
    successDetail = `${name}, sua vaga em ${info.name} está garantida!` + ((mine && bibOf(mine, '0') != null) ? ` Seu número de inscrição: ${bibPad(bibOf(mine, '0'))}` : '');
  }
  showRegistrationConfirm(successDetail);
}

function showRegistrationConfirm(detailText) {
  const overlay = document.getElementById('registration-confirm-overlay');
  const detailEl = document.getElementById('registration-confirm-detail');
  if (!overlay || !detailEl) return;
  detailEl.textContent = detailText;
  overlay.classList.add('show');
}

function closeRegistrationConfirm() {
  const overlay = document.getElementById('registration-confirm-overlay');
  if (overlay) overlay.classList.remove('show');
}

// ── Admin ──
let currentSubEventContext = '1'; // '1' ou '2' — qual sub-evento está sendo configurado/lançado no painel de resultados

async function renderEventAdminView() {
  const info = await getEventInfo();
  document.getElementById('ev-cfg-name').value = info.name || '';
  document.getElementById('ev-cfg-rules').value = await getEventRules();
  document.getElementById('ev-cfg-dual').checked = !!info.is_dual;
  document.getElementById('ev-cfg-sub1').value = info.sub1_name || '';
  document.getElementById('ev-cfg-sub2').value = info.sub2_name || '';

  if (info.is_dual) {
    // Campos duplicados por sub-evento
    document.getElementById('ev-cfg-meta-1').value = info.meta_1 || '';
    document.getElementById('ev-cfg-meta-2').value = info.meta_2 || '';
    document.getElementById('ev-cfg-desc-1').value = info.desc_1 || '';
    document.getElementById('ev-cfg-desc-2').value = info.desc_2 || '';
    document.getElementById('ev-cfg-points-1').value = info.points_1 ?? 10;
    document.getElementById('ev-cfg-points-2').value = info.points_2 ?? 10;
    document.getElementById('ev-cfg-result-type-1').value = info.result_type_1 || '';
    document.getElementById('ev-cfg-result-type-2').value = info.result_type_2 || '';
    document.getElementById('ev-cfg-max-1').value = info.max_1 || '';
    document.getElementById('ev-cfg-max-2').value = info.max_2 || '';
    document.getElementById('ev-cfg-active-1').value = info.active_1 === false ? 'false' : 'true';
    document.getElementById('ev-cfg-active-2').value = info.active_2 === false ? 'false' : 'true';
    document.getElementById('ev-cfg-sub1-header').textContent = '🥇 ' + (info.sub1_name || 'Evento 1');
    document.getElementById('ev-cfg-sub2-header').textContent = '🥈 ' + (info.sub2_name || 'Evento 2');
  } else {
    document.getElementById('ev-cfg-meta').value = info.meta || '';
    document.getElementById('ev-cfg-desc').value = info.desc || '';
    document.getElementById('ev-cfg-max').value = info.max || '';
    document.getElementById('ev-cfg-active').value = info.active === false ? 'false' : 'true';
    document.getElementById('ev-cfg-points').value = info.points ?? 10;
    document.getElementById('ev-cfg-result-type').value = info.result_type || '';
    document.getElementById('ev-cfg-allow-visitor').value = info.allow_visitor === false ? 'false' : 'true';
    document.getElementById('ev-cfg-custom-q-enabled').checked = !!info.custom_question_enabled;
    document.getElementById('ev-cfg-custom-q-label').value = info.custom_question_label || '';
    toggleCustomQuestionField();
  }
  toggleDualEventFields();
  fillTimeCapFields(info);
  renderLiveControls(info);

  const imgPreviewWrap = document.getElementById('event-image-preview-wrap');
  if (info.image) {
    document.getElementById('event-image-preview').src = info.image;
    imgPreviewWrap.style.display = 'block';
  } else {
    imgPreviewWrap.style.display = 'none';
  }

  await loadEventRegistrations();   // sempre busca de novo: evita lista de inscritos desatualizada
  try { await ensureBibs(info); } catch (e) { console.error(e); }
  renderRegistrationsList();
  renderNoShowList();

  // Seletor de contexto (qual sub-evento estamos lançando resultado agora)
  const subSelWrap = document.getElementById('result-subevent-selector-wrap');
  if (info.is_dual) {
    subSelWrap.style.display = '';
    const subSel = document.getElementById('result-subevent-select');
    subSel.innerHTML = `
      <option value="1">${info.sub1_name || 'Evento 1'}</option>
      <option value="2">${info.sub2_name || 'Evento 2'}</option>`;
    subSel.value = currentSubEventContext;
  } else {
    subSelWrap.style.display = 'none';
    currentSubEventContext = '1';
  }

  refreshResultPanelForContext(info);
  populateResultSelect();
  await loadLevelDescriptionsIntoForm();
}

// Ajusta o painel de "Lançar Resultados" (time cap, tipo de resultado, rótulos)
// conforme qual sub-evento está selecionado no contexto atual
function refreshResultPanelForContext(info) {
  const isDual = info.is_dual;
  const resultType = isDual
    ? (currentSubEventContext === '2' ? info.result_type_2 : info.result_type_1)
    : info.result_type;
  const capSec = isDual
    ? (currentSubEventContext === '2' ? (info.time_cap_seconds_2||0) : (info.time_cap_seconds_1||0))
    : (info.time_cap_seconds || 0);

  const hasResultType = !!resultType;
  document.getElementById('result-entry-label').style.display = hasResultType ? '' : 'none';
  document.getElementById('result-panel-wrap').style.display = hasResultType ? '' : 'none';

  const isTempo = resultType === 'tempo';
  document.getElementById('result-tempo-helper').style.display = isTempo ? '' : 'none';
  document.getElementById('result-final-label').textContent = isTempo
    ? 'Resultado final (editável — corrige se estiver errado)'
    : 'Resultado (rounds/reps)';

  document.getElementById('result-timecap-display').textContent = capSec ? formatTime(capSec) : '—';
}

function onSubEventContextChange() {
  currentSubEventContext = document.getElementById('result-subevent-select').value;
  const info = EVENT_INFO || defaultEventInfo();
  refreshResultPanelForContext(info);
  populateResultSelect();
}

let startingFreshEvent = false;

// ── IMAGEM DO EVENTO (comprimida em quadrado, formato post Instagram) ──
function compressImageToSquare(file, maxSize = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        // Corta em quadrado (crop central) e redimensiona — formato post Instagram
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Reduz qualidade progressivamente se ainda estiver grande (limite ~200KB)
        let q = quality;
        while (dataUrl.length > 270000 && q > 0.3) {
          q -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', q);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleEventImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('⚠️ Selecione um arquivo de imagem!'); return; }
  toast('⏳ Otimizando imagem...');
  try {
    const compressed = await compressImageToSquare(file);
    const info = await getEventInfo();
    const newInfo = { ...info, image: compressed };
    const ok = await setSetting('event_info', newInfo);
    if (!ok) return;
    EVENT_INFO = newInfo;
    document.getElementById('event-image-preview').src = compressed;
    document.getElementById('event-image-preview-wrap').style.display = 'block';
    const sizeKb = Math.round(compressed.length / 1024);
    toast(`✅ Imagem salva! (~${sizeKb}KB)`);
  } catch (err) {
    console.error(err);
    toast('⚠️ Erro ao processar imagem');
  }
}

async function removeEventImage(skipConfirm) {
  if (!skipConfirm && !confirm('Remover a imagem deste evento?')) return;
  const info = await getEventInfo();
  const newInfo = { ...info, image: null };
  const ok = await setSetting('event_info', newInfo);
  if (!ok) return;
  EVENT_INFO = newInfo;
  document.getElementById('event-image-preview-wrap').style.display = 'none';
  document.getElementById('ev-cfg-image-input').value = '';
  if (!skipConfirm) toast('🗑️ Imagem removida!');
}

async function updateEventConfig() {
  const name = document.getElementById('ev-cfg-name').value.trim();
  const isDual = document.getElementById('ev-cfg-dual').checked;
  const sub1Name = document.getElementById('ev-cfg-sub1').value.trim() || 'Evento 1';
  const sub2Name = document.getElementById('ev-cfg-sub2').value.trim() || 'Evento 2';
  if (!name) return toast('⚠️ Digite o nome do evento!');
  const prevInfo = await getEventInfo();
  // O ID só muda se ainda não existir um, ou se "Começar evento novo" foi clicado antes de salvar.
  // Editar nome/descrição/vagas normalmente NUNCA muda o ID — por isso os inscritos não somem.
  const isFirstIdEver = !prevInfo.id;
  const id = (startingFreshEvent || isFirstIdEver) ? ('ev_' + Date.now()) : prevInfo.id;
  startingFreshEvent = false;
  // Migração: se esse evento já tinha inscritos de antes desta atualização (sem event_id ainda),
  // vincula eles ao novo ID automaticamente, pra não "sumir" da lista.
  if (isFirstIdEver && prevInfo.name) {
    await sb.from('event_registrations').update({ event_id: id }).eq('event_name', prevInfo.name).is('event_id', null);
    eventRegLoaded = false;
    await loadEventRegistrations();
  }

  let newInfo;
  if (isDual) {
    // Cada sub-evento tem seus próprios pontos, tipo de resultado, vagas, status, data/local e descrição
    const points1 = parseInt(document.getElementById('ev-cfg-points-1').value) || 0;
    const points2 = parseInt(document.getElementById('ev-cfg-points-2').value) || 0;
    const resultType1 = document.getElementById('ev-cfg-result-type-1').value || null;
    const resultType2 = document.getElementById('ev-cfg-result-type-2').value || null;
    const max1 = parseInt(document.getElementById('ev-cfg-max-1').value) || 0;
    const max2 = parseInt(document.getElementById('ev-cfg-max-2').value) || 0;
    const active1 = document.getElementById('ev-cfg-active-1').value === 'true';
    const active2 = document.getElementById('ev-cfg-active-2').value === 'true';
    const meta1 = document.getElementById('ev-cfg-meta-1').value.trim();
    const meta2 = document.getElementById('ev-cfg-meta-2').value.trim();
    const desc1 = document.getElementById('ev-cfg-desc-1').value.trim();
    const desc2 = document.getElementById('ev-cfg-desc-2').value.trim();
    newInfo = {
      id, name,
      image: prevInfo.image || null,
      is_dual: true, sub1_name: sub1Name, sub2_name: sub2Name,
      meta_1: meta1, meta_2: meta2, desc_1: desc1, desc_2: desc2,
      points_1: points1, points_2: points2,
      result_type_1: resultType1, result_type_2: resultType2,
      max_1: max1, max_2: max2,
      active_1: active1, active_2: active2,
      time_cap_seconds_1: capFrom('ev-cfg-timecap-min-1', 'ev-cfg-timecap-sec-1'),
      time_cap_seconds_2: capFrom('ev-cfg-timecap-min-2', 'ev-cfg-timecap-sec-2'),
      // mantém campos únicos zerados/nulos pra não confundir eventos simples antigos
      meta: '', desc: '', points: 0, result_type: null, time_cap_seconds: 0, max: 0, active: active1 || active2
    };
  } else {
    const meta = document.getElementById('ev-cfg-meta').value.trim();
    const desc = document.getElementById('ev-cfg-desc').value.trim();
    const max = parseInt(document.getElementById('ev-cfg-max').value) || 0;
    const active = document.getElementById('ev-cfg-active').value === 'true';
    const points = parseInt(document.getElementById('ev-cfg-points').value) || 0;
    const result_type = document.getElementById('ev-cfg-result-type').value || null;
    const allowVisitor = document.getElementById('ev-cfg-allow-visitor').value === 'true';
    const customQEnabled = document.getElementById('ev-cfg-custom-q-enabled').checked;
    const customQLabel = document.getElementById('ev-cfg-custom-q-label').value.trim();
    newInfo = {
      id, name, meta, desc, max, points, active, result_type, allow_visitor: allowVisitor,
      custom_question_enabled: customQEnabled, custom_question_label: customQLabel,
      time_cap_seconds: capFrom('ev-cfg-timecap-min', 'ev-cfg-timecap-sec'), image: prevInfo.image || null,
      is_dual: false, sub1_name: sub1Name, sub2_name: sub2Name
    };
  }

  // A liberação do link da equipe sobrevive ao "Salvar Evento"; evento novo começa bloqueado
  EVENT_INFO = null; const freshInfo = await getEventInfo();            // pega o relógio mais recente
  const sameEv = id === freshInfo.id;
  newInfo.live_sub = (sameEv && (freshInfo.live_sub === '1' || (freshInfo.live_sub === '2' && isDual))) ? freshInfo.live_sub : '';
  newInfo.clk = sameEv ? (freshInfo.clk || {}) : {};
  const ok = await setSetting('event_info', newInfo);
  if (!ok) return;
  EVENT_INFO = newInfo;
  try {
    renderRegistrationsList();
    await renderEventAdminView();
    await renderEventPublicView();
  } catch (err) {
    console.error('Erro ao atualizar a tela após salvar (mas o evento FOI salvo):', err);
  }
  toast('✅ Evento salvo com sucesso!');
}

function toggleDualEventFields() {
  const isDual = document.getElementById('ev-cfg-dual').checked;
  document.getElementById('ev-dual-fields-wrap').style.display = isDual ? '' : 'none';
  document.getElementById('ev-single-fields-wrap').style.display = isDual ? 'none' : '';
  document.getElementById('ev-single-meta-desc-wrap').style.display = isDual ? 'none' : '';
  document.getElementById('ev-dual-config-wrap').style.display = isDual ? '' : 'none';
  document.getElementById('ev-cfg-max-wrap').style.display = isDual ? 'none' : '';
}

function toggleCustomQuestionField() {
  const enabled = document.getElementById('ev-cfg-custom-q-enabled').checked;
  document.getElementById('ev-cfg-custom-q-wrap').style.display = enabled ? '' : 'none';
}

// Regras do evento — fixas, valem para todos os eventos, editáveis a qualquer momento
async function getEventRules() {
  return await getSetting('event_rules', '');
}
async function updateEventRules() {
  const rules = document.getElementById('ev-cfg-rules').value.trim();
  const ok = await setSetting('event_rules', rules);
  if (!ok) return;
  toast('✅ Regras atualizadas!');
}

async function startNewEvent() {
  const info = EVENT_INFO || defaultEventInfo();
  const currentRegs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
  const isNoShow = r => r.attended === false || r.attended_1 === false || r.attended_2 === false;
  const toDelete = currentRegs.filter(r => !isNoShow(r));
  const toKeep = currentRegs.filter(isNoShow);

  const msg = toDelete.length
    ? `Isso vai APAGAR ${toDelete.length} inscrição(ões) deste evento (mantendo ${toKeep.length} faltante(s) na lista de bloqueio). Antes de apagar, um arquivo com todos os resultados fica salvo com link permanente. Continuar?`
    : 'Isso limpa o formulário pra você preencher um evento novo. Continuar?';
  if (!confirm(msg)) return;

  let archiveUrl = null;
  let archiveFailed = false;
  if (toDelete.length && info.id) {
    // Salva um "arquivo" congelado do evento (nome, resultados, presença) ANTES de apagar,
    // pra gerar um link permanente que continua funcionando mesmo depois do evento sumir
    archiveUrl = await archiveEventResults(info, toDelete);
    if (!archiveUrl) archiveFailed = true;
  }

  if (archiveFailed) {
    const proceed = confirm('⚠️ NÃO foi possível salvar o arquivo de resultados (verifique se a tabela "event_archives" existe no Supabase). Se continuar, as inscrições serão apagadas SEM backup. Deseja continuar mesmo assim?');
    if (!proceed) return;
  }

  if (toDelete.length) {
    const idsToDelete = toDelete.map(r => r.id);
    const { error } = await sb.from('event_registrations').delete().in('id', idsToDelete);
    if (error) { toast('⚠️ Erro ao apagar inscrições'); console.error(error); return; }
    EVENT_REGISTRATIONS = EVENT_REGISTRATIONS.filter(r => !idsToDelete.includes(r.id));
  }

  // Limpa TODOS os campos do formulário — evento único e evento duplo
  document.getElementById('ev-cfg-name').value = '';
  document.getElementById('ev-cfg-meta').value = '';
  document.getElementById('ev-cfg-desc').value = '';
  document.getElementById('ev-cfg-max').value = '';
  document.getElementById('ev-cfg-points').value = '';
  document.getElementById('ev-cfg-result-type').value = '';
  document.getElementById('ev-cfg-active').value = 'true';
  document.getElementById('ev-cfg-dual').checked = false;
  document.getElementById('ev-cfg-sub1').value = '';
  document.getElementById('ev-cfg-sub2').value = '';
  document.getElementById('ev-cfg-meta-1').value = '';
  document.getElementById('ev-cfg-meta-2').value = '';
  document.getElementById('ev-cfg-desc-1').value = '';
  document.getElementById('ev-cfg-desc-2').value = '';
  document.getElementById('ev-cfg-max-1').value = '';
  document.getElementById('ev-cfg-max-2').value = '';
  document.getElementById('ev-cfg-points-1').value = '';
  document.getElementById('ev-cfg-points-2').value = '';
  document.getElementById('ev-cfg-result-type-1').value = '';
  document.getElementById('ev-cfg-result-type-2').value = '';
  document.getElementById('ev-cfg-active-1').value = 'true';
  document.getElementById('ev-cfg-active-2').value = 'true';
  ['', '-1', '-2'].forEach(x => { document.getElementById('ev-cfg-timecap-min' + x).value = ''; document.getElementById('ev-cfg-timecap-sec' + x).value = ''; });
  removeEventImage(true); // limpa a imagem sem pedir confirmação de novo
  toggleDualEventFields();

  // IMPORTANTE: precisa salvar um event_info vazio no banco de dados.
  // Sem isso, os campos ficam limpos só na tela — ao recarregar a página,
  // o app busca de novo o event_info antigo do Supabase e tudo "volta".
  const emptyInfo = defaultEventInfo();
  const savedOk = await setSetting('event_info', emptyInfo);
  if (!savedOk) {
    toast('⚠️ Atenção: os campos foram limpos na tela, mas houve erro ao salvar isso no banco. Ao recarregar a página, o evento antigo pode voltar!');
  }
  EVENT_INFO = emptyInfo;

  startingFreshEvent = true;
  renderRegistrationsList();
  renderNoShowList();
  await renderResultsBoard(defaultEventInfo());

  if (archiveUrl) {
    toast(`🆕 Evento arquivado! ${toDelete.length} registro(s) movido(s) para o histórico.`);
    setTimeout(() => {
      if (confirm(`📎 Link permanente dos resultados criado:\n\n${archiveUrl}\n\nDeseja copiar esse link agora?`)) {
        navigator.clipboard?.writeText(archiveUrl).then(() => toast('📋 Link copiado!')).catch(()=>{});
      }
    }, 400);
  } else {
    toast(`🆕 Evento limpo! Preencha os dados do novo evento e clique em Salvar`);
  }
}

// ══════════════════════════════════════════════
//  ARQUIVO DE RESULTADOS (permanece acessível mesmo após o evento ser apagado)
// ══════════════════════════════════════════════
async function archiveEventResults(info, regs) {
  const archiveId = 'arc_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  const groupDescs = await getSetting('level_descriptions', {});
  await loadResultNotes();
  try { await loadBibs(info); } catch (e) {}

  // Monta um snapshot leve: só o essencial pra exibir os resultados depois
  const snapshot = {
    name: info.name,
    is_dual: !!info.is_dual,
    sub1_name: info.sub1_name,
    sub2_name: info.sub2_name,
    meta: info.meta, desc: info.desc,
    meta_1: info.meta_1, desc_1: info.desc_1,
    meta_2: info.meta_2, desc_2: info.desc_2,
    result_type: info.result_type,
    result_type_1: info.result_type_1,
    result_type_2: info.result_type_2,
    time_cap_seconds: info.time_cap_seconds,
    time_cap_seconds_1: info.time_cap_seconds_1,
    time_cap_seconds_2: info.time_cap_seconds_2,
    level_descriptions: groupDescs,
    archived_at: new Date().toISOString(),
    registrations: regs.map((r, idx) => ({
      idx, name: r.name, phone: r.phone, fitness_level: r.fitness_level,
      is_member: r.is_member, is_ct_student: r.is_ct_student, sub_events: r.sub_events,
      attended: r.attended, attended_1: r.attended_1, attended_2: r.attended_2,
      result_value: r.result_value, result_value_1: r.result_value_1, result_value_2: r.result_value_2,
      result_note: getResultNote(r, '') || null, result_note_1: getResultNote(r, '_1') || null, result_note_2: getResultNote(r, '_2') || null,
      bib: bibOf(r, '0'), bib_1: bibOf(r, '1'), bib_2: bibOf(r, '2')
    }))
  };

  const { error } = await sb.from('event_archives').insert({ id: archiveId, data: JSON.stringify(snapshot) });
  if (error) {
    console.error('Erro ao arquivar evento:', error.message || error);
    toast(`⚠️ Erro ao arquivar: ${error.message || 'tabela event_archives pode não existir'}`);
    return null;
  }

  const baseUrl = location.origin + location.pathname;
  return `${baseUrl}?resultado=${archiveId}`;
}

// Exibe a tela de resultados arquivados quando o link tem ?resultado=ID
async function renderArchivedResults(archiveId) {
  const { data, error } = await sb.from('event_archives').select('data').eq('id', archiveId).limit(1);
  const container = document.getElementById('archived-results-view');
  if (error || !data || !data.length) {
    container.innerHTML = `<div class="empty-state" style="padding:64px 24px">😕 Este link de resultados não foi encontrado ou expirou.</div>`;
    container.style.display = 'block';
    document.querySelector('.main-tabs')?.style && (document.querySelector('.main-tabs').style.display = 'none');
    document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
    return;
  }

  let snap;
  try { snap = JSON.parse(data[0].data); } catch { snap = null; }
  if (!snap) { container.innerHTML = '<div class="empty-state">😕 Arquivo corrompido.</div>'; container.style.display='block'; return; }

  const archivedDate = new Date(snap.archived_at).toLocaleDateString('pt-BR');
  let html = `
    <div style="max-width:680px;margin:0 auto;padding:40px 24px;">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:11px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">📁 Resultados Arquivados</div>
        <div class="event-name" style="font-size:26px">${snap.name}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">Evento realizado — arquivado em ${archivedDate}</div>
      </div>`;

  const groupDescs = snap.level_descriptions || {};

  if (snap.is_dual) {
    const sub1Name = snap.sub1_name || 'Evento 1';
    const sub2Name = snap.sub2_name || 'Evento 2';
    const regs1 = (snap.registrations||[]).filter(r => r.result_value_1);
    const regs2 = (snap.registrations||[]).filter(r => r.result_value_2);
    if (regs1.length) {
      html += `<div class="results-subevent-header">🥇 ${sub1Name}</div>`;
      html += renderResultsGroupsHtml(regs1, snap.result_type_1, groupDescs, 'result_value_1');
    }
    if (regs2.length) {
      html += `<div class="results-subevent-header">🥈 ${sub2Name}</div>`;
      html += renderResultsGroupsHtml(regs2, snap.result_type_2, groupDescs, 'result_value_2');
    }
    if (!regs1.length && !regs2.length) html += `<div class="empty-state">Nenhum resultado registrado neste evento.</div>`;
  } else {
    const regs = (snap.registrations||[]).filter(r => r.result_value);
    if (regs.length) {
      html += renderResultsGroupsHtml(regs, snap.result_type, groupDescs, 'result_value');
    } else {
      html += `<div class="empty-state">Nenhum resultado registrado neste evento.</div>`;
    }
  }

  html += `</div>`;
  container.innerHTML = html;
  container.style.display = 'block';
}

// ══════════════════════════════════════════════
//  GERENCIAR EVENTOS ARQUIVADOS (editar mesmo após encerrar)
// ══════════════════════════════════════════════
let ARCHIVED_EVENTS = [];

async function loadArchivedEvents() {
  const { data, error } = await sb.from('event_archives').select('*').order('created_at', { ascending:false }).limit(30);
  if (error) { console.error(error); return []; }
  ARCHIVED_EVENTS = (data||[]).map(row => {
    let snap = null;
    try { snap = JSON.parse(row.data); } catch {}
    return { id: row.id, snap };
  }).filter(a => a.snap);
  return ARCHIVED_EVENTS;
}

async function renderArchivedEventsAdminList() {
  await loadArchivedEvents();
  const el = document.getElementById('archived-events-list');
  if (!ARCHIVED_EVENTS.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:8px 0">Nenhum evento arquivado ainda.</div>'; return; }
  el.innerHTML = ARCHIVED_EVENTS.map(a => {
    const d = new Date(a.snap.archived_at);
    const dateStr = d.toLocaleDateString('pt-BR');
    const totalRegs = (a.snap.registrations||[]).length;
    const baseUrl = location.origin + location.pathname;
    const link = `${baseUrl}?resultado=${a.id}`;
    return `
    <div style="background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:10px">
      <div style="font-weight:800;font-size:14px;margin-bottom:2px">${a.snap.name}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:10px">Arquivado em ${dateStr} · ${totalRegs} participante(s)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-sm" onclick="openArchiveEditor('${a.id}')">✏️ Editar Resultados</button>
        <button class="btn-sm" onclick="navigator.clipboard.writeText('${link}').then(()=>toast('📋 Link copiado!'))">🔗 Copiar Link</button>
        <button class="btn-sm-danger" onclick="deleteArchive('${a.id}')">🗑️ Excluir Arquivo</button>
      </div>
    </div>`;
  }).join('');
}

async function deleteArchive(archiveId) {
  if (!confirm('Excluir este arquivo permanentemente? O link de resultados deixará de funcionar.')) return;
  const { error } = await sb.from('event_archives').delete().eq('id', archiveId);
  if (error) { toast('⚠️ Erro ao excluir arquivo'); console.error(error); return; }
  ARCHIVED_EVENTS = ARCHIVED_EVENTS.filter(a => a.id !== archiveId);
  renderArchivedEventsAdminList();
  toast('🗑️ Arquivo excluído!');
}

let currentEditingArchiveId = null;

function openArchiveEditor(archiveId) {
  currentEditingArchiveId = archiveId;
  const archive = ARCHIVED_EVENTS.find(a => a.id === archiveId);
  if (!archive) return;
  renderArchiveEditorModal(archive);
  document.getElementById('archive-editor-overlay').classList.add('open');
}

function closeArchiveEditor() {
  document.getElementById('archive-editor-overlay').classList.remove('open');
  currentEditingArchiveId = null;
}

function renderArchiveEditorModal(archive) {
  const snap = archive.snap;
  document.getElementById('archive-editor-title').textContent = snap.name;
  const regs = snap.registrations || [];

  const resultFieldFor = (subCtx) => subCtx ? 'result_value_' + subCtx : 'result_value';

  function participantRowHtml(r, idx) {
    const rows = [];
    if (snap.is_dual) {
      const sub1Name = snap.sub1_name || 'Evento 1';
      const sub2Name = snap.sub2_name || 'Evento 2';
      const inSub1 = (r.sub_events||'').includes(sub1Name);
      const inSub2 = (r.sub_events||'').includes(sub2Name);
      return `
        <div style="background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px">
          <div style="font-weight:700;font-size:13px;margin-bottom:8px">${r.name}</div>
          ${inSub1 ? `
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
            <span style="font-size:11px;color:var(--muted);width:70px;flex-shrink:0">🥇 ${sub1Name}</span>
            <input type="text" value="${r.result_value_1||''}" placeholder="resultado" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s1);color:var(--text);font-size:12px" onchange="updateArchiveResult(${idx}, '1', this.value)">
            <input type="text" value="${(r.result_note_1||'').replace(/"/g,'&quot;')}" placeholder="descrição" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s1);color:var(--text);font-size:12px" onchange="updateArchiveNote(${idx}, '1', this.value)">
          </div>` : ''}
          ${inSub2 ? `
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:11px;color:var(--muted);width:70px;flex-shrink:0">🥈 ${sub2Name}</span>
            <input type="text" value="${r.result_value_2||''}" placeholder="resultado" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s1);color:var(--text);font-size:12px" onchange="updateArchiveResult(${idx}, '2', this.value)">
            <input type="text" value="${(r.result_note_2||'').replace(/"/g,'&quot;')}" placeholder="descrição" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s1);color:var(--text);font-size:12px" onchange="updateArchiveNote(${idx}, '2', this.value)">
          </div>` : ''}
        </div>`;
    } else {
      return `
        <div style="background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
          <div style="font-weight:700;font-size:13px;flex:1">${r.name}</div>
          <input type="text" value="${r.result_value||''}" placeholder="resultado" style="width:120px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s1);color:var(--text);font-size:12px" onchange="updateArchiveResult(${idx}, null, this.value)">
            <input type="text" value="${(r.result_note||'').replace(/"/g,'&quot;')}" placeholder="descrição" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s1);color:var(--text);font-size:12px" onchange="updateArchiveNote(${idx}, null, this.value)">
        </div>`;
    }
  }

  document.getElementById('archive-editor-body').innerHTML = regs.map((r, idx) => participantRowHtml(r, idx)).join('')
    || '<div style="color:var(--muted);font-size:13px">Nenhum participante neste arquivo.</div>';
}

async function updateArchiveResult(idx, subCtx, newValue) {
  if (!currentEditingArchiveId) return;
  const archive = ARCHIVED_EVENTS.find(a => a.id === currentEditingArchiveId);
  if (!archive) return;
  const field = subCtx ? 'result_value_' + subCtx : 'result_value';
  if (!archive.snap.registrations[idx]) return;
  archive.snap.registrations[idx][field] = newValue.trim() || null;

  const { error } = await sb.from('event_archives').update({ data: JSON.stringify(archive.snap) }).eq('id', currentEditingArchiveId);
  if (error) { toast('⚠️ Erro ao salvar alteração'); console.error(error); return; }
  toast('✅ Resultado atualizado no arquivo!');
}

function renderRegistrationsList() {
  const el = document.getElementById('event-registrations-list');
  const info = EVENT_INFO || defaultEventInfo();
  const regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
  document.getElementById('ev-count').textContent = regs.length;
  if (!regs.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px">Nenhuma inscrição ainda.</div>'; return; }

  el.innerHTML = regs.map(r => {
    const badges = `${r.is_member ? '<span class="reg-member-badge">CLUBE</span>' : ''} ${r.is_ct_student ? '<span class="reg-member-badge">CT</span>' : ''} ${(!r.is_member && !r.is_ct_student) ? '<span class="reg-guest-badge">VISITANTE</span>' : ''} ${r.sub_events ? `<span class="reg-member-badge" style="background:rgba(45,125,255,0.15);color:#5b9dff;border-color:rgba(45,125,255,0.35)">${r.sub_events}</span>` : ''}`;

    let attendanceHtml;
    if (info.is_dual) {
      const sub1Name = info.sub1_name || 'Evento 1';
      const sub2Name = info.sub2_name || 'Evento 2';
      const inSub1 = (r.sub_events||'').includes(sub1Name);
      const inSub2 = (r.sub_events||'').includes(sub2Name);
      attendanceHtml = `
        <div class="attend-dual-wrap">
          ${inSub1 ? `
          <div class="attend-dual-row">
            <span class="attend-dual-label">${sub1Name}${bibOf(r, '1') != null ? `<span class="bib-badge" style="margin:0 0 0 6px">nº ${bibPad(bibOf(r, '1'))}</span>` : ''}</span>
            <div class="attend-btns">
              <button class="attend-btn yes ${r.attended_1===true?'active':''}" onclick="toggleAttendance(${r.id}, true, '1')">✓</button>
              <button class="attend-btn no ${r.attended_1===false?'active':''}" onclick="toggleAttendance(${r.id}, false, '1')">✕</button>
              ${r.attended_1!==null && r.attended_1!==undefined ? `<button class="attend-btn reset" onclick="toggleAttendance(${r.id}, null, '1')" title="Voltar para sem presença">↺</button>` : ''}
            </div>
          </div>` : ''}
          ${inSub2 ? `
          <div class="attend-dual-row">
            <span class="attend-dual-label">${sub2Name}${bibOf(r, '2') != null ? `<span class="bib-badge" style="margin:0 0 0 6px">nº ${bibPad(bibOf(r, '2'))}</span>` : ''}</span>
            <div class="attend-btns">
              <button class="attend-btn yes ${r.attended_2===true?'active':''}" onclick="toggleAttendance(${r.id}, true, '2')">✓</button>
              <button class="attend-btn no ${r.attended_2===false?'active':''}" onclick="toggleAttendance(${r.id}, false, '2')">✕</button>
              ${r.attended_2!==null && r.attended_2!==undefined ? `<button class="attend-btn reset" onclick="toggleAttendance(${r.id}, null, '2')" title="Voltar para sem presença">↺</button>` : ''}
            </div>
          </div>` : ''}
        </div>`;
    } else {
      attendanceHtml = `
        <div class="attend-btns">
          <button class="attend-btn yes ${r.attended===true?'active':''}" onclick="toggleAttendance(${r.id}, true)">✓</button>
          <button class="attend-btn no ${r.attended===false?'active':''}" onclick="toggleAttendance(${r.id}, false)">✕</button>
          ${r.attended!==null ? `<button class="attend-btn reset" onclick="toggleAttendance(${r.id}, null)" title="Voltar para sem presença">↺</button>` : ''}
        </div>`;
    }

    return `
    <div class="reg-chip">
      <div class="reg-chip-info">
        <div class="reg-chip-name">${(!info.is_dual && bibOf(r, '0') != null) ? `<span class="bib-badge">nº ${bibPad(bibOf(r, '0'))}</span>` : ''}${r.name} ${badges}</div>
        <div class="reg-chip-meta">${r.age?r.age+' anos · ':''}${r.fitness_level||''} · ${r.phone}</div>
        <div class="reg-chip-meta" style="margin-top:2px">🕒 Inscrito em ${fmtRegWhen(r.created_at)}</div>
        ${r.custom_answer ? `<div style="font-size:11.5px;color:var(--gold);margin-top:4px;background:rgba(255,208,96,0.08);border-left:2px solid var(--gold);padding:6px 10px;border-radius:6px">📝 ${r.custom_answer}</div>` : ''}
        ${info.is_dual ? attendanceHtml : ''}
      </div>
      <div class="attend-btns-wrap">
        ${!info.is_dual ? attendanceHtml : ''}
        <button class="btn-sm" onclick="openEditRegistration(${r.id})" title="Editar cadastro">✏️</button>
      </div>
    </div>`;
  }).join('');
}

async function toggleAttendance(id, attended, subCtx) {
  const reg = EVENT_REGISTRATIONS.find(r=>r.id===id);
  if (!reg) return;
  const info = EVENT_INFO || defaultEventInfo();
  const suffix = subCtx ? '_' + subCtx : '';
  const attendedField = 'attended' + suffix;
  const pointsAwardedField = 'points_awarded' + suffix;

  const { error } = await sb.from('event_registrations').update({ [attendedField]: attended }).eq('id', id);
  if (error) { toast('⚠️ Erro ao salvar presença'); console.error(error); return; }
  reg[attendedField] = attended;

  let pointsMsg = '';
  if (attended === true && reg.is_member && reg.member_id && !reg[pointsAwardedField]) {
    const pts = (info.is_dual && subCtx)
      ? (subCtx === '2' ? (info.points_2||0) : (info.points_1||0))
      : (info.points || 0);
    await addPointsToMember(reg.member_id, pts, info.name, 'evento');
    await sb.from('event_registrations').update({ [pointsAwardedField]: true }).eq('id', id);
    reg[pointsAwardedField] = true;
    await loadMembers();
    renderRanking();
    const updatedMember = MEMBERS.find(m => m.id === reg.member_id);
    pointsMsg = updatedMember
      ? ` — +${pts} pts somados ao ranking geral! (total agora: ${updatedMember.points} pts)`
      : ` — +${pts} pts somados ao ranking geral!`;
  }
  renderRegistrationsList();
  renderNoShowList();
  if (attended === null) toast('↺ Presença desmarcada — voltou para sem presença');
  else toast(attended ? `✅ Presença confirmada${pointsMsg}` : '🚫 Marcado como faltante');
}

function renderNoShowList() {
  const el = document.getElementById('event-noshow-list');
  const noShows = EVENT_REGISTRATIONS.filter(r => r.attended === false || r.attended_1 === false || r.attended_2 === false);
  if (!noShows.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px">Ninguém na lista de faltantes.</div>'; return; }
  el.innerHTML = noShows.map(r => `
    <div class="reg-chip">
      <div class="reg-chip-info">
        <div class="reg-chip-name">${r.name}</div>
        <div class="reg-chip-meta">${r.phone} · faltou em: ${r.event_name||'—'}</div>
      </div>
      <button class="btn-sm-danger" onclick="deleteRegistration(${r.id})" title="Remover da lista (libera pra próxima inscrição)">✕</button>
    </div>`).join('');
}

// ══════════════════════════════════════════════
//  RESULTADOS: TIME CAP FIXO + LANÇAMENTO ÚNICO
// ══════════════════════════════════════════════
function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s/60);
  const sec = s%60;
  return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}

function parseTimeToSeconds(str) {
  if (!str) return null;
  const parts = str.trim().split(':');
  if (parts.length !== 2) return null;
  const m = parseInt(parts[0]), s = parseInt(parts[1]);
  if (isNaN(m) || isNaN(s)) return null;
  return m*60 + s;
}

function levelColor(level) {
  if (level === 'Avançado') return { emoji:'🟠', name:'Laranja' };
  if (level === 'Intermediário') return { emoji:'🟡', name:'Amarelo' };
  return { emoji:'🟢', name:'Verde' };
}

async function saveLevelDescriptions() {
  const descs = {
    'Iniciante': document.getElementById('level-desc-Iniciante').value.trim(),
    'Intermediário': document.getElementById('level-desc-Intermediário').value.trim(),
    'Avançado': document.getElementById('level-desc-Avançado').value.trim(),
  };
  const ok = await setSetting('level_descriptions', descs);
  if (!ok) return;
  await renderResultsBoard(EVENT_INFO || defaultEventInfo());
  toast('✅ Descrições dos níveis salvas!');
}

async function loadLevelDescriptionsIntoForm() {
  const descs = await getSetting('level_descriptions', {});
  const iEl = document.getElementById('level-desc-Iniciante');
  const mEl = document.getElementById('level-desc-Intermediário');
  const aEl = document.getElementById('level-desc-Avançado');
  if (iEl) iEl.value = descs['Iniciante'] || '';
  if (mEl) mEl.value = descs['Intermediário'] || '';
  if (aEl) aEl.value = descs['Avançado'] || '';
}

// Monta o select de categoria na inscrição pública usando os mesmos nomes/descrições
// que o admin escreveu em "Descrição de cada nível" — independente de o evento ter
// resultado configurado (tempo/rounds) ou ser só presença. Categorias em branco
// não aparecem como opção. Se nenhuma estiver preenchida, cai no padrão fixo.
async function populateLevelSelect(targetId) {
  const sel = document.getElementById(targetId || 'ev-level');
  if (!sel) return;
  const descs = await getSetting('level_descriptions', {});
  const levels = [
    { key:'Iniciante', emoji:'🟢' },
    { key:'Intermediário', emoji:'🟡' },
    { key:'Avançado', emoji:'🟠' }
  ];
  const withText = levels.filter(l => descs[l.key] && descs[l.key].trim());

  if (withText.length) {
    sel.innerHTML = withText.map(l => `<option value="${l.key}">${l.emoji} ${descs[l.key]}</option>`).join('');
  } else {
    // Nenhuma categoria configurada ainda — fallback pro padrão de sempre
    sel.innerHTML = `
      <option value="Iniciante">🟢 Iniciante</option>
      <option value="Intermediário">🟡 Intermediário</option>
      <option value="Avançado">🟠 Avançado</option>`;
  }
}

// Mesmo select dinâmico, usado no painel admin de lançar resultados
async function populateResultLevelSelect() {
  await populateLevelSelect('result-level-select');
}

function populateResultSelect() {
  const info = EVENT_INFO || defaultEventInfo();
  const sel = document.getElementById('result-select');
  const suffix = info.is_dual ? '_' + currentSubEventContext : '';
  let regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
  // Se dual, só mostra quem se inscreveu nesse sub-evento específico
  if (info.is_dual) {
    const subName = currentSubEventContext === '2' ? (info.sub2_name||'Evento 2') : (info.sub1_name||'Evento 1');
    regs = regs.filter(r => (r.sub_events||'').includes(subName));
  }
  regs = regs.slice().sort((a,b)=>a.name.localeCompare(b.name));
  sel.innerHTML = '<option value="">— Selecione —</option>' + regs.map(r => {
    const lvl = levelColor(r.fitness_level);
    const resultField = 'result_value' + suffix;
    const done = r[resultField] ? ' ✓' : '';
    const bn = bibOf(r, info.is_dual ? currentSubEventContext : '0');
    return `<option value="${r.id}">${lvl.emoji} ${bn != null ? bibPad(bn) + ' · ' : ''}${r.name}${done}</option>`;
  }).join('');
}

async function onResultSelectChange() {
  const info = EVENT_INFO || defaultEventInfo();
  const suffix = info.is_dual ? '_' + currentSubEventContext : '';
  const resultType = info.is_dual
    ? (currentSubEventContext === '2' ? info.result_type_2 : info.result_type_1)
    : info.result_type;
  const regId = parseInt(document.getElementById('result-select').value);
  document.getElementById('result-saved-tag').textContent = '';
  document.getElementById('result-remaining-input').value = '';
  const finalInput = document.getElementById('result-final-input');
  const levelWrap = document.getElementById('result-level-wrap');
  const deleteBtn = document.getElementById('delete-result-btn');
  const noteInputEl = document.getElementById('result-note-input');
  if (!regId) { finalInput.value = ''; if (noteInputEl) noteInputEl.value = ''; levelWrap.style.display = 'none'; deleteBtn.style.display = 'none'; fillResultBib(null, info); return; }
  const reg = EVENT_REGISTRATIONS.find(r=>r.id===regId);
  const resultField = 'result_value' + suffix;
  finalInput.value = reg && reg[resultField] ? reg[resultField] : '';
  await loadResultNotes();
  if (noteInputEl) noteInputEl.value = reg ? getResultNote(reg, suffix) : '';
  finalInput.placeholder = resultType === 'tempo' ? 'MM:SS' : 'rounds';
  levelWrap.style.display = '';
  fillResultBib(reg, info);
  // Popula o select com os mesmos rótulos configurados em "Descrição de cada nível"
  // (ex: "2K", "6K"), pra bater exatamente com o que o inscrito escolheu ao se inscrever
  await populateResultLevelSelect();
  // IMPORTANTE: setamos o valor do select sem disparar o onchange (que salvaria
  // o nível no banco). Isso evita o bug de trocar de participante e acidentalmente
  // sobrescrever o nível de outra pessoa com o valor que estava mostrando antes.
  const levelSelect = document.getElementById('result-level-select');
  levelSelect.dataset.suppressChange = '1';
  levelSelect.value = (reg && reg.fitness_level) || 'Iniciante';
  setTimeout(() => { levelSelect.dataset.suppressChange = ''; }, 0);
  deleteBtn.style.display = (reg && reg[resultField]) ? 'block' : 'none';
}

async function deleteSelectedResult() {
  const regId = parseInt(document.getElementById('result-select').value);
  if (!regId) return;
  const reg = EVENT_REGISTRATIONS.find(r=>r.id===regId);
  if (!reg) return;
  if (!confirm(`Excluir o resultado de ${reg.name}? Isso não remove a inscrição, só apaga o tempo/resultado lançado.`)) return;

  const info = EVENT_INFO || defaultEventInfo();
  const resultField = info.is_dual ? 'result_value_' + currentSubEventContext : 'result_value';
  const { error } = await sb.from('event_registrations').update({ [resultField]: null }).eq('id', regId);
  if (error) { toast('⚠️ Erro ao excluir resultado'); console.error(error); return; }
  reg[resultField] = null;
  await saveResultNote(regId, info.is_dual ? '_' + currentSubEventContext : '', '');
  const noteDel = document.getElementById('result-note-input'); if (noteDel) noteDel.value = '';

  populateResultSelect();
  document.getElementById('result-select').value = '';
  document.getElementById('result-final-input').value = '';
  document.getElementById('result-remaining-input').value = '';
  document.getElementById('delete-result-btn').style.display = 'none';
  document.getElementById('result-saved-tag').textContent = `🗑️ Resultado de ${reg.name} removido`;
  renderRegistrationsList();
  await renderResultsBoard(EVENT_INFO || defaultEventInfo());
  toast(`🗑️ Resultado de ${reg.name} excluído!`);
}

async function updateResultLevel() {
  const levelSelect = document.getElementById('result-level-select');
  if (levelSelect.dataset.suppressChange === '1') return; // mudança programática, não é o usuário editando
  const regId = parseInt(document.getElementById('result-select').value);
  if (!regId) return;
  const reg = EVENT_REGISTRATIONS.find(r=>r.id===regId);
  if (!reg) return;
  const newLevel = levelSelect.value;
  const { error } = await sb.from('event_registrations').update({ fitness_level: newLevel }).eq('id', regId);
  if (error) { toast('⚠️ Erro ao atualizar nível'); console.error(error); return; }
  reg.fitness_level = newLevel;
  populateResultSelect();
  document.getElementById('result-select').value = regId;
  toast(`✅ Nível de ${reg.name} atualizado!`);
}

function calcResultFromRemaining() {
  const info = EVENT_INFO || defaultEventInfo();
  const cap = info.is_dual
    ? (currentSubEventContext === '2' ? (info.time_cap_seconds_2||0) : (info.time_cap_seconds_1||0))
    : (info.time_cap_seconds || 0);
  if (!cap) return toast('⚠️ Time Cap não definido. Peça à administração para definir na configuração do evento.');
  const remainingSec = parseTimeToSeconds(document.getElementById('result-remaining-input').value);
  if (remainingSec === null) return toast('⚠️ Digite o tempo restante no formato MM:SS!');
  const elapsed = Math.max(0, cap - remainingSec);
  document.getElementById('result-final-input').value = formatTime(elapsed);
}

function markTimeCap() {
  document.getElementById('result-final-input').value = 'TIME CAP';
}

// Núcleo: grava o resultado (opcionalmente só se ainda estiver vazio, para dois celulares não se atropelarem)
async function commitResultCore(regId, value, opts) {
  opts = opts || {};
  const reg = EVENT_REGISTRATIONS.find(r => r.id === regId);
  if (!reg) return null;
  const info = EVENT_INFO || defaultEventInfo();
  const suffix = info.is_dual ? '_' + currentSubEventContext : '';
  const resultField = 'result_value' + suffix, attendedField = 'attended' + suffix;
  let q = sb.from('event_registrations').update({ [resultField]: value, [attendedField]: true }).eq('id', regId);
  if (opts.onlyIfEmpty) q = q.is(resultField, null);
  const { data, error } = await q.select('id');
  if (error) { toast('⚠️ Erro ao salvar resultado'); console.error(error); return null; }
  if (opts.onlyIfEmpty && Array.isArray(data) && data.length === 0) {
    toast(`⚠️ ${reg.name} já tem resultado (outro celular finalizou antes)`);
    await loadEventRegistrations();
    return { conflict: true };
  }
  reg[resultField] = value; reg[attendedField] = true;
  return { reg, info, suffix, value };
}
// Complemento: descrição, pontos do ranking e atualização das telas
async function commitResultExtras(ctx, noteVal) {
  const { reg, info, suffix } = ctx;
  const pointsAwardedField = 'points_awarded' + suffix;
  if (noteVal !== undefined) await saveResultNote(reg.id, suffix, noteVal);
  let pointsMsg = '';
  if (reg.is_member && reg.member_id && !reg[pointsAwardedField]) {
    const pts = info.is_dual
      ? (currentSubEventContext === '2' ? (info.points_2||0) : (info.points_1||0))
      : (info.points || 0);
    await addPointsToMember(reg.member_id, pts, info.name, 'evento');
    await sb.from('event_registrations').update({ [pointsAwardedField]: true }).eq('id', reg.id);
    reg[pointsAwardedField] = true;
    await loadMembers();
    renderRanking();
    const updatedMember = MEMBERS.find(m => m.id === reg.member_id);
    pointsMsg = updatedMember ? ` (+${pts} pts no ranking geral, total: ${updatedMember.points})` : ` (+${pts} pts no ranking geral)`;
  }
  renderRegistrationsList();
  renderNoShowList();
  await renderResultsBoard(EVENT_INFO || defaultEventInfo());
  return pointsMsg;
}

async function saveSelectedResult() {
  const regId = parseInt(document.getElementById('result-select').value);
  if (!regId) return toast('⚠️ Selecione um inscrito primeiro!');
  const value = document.getElementById('result-final-input').value.trim();
  if (!value) return toast('⚠️ Digite ou calcule o resultado antes de salvar!');
  const noteVal = (document.getElementById('result-note-input')?.value || '').trim();

  const ctx = await commitResultCore(regId, value);
  if (!ctx) return;
  const pointsMsg = await commitResultExtras(ctx, noteVal);
  populateResultSelect();
  document.getElementById('result-select').value = '';
  document.getElementById('result-final-input').value = '';
  document.getElementById('result-remaining-input').value = '';
  const noteClr = document.getElementById('result-note-input'); if (noteClr) noteClr.value = '';
  document.getElementById('delete-result-btn').style.display = 'none';
  document.getElementById('result-saved-tag').textContent = `✅ ${ctx.reg.name}: ${value}${noteVal ? ' — ' + noteVal : ''}${pointsMsg}`;
  fillResultBib(null, ctx.info);
  try { if (typeof lancarRenderList === 'function') lancarRenderList(); } catch (e) {}
  toast(`✅ Resultado de ${ctx.reg.name} salvo!${pointsMsg}`);
}

async function deleteRegistration(id) {
  await sb.from('event_registrations').delete().eq('id', id);
  EVENT_REGISTRATIONS = EVENT_REGISTRATIONS.filter(r=>r.id!==id);
  renderRegistrationsList();
  renderNoShowList();
  toast('🗑️ Removido da lista de faltantes!');
}

// ── EDITAR INSCRIÇÃO (sem precisar novo cadastro) ──
let editingRegId = null;

function openEditRegistration(id) {
  const reg = EVENT_REGISTRATIONS.find(r=>r.id===id);
  if (!reg) return;
  editingRegId = id;

  document.getElementById('er-name').value = reg.name || '';
  document.getElementById('er-age').value = reg.age || '';
  document.getElementById('er-phone').value = reg.phone || '';
  document.getElementById('er-level').value = reg.fitness_level || 'Iniciante';
  document.getElementById('er-who').textContent = '👤 ' + (reg.name || '');
  document.getElementById('er-when').textContent = '🕒 Inscrito em ' + fmtRegWhen(reg.created_at);
  ['0', '1', '2'].forEach(x => { document.getElementById('er-bib-' + x).dataset.loaded = ''; });
  document.getElementById('er-is-clube').checked = !!reg.is_member;
  document.getElementById('er-is-ct').checked = !!reg.is_ct_student;

  // Popula select de membros do ranking
  const sel = document.getElementById('er-member-select');
  sel.innerHTML = MEMBERS.slice().sort((a,b)=>a.name.localeCompare(b.name))
    .map(m => `<option value="${m.id}">${m.emoji||''} ${m.name}</option>`).join('');
  if (reg.member_id) sel.value = reg.member_id;

  // Sub-eventos (se o evento atual tiver 2 provas)
  const info = EVENT_INFO || defaultEventInfo();
  const dualWrap = document.getElementById('er-dual-wrap');
  if (info.is_dual) {
    document.getElementById('er-sub1-label').textContent = info.sub1_name || 'Evento 1';
    document.getElementById('er-sub2-label').textContent = info.sub2_name || 'Evento 2';
    const subEvents = reg.sub_events || '';
    document.getElementById('er-sub1-check').checked = subEvents.includes(info.sub1_name || 'Evento 1');
    document.getElementById('er-sub2-check').checked = subEvents.includes(info.sub2_name || 'Evento 2');
    dualWrap.style.display = '';
  } else {
    dualWrap.style.display = 'none';
  }

  toggleEditMemberSelect();
  refreshEditBibRows();
  document.getElementById('edit-reg-overlay').classList.add('open');
}

function toggleEditMemberSelect() {
  const isClube = document.getElementById('er-is-clube').checked;
  document.getElementById('er-member-select-wrap').style.display = isClube ? '' : 'none';
}

function closeEditRegistration() {
  document.getElementById('edit-reg-overlay').classList.remove('open');
  editingRegId = null;
}

async function saveEditRegistration() {
  if (!editingRegId) return;
  const name = document.getElementById('er-name').value.trim();
  if (!name) return toast('⚠️ Digite o nome!');
  const age = parseInt(document.getElementById('er-age').value) || null;
  const phone = document.getElementById('er-phone').value.trim();
  const level = document.getElementById('er-level').value;
  const isClube = document.getElementById('er-is-clube').checked;
  const isCT = document.getElementById('er-is-ct').checked;
  const memberId = isClube ? parseInt(document.getElementById('er-member-select').value) || null : null;

  const info = EVENT_INFO || defaultEventInfo();
  let subEvents = null;
  if (info.is_dual) {
    const sub1 = document.getElementById('er-sub1-check').checked;
    const sub2 = document.getElementById('er-sub2-check').checked;
    const parts = [];
    if (sub1) parts.push(info.sub1_name || 'Evento 1');
    if (sub2) parts.push(info.sub2_name || 'Evento 2');
    subEvents = parts.length ? parts.join(' + ') : null;
  }

  const updateData = {
    name, age, phone, fitness_level: level,
    is_member: isClube, is_ct_student: isCT, member_id: memberId,
    sub_events: subEvents
  };

  const { error } = await sb.from('event_registrations').update(updateData).eq('id', editingRegId);
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }

  const idx = EVENT_REGISTRATIONS.findIndex(r=>r.id===editingRegId);
  if (idx>=0) EVENT_REGISTRATIONS[idx] = { ...EVENT_REGISTRATIONS[idx], ...updateData };

  const bibsOk = await saveEditBibs(info, EVENT_REGISTRATIONS.find(r => r.id === editingRegId));
  renderRegistrationsList();
  renderNoShowList();
  populateResultSelect();
  if (!bibsOk) { toast('⚠️ Inscrição salva, mas confira o nº de pulseira'); return; }
  closeEditRegistration();
  toast('✅ Inscrição atualizada!');
}

document.addEventListener('change', e => {
  if (e.target && e.target.id === 'er-is-clube') toggleEditMemberSelect();
  if (e.target && (e.target.id === 'er-sub1-check' || e.target.id === 'er-sub2-check')) refreshEditBibRows();
});
document.addEventListener('keydown', e => {
  if (e.key==='Escape' && document.getElementById('edit-reg-overlay')?.classList.contains('open')) closeEditRegistration();
});

async function printEventReport() {
  const info = EVENT_INFO || defaultEventInfo();
  const regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
  if (!regs.length) return toast('⚠️ Não há inscritos nesse evento ainda.');

  try { await ensureBibs(info); } catch (e) { console.error(e); }
  const groupDescs = await getSetting('level_descriptions', {});
  const levelLabel = (key) => (groupDescs[key] && groupDescs[key].trim()) ? groupDescs[key] : (key || '—');
  const formatWhen = (createdAt) => {
    if (!createdAt) return '—';
    const d = new Date(createdAt);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  };

  let attendedCount, noShowCount, pendingCount, rows, headerCols;

  if (info.is_dual) {
    const sub1 = info.sub1_name || 'Evento 1';
    const sub2 = info.sub2_name || 'Evento 2';
    attendedCount = regs.filter(r=>r.attended_1===true || r.attended_2===true).length;
    noShowCount = regs.filter(r=>r.attended_1===false || r.attended_2===false).length;
    pendingCount = regs.filter(r=>(r.attended_1==null)&&(r.attended_2==null)).length;

    const presLabel = (v) => v===true?'✅ Presente':v===false?'❌ Faltou':'—';
    rows = regs.map((r,i) => `
      <tr>
        <td>${i+1}</td>
        <td>${r.name}</td>
        <td>${[r.is_member?'Membro do Clube':null, r.is_ct_student?'Aluno do CT':null].filter(Boolean).join(' + ') || 'Visitante'}</td>
        <td>${(() => { const p = []; if (evRegInSub(r, sub1, sub2)) p.push(sub1 + bibTxt(r, '1')); if (evRegInSub(r, sub2, sub1)) p.push(sub2 + bibTxt(r, '2')); return p.length ? p.join('<br>') : (r.sub_events || '—'); })()}</td>
        <td>${r.age||'—'}</td>
        <td>${levelLabel(r.fitness_level)}</td>
        <td>${r.phone||'—'}</td>
        <td>${presLabel(r.attended_1)}${r.result_value_1?' ('+r.result_value_1+')':''}</td>
        <td>${presLabel(r.attended_2)}${r.result_value_2?' ('+r.result_value_2+')':''}</td>
        <td>${formatWhen(r.created_at)}</td>
      </tr>`).join('');
    headerCols = `<th>#</th><th>Nome</th><th>Tipo</th><th>Inscrito em</th><th>Idade</th><th>Categoria</th><th>Telefone</th><th>${sub1}</th><th>${sub2}</th><th>Inscrição em</th>`;
  } else {
    attendedCount = regs.filter(r=>r.attended===true).length;
    noShowCount = regs.filter(r=>r.attended===false).length;
    pendingCount = regs.filter(r=>r.attended==null).length;

    const hasCustomQ = !!(info.custom_question_enabled && info.custom_question_label);
    rows = regs.map((r,i) => `
      <tr>
        <td>${i+1}</td>
        <td>${bibOf(r, '0') != null ? bibPad(bibOf(r, '0')) : '—'}</td>
        <td>${r.name}</td>
        <td>${[r.is_member?'Membro do Clube':null, r.is_ct_student?'Aluno do CT':null].filter(Boolean).join(' + ') || 'Visitante'}</td>
        <td>${r.age||'—'}</td>
        <td>${levelLabel(r.fitness_level)}</td>
        <td>${r.phone||'—'}</td>
        <td>${r.heard_from||'—'}${r.referred_by?' ('+r.referred_by+')':''}</td>
        <td>${r.attended===true?'✅ Presente':r.attended===false?'❌ Faltou':'—'}</td>
        ${hasCustomQ ? `<td>${r.custom_answer||'—'}</td>` : ''}
        <td>${formatWhen(r.created_at)}</td>
      </tr>`).join('');
    headerCols = `<th>#</th><th>Nº insc.</th><th>Nome</th><th>Tipo</th><th>Idade</th><th>Categoria</th><th>Telefone</th><th>Como soube</th><th>Presença</th>${hasCustomQ ? `<th>${info.custom_question_label}</th>` : ''}<th>Inscrição em</th>`;
  }

  let hiddenPre = []; try { hiddenPre = JSON.parse(localStorage.getItem('rep_hidden_cols') || '[]'); } catch (e) {}
  const preJson = JSON.stringify(hiddenPre).replace(/</g, '\\u003c');
  const html = `
    <html><head><meta charset="utf-8"><title>Relatório — ${info.name}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h1{font-size:20px;margin-bottom:2px}
      .meta{color:#555;font-size:13px;margin-bottom:14px}
      .summary{display:flex;gap:18px;margin-bottom:18px;font-size:13px}
      .summary b{font-size:16px;display:block}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f0f0f0}
      .bar{margin:0 0 14px;padding:10px 12px;border:1px solid #ccc;border-radius:8px;background:#fafafa;font-size:12px}
      .bar-t{font-weight:bold;margin-bottom:6px}
      .bar label{display:inline-block;margin:0 14px 6px 0;cursor:pointer}
      .bar button{margin:4px 8px 0 0;padding:5px 10px;font-size:12px}
      @media print{ button,.bar{display:none} }
    </style></head>
    <body>
      <h1>${info.name}</h1>
      <div class="meta">${info.meta||''} — Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
      <div class="summary">
        <div><b>${regs.length}</b>Inscritos</div>
        <div><b>${attendedCount}</b>Presentes</div>
        <div><b>${noShowCount}</b>Faltantes</div>
        <div><b>${pendingCount}</b>Sem marcação</div>
      </div>
      <div class="bar"><div class="bar-t">Colunas que vão sair no documento (impressão e PDF)</div><div id="collist"></div>
        <button onclick="colAll()">Mostrar tudo</button><button onclick="colPrivacy()">🔒 Ocultar dados pessoais (telefone, idade, como soube)</button></div>
      <style id="colstyle"></style>
      <table>
        <thead><tr>${headerCols}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;font-size:14px">🖨️ Imprimir / Salvar como PDF</button>
      <script>
      (function(){
        var PRE=${preJson}, PERSONAL=['Telefone','Idade','Como soube'], hidden={};
        var ths=[].slice.call(document.querySelectorAll('thead th')), list=document.getElementById('collist'), st=document.getElementById('colstyle');
        PRE.forEach(function(l){hidden[l]=1;});
        function apply(){
          var css=''; ths.forEach(function(th,i){ if(hidden[th.textContent.trim()]) css+='table tr>*:nth-child('+(i+1)+'){display:none}'; });
          st.textContent=css;
          ths.forEach(function(th,i){ var cb=document.getElementById('col'+i); if(cb) cb.checked=!hidden[th.textContent.trim()]; });
          try{ window.opener.localStorage.setItem('rep_hidden_cols',JSON.stringify(Object.keys(hidden))); }catch(e){}
        }
        ths.forEach(function(th,i){ var lab=th.textContent.trim(), l=document.createElement('label'), cb=document.createElement('input'); cb.type='checkbox'; cb.id='col'+i;
          cb.onchange=function(){ if(cb.checked) delete hidden[lab]; else hidden[lab]=1; apply(); }; l.appendChild(cb); l.appendChild(document.createTextNode(' '+lab)); list.appendChild(l); });
        window.colAll=function(){ hidden={}; apply(); };
        window.colPrivacy=function(){ PERSONAL.forEach(function(l){hidden[l]=1;}); apply(); };
        apply();
      })();
      <\/script>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

// ── ASSINANTE: vídeos exclusivos (admin) ──
async function addSubscriberVideo() {
  const title = document.getElementById('sv-title').value.trim();
  const url = document.getElementById('sv-url').value.trim();
  const description = document.getElementById('sv-desc').value.trim();
  if (!title) return toast('⚠️ Digite o título!');
  const id = extractYouTubeId(url);
  if (!id) return toast('⚠️ Link do YouTube inválido!');
  const { data, error } = await sb.from('subscriber_videos').insert({ title, youtube_url: buildShortUrl(id), video_id: id, description }).select();
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }
  SUBSCRIBER_VIDEOS.unshift(data[0]);
  document.getElementById('sv-title').value='';
  document.getElementById('sv-url').value='';
  document.getElementById('sv-desc').value='';
  renderSubscriberVideosAdminList();
  toast('✅ Vídeo exclusivo publicado!');
}

let editingSubscriberId = null;
function renderSubscriberVideosAdminList() {
  const el = document.getElementById('subscriber-videos-admin-list');
  if (!SUBSCRIBER_VIDEOS.length) { el.innerHTML='<div style="color:var(--muted);font-size:13px">Nenhum vídeo ainda.</div>'; return; }
  el.innerHTML = SUBSCRIBER_VIDEOS.map(v => {
    if (editingSubscriberId === v.id) {
      return `
      <div class="vid-chip" style="flex-direction:column;align-items:stretch;gap:10px;padding:14px 0">
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Título</label><input type="text" id="esv-title-${v.id}" value="${v.title.replace(/"/g,'&quot;')}"></div>
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Link do YouTube</label><input type="text" id="esv-url-${v.id}" value="${v.youtube_url}"></div>
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Descrição</label><input type="text" id="esv-desc-${v.id}" value="${(v.description||'').replace(/"/g,'&quot;')}"></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-blue" style="flex:1;padding:10px" onclick="saveEditSubscriberVideo(${v.id})">💾 Salvar</button>
          <button class="btn" style="flex:1;padding:10px;background:var(--s2);color:var(--text)" onclick="cancelEditSubscriberVideo()">Cancelar</button>
        </div>
      </div>`;
    }
    return `
    <div class="vid-chip">
      <img class="vid-chip-thumb" src="${buildThumbUrl(v.video_id)}" alt="">
      <div class="vid-chip-title">${v.title}${v.description ? `<div style="color:var(--muted);font-size:11px;font-weight:400">${v.description}</div>` : ''}</div>
      <button class="btn-sm-danger" style="background:none;color:var(--muted);border:1px solid var(--border)" onclick="startEditSubscriberVideo(${v.id})">✏️</button>
      <button class="btn-sm-danger" onclick="deleteSubscriberVideo(${v.id})">✕</button>
    </div>`;
  }).join('');
}

function startEditSubscriberVideo(id) { editingSubscriberId = id; renderSubscriberVideosAdminList(); }
function cancelEditSubscriberVideo() { editingSubscriberId = null; renderSubscriberVideosAdminList(); }
async function saveEditSubscriberVideo(id) {
  const title = document.getElementById(`esv-title-${id}`).value.trim();
  const url = document.getElementById(`esv-url-${id}`).value.trim();
  const description = document.getElementById(`esv-desc-${id}`).value.trim();
  if (!title) return toast('⚠️ Digite o título!');
  const vid = extractYouTubeId(url);
  if (!vid) return toast('⚠️ Link do YouTube inválido!');
  const { error } = await sb.from('subscriber_videos').update({ title, youtube_url: buildShortUrl(vid), video_id: vid, description }).eq('id', id);
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }
  const v = SUBSCRIBER_VIDEOS.find(v=>v.id===id);
  if (v) Object.assign(v, { title, youtube_url: buildShortUrl(vid), video_id: vid, description });
  editingSubscriberId = null;
  renderSubscriberVideosAdminList();
  toast('✅ Vídeo atualizado!');
}

async function deleteSubscriberVideo(id) {
  await sb.from('subscriber_videos').delete().eq('id', id);
  SUBSCRIBER_VIDEOS = SUBSCRIBER_VIDEOS.filter(v=>v.id!==id);
  renderSubscriberVideosAdminList();
  toast('🗑️ Removido!');
}

// ── ASSINANTE: códigos de acesso (admin) ──
async function generateCode() {
  const label = document.getElementById('code-label').value.trim();
  const code = genCode();
  const { data, error } = await sb.from('access_codes').insert({ code, label, active:true }).select();
  if (error) { toast('⚠️ Erro ao gerar código'); console.error(error); return; }
  ACCESS_CODES.unshift(data[0]);
  document.getElementById('code-label').value='';
  renderCodesAdminList();
  toast(`✅ Código gerado: ${code}`);
}

function renderCodesAdminList() {
  const el = document.getElementById('codes-admin-list');
  if (!ACCESS_CODES.length) { el.innerHTML='<div style="color:var(--muted);font-size:13px">Nenhum código gerado ainda.</div>'; return; }
  el.innerHTML = ACCESS_CODES.map(c => `
    <div class="code-chip">
      <div>
        <div class="code-chip-code">${c.code}</div>
        ${c.label ? `<div class="code-chip-label">${c.label}</div>` : ''}
      </div>
      <span class="${c.active ? 'badge-active' : 'badge-inactive'}" style="cursor:pointer" onclick="toggleCode(${c.id}, ${!c.active})">${c.active ? 'ATIVO' : 'INATIVO'}</span>
      <button class="btn-sm-danger" onclick="deleteCode(${c.id})">✕</button>
    </div>`).join('');
}

async function toggleCode(id, newActive) {
  await sb.from('access_codes').update({ active:newActive }).eq('id', id);
  const c = ACCESS_CODES.find(c=>c.id===id);
  if (c) c.active = newActive;
  renderCodesAdminList();
}

async function deleteCode(id) {
  await sb.from('access_codes').delete().eq('id', id);
  ACCESS_CODES = ACCESS_CODES.filter(c=>c.id!==id);
  renderCodesAdminList();
  toast('🗑️ Código removido!');
}

// ── ASSINANTE: mensagem "como virar assinante" (editável) ──
async function getSubInfo() {
  return await getSetting('sub_info', {
    title: '💛 Quer virar assinante?',
    body: 'Fale com a Cantil Fitness pelo WhatsApp ou no Instagram @cantilfitness pra liberar seu código de acesso.'
  });
}
async function renderSubInfoBox() {
  const si = await getSubInfo();
  document.getElementById('sub-info-box').innerHTML = `
    <div class="sub-info-title">${si.title}</div>
    <div class="sub-info-body">${si.body}</div>`;
}
async function updateSubInfo() {
  const title = document.getElementById('subinfo-title').value.trim();
  const body = document.getElementById('subinfo-body').value.trim();
  if (!title || !body) return toast('⚠️ Preencha título e texto!');
  const ok = await setSetting('sub_info', { title, body });
  if (!ok) return;
  await renderSubInfoBox();
  toast('✅ Mensagem atualizada!');
}

// ── ASSINANTE: overlay de código por vídeo (público) ──
let pendingVideo = null;
function openCodeOverlay(elId, index) {
  const list = elId === 'assinante-grid' ? SUBSCRIBER_VIDEOS : CHALLENGE_VIDEOS;
  pendingVideo = list[index];
  document.getElementById('code-overlay-video-title').textContent = `Digite o código para assistir: "${pendingVideo.title}"`;
  document.getElementById('code-overlay-input').value = '';
  document.getElementById('code-overlay-err').textContent = '';
  document.getElementById('code-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('code-overlay-input').focus(),200);
}
function closeCodeOverlay() {
  document.getElementById('code-overlay').classList.remove('open');
  pendingVideo = null;
}
async function submitCodeOverlay() {
  const val = document.getElementById('code-overlay-input').value.trim().toUpperCase();
  if (!val) return;
  const { data, error } = await sb.from('access_codes').select('*').eq('code', val).eq('active', true).limit(1);
  if (error) { document.getElementById('code-overlay-err').textContent='⚠️ Erro ao validar'; console.error(error); return; }
  if (!data || !data.length) {
    document.getElementById('code-overlay-err').textContent='✗ Código inválido ou inativo';
    return;
  }
  lset(SK.subUnlocked, val);
  closeCodeOverlay();
  if (pendingVideo) window.open(pendingVideo.youtube_url, '_blank');
  renderVideoGrid('assinante-grid', SUBSCRIBER_VIDEOS, 'Nenhum vídeo exclusivo publicado ainda.', 'open');
  toast('🔓 Acesso liberado! Aproveite os vídeos.');
}
document.getElementById('code-overlay-input')?.addEventListener('keydown', e=>{ if(e.key==='Enter') submitCodeOverlay(); });

// ══════════════════════════════════════════════
//  CHALLENGE BANNER (editable)
// ══════════════════════════════════════════════
async function renderChallengeBanner() {
  const ch = await getSetting('challenge_banner', null);
  const wrap = document.getElementById('challenge-wrap');
  if (!ch || ch.hidden || (!ch.title && !ch.body && !ch.sub)) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = '';
  document.getElementById('challenge-title').textContent = ch.title || '';
  document.getElementById('challenge-body').innerHTML = ch.body || '';
  document.getElementById('challenge-sub').textContent = ch.sub || '';
}

async function updateChallenge() {
  const title = document.getElementById('ch-title').value.trim();
  const body = document.getElementById('ch-body').value.trim();
  const sub = document.getElementById('ch-sub').value.trim();
  const current = await getSetting('challenge_banner', { title:'', body:'', sub:'' });
  const ok = await setSetting('challenge_banner', {
    title: title || current.title,
    body: body || current.body,
    sub: sub || current.sub,
    hidden: false
  });
  if (!ok) return;
  document.getElementById('ch-title').value = title || current.title;
  document.getElementById('ch-body').value = body || current.body;
  document.getElementById('ch-sub').value = sub || current.sub;
  await renderChallengeBanner();
  toast('🔥 Banner de desafio atualizado!');
}

async function hideChallenge() {
  const current = await getSetting('challenge_banner', { title:'', body:'', sub:'' });
  current.hidden = true;
  const ok = await setSetting('challenge_banner', current);
  if (!ok) return;
  await renderChallengeBanner();
  toast('👁️ Banner ocultado!');
}

// ══════════════════════════════════════════════
//  ADMIN MODAL
// ══════════════════════════════════════════════
let unlocked = false;

async function openAdminModal() {
  document.getElementById('modal-overlay').classList.add('open');
  if (!unlocked && hasValidAdminSession()) {
    // Sessão ainda válida (dentro dos 20 min) — pula a senha
    unlocked = true;
    document.getElementById('pass-gate').style.display='none';
    document.getElementById('admin-panel').style.display='block';
    document.getElementById('modal-title').textContent='PAINEL ADMIN';
    await loadHistory();
    renderAdminSelect(); renderMembersList(); renderRecentHistory(); renderQuickTap();
    return;
  }
  if (!unlocked) {
    document.getElementById('pass-gate').style.display='block';
    document.getElementById('admin-panel').style.display='none';
    document.getElementById('modal-title').textContent='ACESSO';
    setTimeout(()=>document.getElementById('pass-input').focus(),300);
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function overlayClick(e) {
  if (e.target===document.getElementById('modal-overlay')) closeModal();
}

document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
document.getElementById('pass-input').addEventListener('keydown', e=>{ if(e.key==='Enter') checkPass(); });

const SESSION_DURATION_MS = 20 * 60 * 1000; // 20 minutos

function saveAdminSession() {
  localStorage.setItem(LK.adminSession, String(Date.now()));
}

function hasValidAdminSession() {
  const raw = localStorage.getItem(LK.adminSession);
  if (!raw) return false;
  const ts = parseInt(raw);
  if (isNaN(ts)) return false;
  return (Date.now() - ts) < SESSION_DURATION_MS;
}

function clearAdminSession() {
  localStorage.removeItem(LK.adminSession);
}

async function checkPass() {
  const val = document.getElementById('pass-input').value;
  const storedPass = await getSetting('admin_pass', 'admin123');
  if (val===storedPass) {
    unlocked=true;
    saveAdminSession();
    document.getElementById('pass-gate').style.display='none';
    document.getElementById('admin-panel').style.display='block';
    document.getElementById('modal-title').textContent='PAINEL ADMIN';
    document.getElementById('pass-input').value='';
    document.getElementById('pass-err').textContent='';
    await loadHistory();
    renderAdminSelect(); renderMembersList(); renderRecentHistory(); renderQuickTap();
    if (window.__quicklaunchPending) {
      window.__quicklaunchPending = false;
      await admTab('evento');
      setTimeout(() => { document.getElementById('result-select')?.focus(); }, 300);
    }
  } else {
    document.getElementById('pass-err').textContent='✗ Senha incorreta';
    document.getElementById('pass-input').value='';
  }
}

async function admTab(name) {
  document.querySelectorAll('.adm-tab').forEach((b,i)=>{
    b.classList.toggle('active',['quick','pts','historico','members','challenges','distintivos','meta','evento','arquivados','subscribers','settings'][i]===name);
  });
  document.querySelectorAll('.adm-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if(name==='members'){renderMembersList();}
  if(name==='pts'){renderAdminSelect();renderRecentHistory();}
  if(name==='historico'){renderHistoryManagerList();}
  if(name==='arquivados'){renderArchivedEventsAdminList();}
  if(name==='quick'){renderQuickTap();}
  if(name==='challenges'){loadChallengeVideos().then(renderChallengesAdminList);}
  if(name==='distintivos'){loadBadges().then(bdInit);}
  if(name==='meta'){mtAdminInit();}
  if(name==='evento'){await renderEventAdminView();}
  if(name==='subscribers'){
    loadSubscriberVideos().then(renderSubscriberVideosAdminList);
    loadAccessCodes().then(renderCodesAdminList);
    const si = await getSubInfo();
    document.getElementById('subinfo-title').value = si.title;
    document.getElementById('subinfo-body').value = si.body;
  }
  if(name==='settings'){
    const ch = await getSetting('challenge_banner', { title:'', body:'', sub:'' });
    document.getElementById('ch-title').value = ch.title || '';
    document.getElementById('ch-body').value = ch.body || '';
    document.getElementById('ch-sub').value = ch.sub || '';
    await loadWhatsappConfigIntoForm();
    await mtLoadCfg().catch(() => {}); await loadStaffPw(); renderStaffPwState(); fillTeamLinks();
  }
  if(name==='evento'){ fillTeamLinks(); }
}

// ── TOQUE RÁPIDO ──
function renderQuickTap(filterText) {
  const members = MEMBERS.slice().sort((a,b)=>b.points-a.points);
  const term = (filterText !== undefined ? filterText : (document.getElementById('quick-search')?.value || '')).toLowerCase().trim();
  const filtered = term ? members.filter(m => m.name.toLowerCase().includes(term)) : members;
  const el = document.getElementById('quick-tap-list');
  if (!filtered.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:8px 0">Nenhum membro encontrado.</div>'; return; }
  el.innerHTML = filtered.map(m => `
    <div class="quick-tap-item" id="qt-${m.id}" onclick="quickAdd(${m.id})">
      <div class="qt-avatar">${m.emoji}</div>
      <div class="qt-name">${m.name}</div>
      <div class="qt-pts">${m.points}</div>
      <div class="qt-plus">+</div>
    </div>`).join('');
}

async function quickAdd(id) {
  const val = parseInt(document.getElementById('quick-value').value) || 3;
  const member = await addPointsToMember(id, val, 'Toque rápido');
  if (!member) return;

  const itemEl = document.getElementById('qt-'+id);
  if (itemEl) {
    itemEl.classList.add('flash');
    itemEl.querySelector('.qt-pts').textContent = member.points;
    setTimeout(()=>itemEl.classList.remove('flash'), 500);
  }
  await loadMembers();
  renderRanking();
  toast(`✅ +${val} pts para ${member.name}!`);
}

document.addEventListener('input', e => {
  if (e.target && e.target.id === 'quick-search') renderQuickTap();
});

// ── LISTA COLADA: distribuir pontos por nome (com busca por similaridade) ──
let LISTA_ROWS = [];

function listaEsc(t) { return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// minúsculas, sem acentos, sem pontuação: "Danielle ( MARCOS)" -> "danielle marcos"
function listaNorm(t) {
  return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function listaLev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({length:n+1}, (_,j)=>j);
  for (let i=1;i<=m;i++) {
    const cur = [i];
    for (let j=1;j<=n;j++) cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a[i-1]===b[j-1]?0:1));
    prev = cur;
  }
  return prev[n];
}
function listaSim(a, b) {
  if (!a.length && !b.length) return 1;
  return 1 - listaLev(a,b)/Math.max(a.length,b.length);
}
// Nota de 0 a 1. Nome extra em qualquer lado reduz a nota,
// então "danielle" casa melhor com "Danielle" do que com "Danielle (MARCOS)".
function listaScore(inputNorm, memberNorm) {
  if (!inputNorm || !memberNorm) return 0;
  if (inputNorm === memberNorm) return 1;
  const it = inputNorm.split(' '), mt = memberNorm.split(' ');
  const used = new Set();
  let sum = 0;
  it.forEach(t => {
    let best = 0, bi = -1;
    mt.forEach((m,i) => {
      if (used.has(i)) return;
      let s = listaSim(t, m);
      if (s < 0.7) s = 0;
      if (t.length >= 3 && m.startsWith(t)) s = Math.max(s, 0.85);   // abreviação: "dani" -> "danielle"
      if (t.length === 1 && m[0] === t) s = Math.max(s, 0.6);        // inicial: "m" -> "marcos"
      if (s > best) { best = s; bi = i; }
    });
    if (bi >= 0) { used.add(bi); sum += best; }
  });
  const coverage = sum / Math.max(it.length, mt.length);
  return Math.max(coverage, listaSim(inputNorm, memberNorm));
}
function listaMatch(raw) {
  const n = listaNorm(raw);
  const scored = MEMBERS.map(m => ({ m, s: listaScore(n, listaNorm(m.name)) })).sort((a,b)=>b.s-a.s);
  const best = scored[0], second = scored[1];
  const cands = scored.filter(x => x.s >= 0.4).slice(0,3).map(x => x.m);
  if (best && ((best.s >= 0.85 && (!second || best.s - second.s >= 0.15)) || (best.s >= 0.75 && (!second || best.s - second.s >= 0.3))))
    return { id: best.m.id, status: 'ok', cands, score: best.s };
  return { id: null, status: (best && best.s >= 0.5) ? 'ambig' : 'none', cands, score: best ? best.s : 0 };
}
function listaParse(text) {
  return String(text||'').split(/\r?\n|;/)
    .map(l => l.replace(/^\s*\d+\s*[.)\-–:]\s*/, '')          // "1. " / "2) "
               .replace(/^[^\p{L}\p{N}(]+/u, '')               // bullets, emojis, traços
               .replace(/[^\p{L}\p{N})]+$/u, '').trim())
    .filter(Boolean);
}
function listaConferir() {
  if (!MEMBERS.length) return toast('⚠️ Nenhum membro carregado');
  const lines = listaParse(document.getElementById('lista-input').value);
  if (!lines.length) return toast('⚠️ Cole a lista de nomes primeiro');
  LISTA_ROWS = lines.map(raw => {
    const r = listaMatch(raw);
    return { raw, id: r.id, status: r.status, cands: r.cands, include: !!r.id, nth: 0, edit: false };
  });
  listaRecount();
  listaRender();
}
// Conta quantas vezes cada pessoa aparece (repetir é permitido: cada linha vale um lançamento)
function listaRecount() {
  const c = {};
  LISTA_ROWS.forEach(r => { if (r.id) { c[r.id] = (c[r.id] || 0) + 1; r.nth = c[r.id]; } else r.nth = 0; });
}
function listaSetId(i, v) {
  const row = LISTA_ROWS[i]; const id = parseInt(v) || null;
  row.id = id; row.include = !!id; row.status = id ? 'manual' : row.status; row.edit = false;
  listaRecount();
  listaRender();
}
function listaToggle(i, on) { LISTA_ROWS[i].include = on; listaRender(); }
function listaEdit(i) { LISTA_ROWS[i].edit = !LISTA_ROWS[i].edit; listaRender(); }

function listaRender() {
  const el = document.getElementById('lista-preview');
  const val = parseInt(document.getElementById('quick-value').value) || 3;
  const sorted = MEMBERS.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  const colors = { ok:'var(--green)', manual:'var(--green)', ambig:'var(--gold)', none:'var(--red)' };
  const rowsHtml = LISTA_ROWS.map((r,i) => {
    const m = r.id ? MEMBERS.find(x=>x.id===r.id) : null;
    const norm = m && listaNorm(m.name) === listaNorm(r.raw);
    let tag = '';
    if (r.nth > 1) tag += `<span style="color:var(--gold);font-weight:700">🔁 ${r.nth}ª vez na lista</span> `;
    if (r.status === 'ambig') tag += '<span style="color:var(--gold)">❓ escolha quem é</span>';
    else if (r.status === 'none') tag += '<span style="color:var(--red)">❌ não encontrado</span>';
    else if (r.status === 'ok' && !norm) tag += '<span style="color:var(--green)">≈ similar</span>';
    const showSel = !r.id || r.edit;
    const candIds = new Set(r.cands.map(c=>c.id));
    const opts = '<option value="">— escolher —</option>' +
      (r.cands.length ? '<optgroup label="Sugestões">' + r.cands.map(c=>`<option value="${c.id}" ${c.id===r.id?'selected':''}>${listaEsc(c.name)}</option>`).join('') + '</optgroup>' : '') +
      '<optgroup label="Todos">' + sorted.filter(x=>!candIds.has(x.id)).map(x=>`<option value="${x.id}" ${x.id===r.id?'selected':''}>${listaEsc(x.name)}</option>`).join('') + '</optgroup>';
    return `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--s2);border:1px solid var(--border);border-left:3px solid ${colors[r.status]||'var(--border)'};border-radius:10px;margin-bottom:6px;">
      <input type="checkbox" style="width:20px;height:20px;margin-top:2px;flex-shrink:0;" ${r.include?'checked':''} ${r.id?'':'disabled'} onchange="listaToggle(${i},this.checked)">
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:700;">${m ? m.emoji+' '+listaEsc(m.name) : '<span style="color:var(--muted)">—</span>'}${m ? `<span style="font-weight:400;color:var(--muted);font-size:11px;"> · ${m.points} pts</span>` : ''}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">digitado: “${listaEsc(r.raw)}” ${tag}</div>
        ${showSel ? `<select style="margin-top:6px;padding:8px 10px;font-size:13px;" onchange="listaSetId(${i},this.value)">${opts}</select>` : ''}
      </div>
      ${r.id && !r.edit ? `<button class="btn-sm-danger" style="flex-shrink:0;" onclick="listaEdit(${i})">trocar</button>` : ''}
    </div>`;
  }).join('');
  const sel = LISTA_ROWS.filter(r=>r.include && r.id);
  const n = sel.length;
  const uniq = new Set(sel.map(r=>r.id)).size;
  const pend = LISTA_ROWS.filter(r=>!r.id).length;
  const reps = LISTA_ROWS.filter(r=>r.nth > 1).length;
  el.innerHTML = rowsHtml +
    (reps ? `<div style="font-size:12px;color:var(--gold);margin:8px 0;">🔁 ${reps} nome(s) repetido(s): cada repetição soma os pontos de novo.</div>` : '') +
    (pend ? `<div style="font-size:12px;color:var(--gold);margin:8px 0;">⚠️ ${pend} linha(s) sem nome definido serão ignoradas.</div>` : '') +
    `<button class="btn btn-blue" style="margin-top:8px;" ${n?'':'disabled'} onclick="listaDistribuir()">✅ Distribuir ${val>0?'+':''}${val} pts para ${uniq} pessoa${uniq===1?'':'s'}${n>uniq?` (${n} lançamentos)`:''}</button>`;
}

async function listaDistribuir() {
  const val = parseInt(document.getElementById('quick-value').value) || 3;
  const rows = LISTA_ROWS.filter(r => r.include && r.id);
  if (!rows.length) return toast('⚠️ Nenhum nome selecionado');
  const btn = document.querySelector('#lista-preview .btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Distribuindo...'; }
  let ok = 0, fail = 0;
  for (const r of rows) {
    const m = await addPointsToMember(r.id, val, 'Lista colada');
    if (m) ok++; else fail++;
  }
  await loadHistory(); await loadMembers();
  renderRanking(); renderQuickTap(); renderAdminSelect(); renderRecentHistory();
  LISTA_ROWS = [];
  document.getElementById('lista-preview').innerHTML = '';
  if (!fail) document.getElementById('lista-input').value = '';
  toast(fail ? `⚠️ ${ok} ok, ${fail} com erro` : `✅ ${ok} lançamento${ok===1?'':'s'} de ${val>0?'+':''}${val} pts feito${ok===1?'':'s'}!`);
}

// ── PONTOS ──
function renderAdminSelect() {
  const members = MEMBERS.slice().sort((a,b)=>b.points-a.points);
  document.getElementById('a-member').innerHTML =
    '<option value="">Selecionar membro...</option>'+
    members.map(m=>`<option value="${m.id}">${m.emoji} ${m.name} — ${m.points} pts</option>`).join('');
}

async function addPoints() {
  const id   = parseInt(document.getElementById('a-member').value);
  const pts  = parseInt(document.getElementById('a-points').value);
  const reason = document.getElementById('a-reason').value.trim()||'Sem motivo';
  const category = document.getElementById('a-category').value || 'treino';
  if(!id) return toast('⚠️ Selecione um membro!');
  if(isNaN(pts)||pts===0) return toast('⚠️ Informe os pontos!');

  const member = await addPointsToMember(id, pts, reason, category);
  if (!member) return;

  document.getElementById('a-points').value='';
  document.getElementById('a-reason').value='';
  document.getElementById('a-category').value='treino';
  await loadHistory();
  await loadMembers();
  renderAdminSelect(); renderRecentHistory(); renderRanking();
  toast(`✅ ${pts>0?'+':''}${pts} pts para ${member.name}!`);
}

function renderRecentHistory() {
  const history = HISTORY.slice(0,8);
  const el = document.getElementById('recent-history');
  if(!history.length){el.innerHTML='<div style="color:var(--muted);font-size:13px;padding:8px 0">Nenhum registro ainda.</div>';return;}
  el.innerHTML = history.map((h)=>{
    const d = new Date(h.created_at);
    const dateStr = d.toLocaleDateString('pt-BR');
    const timeStr = d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${h.member_name}</div>
        <div style="font-size:11px;color:var(--muted)">${h.reason} · ${dateStr} ${timeStr}${h.balance_after!=null ? ` · ficou com <strong style="color:var(--text)">${h.balance_after}</strong>` : ''}</div>
      </div>
      <span class="pts-tag ${h.points>=0?'pts-pos':'pts-neg'}">${h.points>0?'+':''}${h.points}</span>
      <button class="btn-sm-danger" onclick="deleteEntry(${h.id})">✕</button>
    </div>`;
  }).join('');
}

// ── HISTÓRICO — gerenciar categoria (remove ícone ⭐/🔥 sem mexer nos pontos) ──
async function renderHistoryManagerList() {
  await loadHistory();
  const history = HISTORY.slice(0, 30);
  const el = document.getElementById('history-manager-list');
  if (!history.length) { el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:8px 0">Nenhum registro ainda.</div>'; return; }
  el.innerHTML = history.map(h => {
    const d = new Date(h.created_at);
    const dateStr = d.toLocaleDateString('pt-BR');
    const timeStr = d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const cat = h.category || 'treino';
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--border);flex-wrap:wrap">
      <div style="flex:1;min-width:140px">
        <div style="font-size:13px;font-weight:700">${h.member_name}</div>
        <div style="font-size:11px;color:var(--muted)">${h.reason} · ${dateStr} ${timeStr}</div>
      </div>
      <span class="pts-tag ${h.points>=0?'pts-pos':'pts-neg'}">${h.points>0?'+':''}${h.points}</span>
      <select onchange="changeHistoryCategory(${h.id}, this.value)" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-size:12px;">
        <option value="treino" ${cat==='treino'?'selected':''}>🏋️ Treino</option>
        <option value="desafio" ${cat==='desafio'?'selected':''}>🔥 Desafio</option>
        <option value="evento" ${cat==='evento'?'selected':''}>⭐ Evento</option>
      </select>
      <button class="btn-sm-danger" onclick="deleteEntry(${h.id})">✕</button>
    </div>`;
  }).join('');
}

async function changeHistoryCategory(historyId, newCategory) {
  const { error } = await sb.from('history').update({ category: newCategory }).eq('id', historyId);
  if (error) { toast('⚠️ Erro ao atualizar categoria'); console.error(error); return; }
  const entry = HISTORY.find(h => h.id === historyId);
  if (entry) entry.category = newCategory;
  await loadMembers();
  renderRanking();
  toast('✅ Categoria atualizada — ícone ajustado no ranking!');
}

async function deleteEntry(historyId) {
  const entry = HISTORY.find(h=>h.id===historyId);
  if(!entry) return;
  const member = MEMBERS.find(m=>m.id===entry.member_id);
  if(member){
    const newPts = Math.max(0, member.points - entry.points);
    await sb.from('members').update({ points:newPts }).eq('id', member.id);
    member.points = newPts;
  }
  await sb.from('history').delete().eq('id', historyId);
  await loadHistory();
  renderRecentHistory(); renderAdminSelect(); renderRanking();
  toast('🗑️ Removido!');
}

// ── MEMBROS ──
async function addMember() {
  const name  = document.getElementById('n-name').value.trim();
  const emoji = document.getElementById('n-emoji').value.trim()||'😊';
  const gender = document.getElementById('n-gender').value;
  const birthday = document.getElementById('n-birthday').value || null;
  if(!name) return toast('⚠️ Digite o nome!');
  const { data, error } = await sb.from('members').insert({ name, emoji, points:0, gender, birthday }).select();
  if (error) { toast('⚠️ Erro ao cadastrar'); console.error(error); return; }
  MEMBERS.push(data[0]);
  document.getElementById('n-name').value='';
  document.getElementById('n-emoji').value='';
  document.getElementById('n-gender').value='F';
  document.getElementById('n-birthday').value='';
  renderMembersList(); renderAdminSelect(); renderRanking();
  toast(`✅ ${name} cadastrado!`);
}

let editingMemberId = null;
// ══════════════════════════════════════════════
//  SELETOR DE EMOJIS (catálogo amplo, estilo Instagram/WhatsApp)
// ══════════════════════════════════════════════
const EMOJI_CATALOG = {
  'Rostos': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀'],
  'Gestos': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪','🦾'],
  'Animais': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🐇','🦝','🦨','🦡','🦫','🦦','🦥'],
  'Comida': ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪'],
  'Esportes': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️'],
  'Objetos': ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','💽','💾','💿','📷','📸','📹','🎥','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🧰','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️'],
  'Símbolos': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅'],
  'Estrelas': ['⭐','🌟','✨','💫','🔥','☀️','🌙','⚡','🌈','☁️','❄️','💧','🌊','🌪️']
};

let activeEmojiPickerInputId = null;

function buildEmojiPickerHtml() {
  let html = '';
  for (const [category, emojis] of Object.entries(EMOJI_CATALOG)) {
    html += `<div class="emoji-picker-cat-label">${category}</div>`;
    html += emojis.map(e => `<button type="button" onclick="pickEmoji('${e}')">${e}</button>`).join('');
  }
  return html;
}

function toggleEmojiPicker(inputId) {
  // Fecha qualquer outro picker aberto
  document.querySelectorAll('.emoji-picker-grid').forEach(el => {
    if (el.id !== 'emoji-picker-' + inputId) el.style.display = 'none';
  });
  const picker = document.getElementById('emoji-picker-' + inputId);
  if (!picker) return;
  const isOpen = picker.style.display === 'grid';
  if (isOpen) {
    picker.style.display = 'none';
    activeEmojiPickerInputId = null;
  } else {
    if (!picker.innerHTML) picker.innerHTML = buildEmojiPickerHtml();
    picker.style.display = 'grid';
    activeEmojiPickerInputId = inputId;
  }
}

function pickEmoji(emoji) {
  if (!activeEmojiPickerInputId) return;
  const input = document.getElementById(activeEmojiPickerInputId);
  if (input) input.value = emoji;
  const picker = document.getElementById('emoji-picker-' + activeEmojiPickerInputId);
  if (picker) picker.style.display = 'none';
  activeEmojiPickerInputId = null;
}

document.addEventListener('click', (e) => {
  if (!activeEmojiPickerInputId) return;
  const picker = document.getElementById('emoji-picker-' + activeEmojiPickerInputId);
  const input = document.getElementById(activeEmojiPickerInputId);
  if (picker && !picker.contains(e.target) && e.target !== input) {
    picker.style.display = 'none';
    activeEmojiPickerInputId = null;
  }
});

function renderMembersList() {
  const members = MEMBERS.slice().sort((a,b)=>b.points-a.points);
  const el = document.getElementById('members-list');
  if(!members.length){el.innerHTML='<div style="color:var(--muted);font-size:13px">Nenhum membro.</div>';return;}
  el.innerHTML = members.map(m => {
    if (editingMemberId === m.id) {
      return `
      <div class="member-chip" style="flex-direction:column;align-items:stretch;gap:10px;padding:14px 0">
        <div class="field-group" style="margin-bottom:0"><label class="field-label">Nome</label><input type="text" id="em-name-${m.id}" value="${m.name.replace(/"/g,'&quot;')}"></div>
        <div class="field-group" style="margin-bottom:0">
          <label class="field-label">Emoji (avatar)</label>
          <input type="text" id="em-emoji-${m.id}" value="${(m.emoji||'').replace(/"/g,'&quot;')}" maxlength="4" readonly style="cursor:pointer" onclick="toggleEmojiPicker('em-emoji-${m.id}')">
          <div id="emoji-picker-em-emoji-${m.id}" class="emoji-picker-grid" style="display:none"></div>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label class="field-label">Gênero (categoria do ranking)</label>
          <select id="em-gender-${m.id}" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
            <option value="F" ${m.gender==='F'?'selected':''}>👩 Feminino</option>
            <option value="M" ${m.gender==='M'?'selected':''}>👨 Masculino</option>
          </select>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label class="field-label">Aniversário (opcional)</label>
          <input type="date" id="em-birthday-${m.id}" value="${m.birthday||''}" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;">
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-blue" style="flex:1;padding:10px" onclick="saveEditMember(${m.id})">💾 Salvar</button>
          <button class="btn" style="flex:1;padding:10px;background:var(--s2);color:var(--text)" onclick="cancelEditMember()">Cancelar</button>
        </div>
      </div>`;
    }
    return `
    <div class="member-chip">
      <div class="chip-avatar">${m.emoji}</div>
      <div class="chip-info">
        <div class="chip-name">${m.name} ${isKidsCategory(m) ? '<span class="reg-member-badge" style="background:rgba(125,211,245,0.15);color:#7dd3f5;border-color:rgba(125,211,245,0.35)">🧒 INFANTIL</span>' : ''}</div>
        <div class="chip-id">${m.points} pontos · ${m.gender==='M' ? '👨 Masculino' : '👩 Feminino'}${m.birthday ? ' · ' + calcAge(m.birthday) + ' anos' : ''}</div>
      </div>
      <div class="chip-pts">${m.points}</div>
      <button class="btn-sm-danger" style="background:none;color:var(--muted);border:1px solid var(--border)" onclick="startEditMember(${m.id})">✏️</button>
      <button class="btn-sm-danger" onclick="deleteMember(${m.id})">✕</button>
    </div>`;
  }).join('');
}

function startEditMember(id) { editingMemberId = id; renderMembersList(); }
function cancelEditMember() { editingMemberId = null; renderMembersList(); }
async function saveEditMember(id) {
  const name = document.getElementById(`em-name-${id}`).value.trim();
  const emoji = document.getElementById(`em-emoji-${id}`).value.trim()||'😊';
  const gender = document.getElementById(`em-gender-${id}`).value;
  const birthday = document.getElementById(`em-birthday-${id}`).value || null;
  if (!name) return toast('⚠️ Digite o nome!');
  const { error } = await sb.from('members').update({ name, emoji, gender, birthday }).eq('id', id);
  if (error) { toast('⚠️ Erro ao salvar'); console.error(error); return; }
  const m = MEMBERS.find(m=>m.id===id);
  if (m) Object.assign(m, { name, emoji, gender, birthday });
  editingMemberId = null;
  renderMembersList(); renderAdminSelect(); renderRanking();
  toast('✅ Membro atualizado!');
}

async function deleteMember(id) {
  if(!confirm('Remover este membro e todo seu histórico?')) return;
  await sb.from('members').delete().eq('id', id);
  MEMBERS = MEMBERS.filter(m=>m.id!==id);
  HISTORY = HISTORY.filter(h=>h.member_id!==id);
  renderMembersList(); renderAdminSelect(); renderRanking();
  toast('🗑️ Membro removido!');
}

// ── CONFIG ──
function setManualDate() {
  const txt = document.getElementById('manual-date').value.trim();
  if (!txt) return toast('⚠️ Digite o texto da data!');
  lset(LK.manualDate, txt);
  document.getElementById('manual-date').value='';
  renderRanking();
  toast('📌 Data atualizada!');
}

async function changePass() {
  const np = document.getElementById('new-pass').value.trim();
  if(np.length<4) return toast('⚠️ Mínimo 4 caracteres!');
  const ok = await setSetting('admin_pass', np);
  if (!ok) return;
  document.getElementById('new-pass').value='';
  toast('🔑 Senha atualizada!');
}

async function resetPts() {
  if(!confirm('Zerar TODOS os pontos?')) return;
  for (const m of MEMBERS) {
    await sb.from('members').update({ points:0 }).eq('id', m.id);
    m.points = 0;
  }
  await sb.from('history').delete().neq('id', 0);
  HISTORY = [];
  renderMembersList(); renderAdminSelect(); renderRecentHistory(); renderRanking();
  toast('🔄 Pontos zerados!');
}

// ── TOAST ──
let toastT;
function toast(msg) {
  const el = document.getElementById('toast');
  el.innerHTML = `<button class="toast-close" onclick="closeToast()">✕</button>${msg}`;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove('show'), 10000);
}

function closeToast() {
  document.getElementById('toast').classList.remove('show');
  clearTimeout(toastT);
}

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-tab').forEach((b,i)=>{
    b.classList.toggle('active', ['all','F','M','kids'][i]===f);
  });
  renderRanking();
}


// ══════════════════════════════════════════════
//  DESCRIÇÃO POR PARTICIPANTE + MODO TV DE RESULTADOS
// ══════════════════════════════════════════════
// As descrições ficam em app_settings ('result_notes'), então NÃO precisa criar coluna nova no banco.
// Chave: id da inscrição + sufixo do sub-evento ('' | '_1' | '_2').
let RESULT_NOTES = {};
async function loadResultNotes() {
  const v = await getSetting('result_notes', {});
  RESULT_NOTES = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
}
// Lê a descrição: do snapshot arquivado (result_note*) ou da lista ao vivo
function getResultNote(r, sfx) {
  const k = 'result_note' + (sfx || '');
  if (r[k] !== undefined) return r[k] || '';
  if (r.id !== undefined) return RESULT_NOTES[r.id + (sfx || '')] || '';
  return '';
}
async function saveResultNote(regId, sfx, text) {
  await loadResultNotes();
  const key = regId + (sfx || '');
  text = (text || '').trim();
  const before = RESULT_NOTES[key] || '';
  if (text === before) return true;
  if (text) RESULT_NOTES[key] = text; else delete RESULT_NOTES[key];
  return await setSetting('result_notes', RESULT_NOTES);
}
function tvEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
async function updateArchiveNote(idx, subCtx, newValue) {
  if (!currentEditingArchiveId) return;
  const archive = ARCHIVED_EVENTS.find(a => a.id === currentEditingArchiveId);
  if (!archive || !archive.snap.registrations[idx]) return;
  const field = subCtx ? 'result_note_' + subCtx : 'result_note';
  archive.snap.registrations[idx][field] = newValue.trim() || null;
  const { error } = await sb.from('event_archives').update({ data: JSON.stringify(archive.snap) }).eq('id', currentEditingArchiveId);
  if (error) { toast('⚠️ Erro ao salvar descrição'); console.error(error); return; }
  toast('✅ Descrição atualizada no arquivo!');
}

// ── Link da TV (admin) ──
function tvLinkUrl() { return location.href.split('#')[0].split('?')[0] + '?tv=resultados'; }
function copyTvLink() {
  const url = tvLinkUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(() => toast('📋 Link da TV copiado!'), () => toast(url));
  else { const el = document.getElementById('tv-link-input'); el.select(); document.execCommand('copy'); toast('📋 Link da TV copiado!'); }
}
function openTvLink() { window.open(tvLinkUrl(), '_blank'); }

// ── Modo TV ──
let TV_SIG = '', TV_BYNAME = false;

function tvIsCap(v) { return /time\s*cap/i.test(String(v || '')); }
function tvSortKey(v, type) {
  if (tvIsCap(v)) return null;
  if (type === 'tempo') {
    const p = String(v).trim().split(':').map(x => parseFloat(x.replace(',', '.')));
    if (!p.length || p.some(isNaN)) return null;
    return [p.reduce((acc, n) => acc * 60 + n, 0)];                   // menor tempo = melhor
  }
  const nums = (String(v).match(/\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(',', '.')));
  return nums.length ? nums.map(n => -n) : null;                       // mais rounds/reps = melhor
}
function tvCompare(a, b, type, field) {
  const ka = tvSortKey(a[field], type), kb = tvSortKey(b[field], type);
  if (ka && !kb) return -1;
  if (!ka && kb) return 1;
  if (ka && kb) { for (let i = 0; i < Math.max(ka.length, kb.length); i++) { const d = (ka[i] ?? 0) - (kb[i] ?? 0); if (d) return d; } }
  return a.name.localeCompare(b.name);
}
function tvGroupsHtml(regs, type, descs, field, stacked) {
  const sfx = field.replace('result_value', '');
  const order = [
    { key:'Iniciante', emoji:'🟢', name:'Verde' },
    { key:'Intermediário', emoji:'🟡', name:'Amarelo' },
    { key:'Avançado', emoji:'🟠', name:'Laranja' }
  ];
  const cols = [];
  order.forEach(g => {
    const items = regs.filter(r => (r.fitness_level || 'Iniciante') === g.key)
      .slice().sort((a, b) => TV_BYNAME ? a.name.localeCompare(b.name) : tvCompare(a, b, type, field));
    if (!items.length) return;
    const title = descs[g.key] ? descs[g.key] : `Grupo ${g.name}`;
    let pos = 0;
    const rows = items.map(r => {
      const cap = tvIsCap(r[field]);
      let posHtml = '', cls = '';
      if (!TV_BYNAME) {
        if (!cap && tvSortKey(r[field], type)) { pos++; posHtml = pos <= 3 ? ['🥇', '🥈', '🥉'][pos - 1] : pos + 'º'; if (pos <= 3) cls = ' p' + pos; }
        else posHtml = '–';
      }
      const note = getResultNote(r, sfx);
      return `<div class="tv-row${cls}">
        ${TV_BYNAME ? '' : `<div class="tv-pos">${posHtml}</div>`}
        <div class="tv-who"><div class="tv-name">${tvEsc(r.name)}</div>${note ? `<div class="tv-note">${tvEsc(note)}</div>` : ''}</div>
        <div class="tv-val${cap ? ' cap' : ''}">${tvEsc(r[field])}</div>
      </div>`;
    }).join('');
    cols.push(`<div class="tv-group"><div class="tv-group-title">${g.emoji} ${tvEsc(title)}</div><div class="tv-scroll">${rows}</div></div>`);
  });
  if (!cols.length) return '';
  const style = stacked ? `grid-template-rows:repeat(${cols.length},minmax(0,1fr))` : `grid-template-columns:repeat(${cols.length},minmax(0,1fr))`;
  return `<div class="tv-groups${stacked ? ' stacked' : ''}" style="${style}">${cols.join('')}</div>`;
}

async function tvRefresh() {
  try {
    EVENT_INFO = null; eventRegLoaded = false;
    const info = await getEventInfo();
    await loadEventRegistrations();
    await loadResultNotes();
    const descs = await getSetting('level_descriptions', {});
    const all = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
    const panels = [];
    if (info.is_dual) {
      [1, 2].forEach(n => {
        const type = info['result_type_' + n], field = 'result_value_' + n;
        const regs = type ? all.filter(r => r[field]) : [];
        if (regs.length) panels.push({
          title: (n === 1 ? '🥇 ' : '🥈 ') + (info['sub' + n + '_name'] || 'Evento ' + n),
          cap: formatTimeCap(info['time_cap_seconds_' + n]), type, field, regs
        });
      });
    } else if (info.result_type) {
      const regs = all.filter(r => r.result_value);
      if (regs.length) panels.push({ title: '', cap: formatTimeCap(info.time_cap_seconds), type: info.result_type, field: 'result_value', regs });
    }
    const dual = !!info.is_dual;
    const bodyHtml = panels.length
      ? panels.map(p => `<div class="tv-panel">${dual ? `<div class="tv-panel-title">${tvEsc(p.title)}${p.cap ? `<span class="tv-cap">TIME CAP ${p.cap}</span>` : ''}</div>` : ''}${tvGroupsHtml(p.regs, p.type, descs, p.field, dual && panels.length > 1)}</div>`).join('')
      : `<div class="tv-empty">⏳ Aguardando os primeiros resultados…</div>`;
    const singleCap = (!dual && panels[0] && panels[0].cap) ? `<span class="tv-cap">TIME CAP: ${panels[0].cap}</span>` : '';
    const sig = JSON.stringify([info.name, panels.length, bodyHtml, singleCap]);
    if (sig === TV_SIG) return;            // nada mudou: não mexe na tela (evita reiniciar a rolagem)
    TV_SIG = sig;
    document.getElementById('tv-title').textContent = info.name || 'Resultados';
    document.getElementById('tv-cap-wrap').innerHTML = singleCap;
    const body = document.getElementById('tv-body');
    body.style.gridTemplateColumns = `repeat(${Math.max(1, panels.length)},minmax(0,1fr))`;
    body.innerHTML = bodyHtml;
    document.title = (info.name ? info.name + ' · ' : '') + 'Resultados';
  } catch (e) { console.error('tv', e); }
}

// Rolagem automática suave para listas maiores que a tela (pausa no começo e no fim)
function tvAutoScroll() {
  const st = new WeakMap(); let last = performance.now();
  function step(t) {
    const dt = Math.min(100, t - last); last = t;
    document.querySelectorAll('#tv-results-view .tv-scroll').forEach(el => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 2) { el.scrollTop = 0; return; }
      let s = st.get(el); if (!s) { s = { pos: 0, wait: 3500, atEnd: false }; st.set(el, s); }
      if (s.wait > 0) { s.wait -= dt; return; }
      if (s.atEnd) { s.pos = 0; s.atEnd = false; s.wait = 3500; el.scrollTop = 0; return; }
      s.pos += dt * 0.04;
      if (s.pos >= max) { s.pos = max; s.atEnd = true; s.wait = 3500; }
      el.scrollTop = s.pos;
    });
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function startTvResults(params) {
  TV_BYNAME = params.get('ordem') !== 'tempo';      // padrão: ordem alfabética, sem medalhas
  document.getElementById('tv-results-view').classList.add('on');
  try { if (navigator.wakeLock) { const wl = () => navigator.wakeLock.request('screen').catch(() => {}); wl(); document.addEventListener('visibilitychange', () => { if (!document.hidden) wl(); }); } } catch (e) {}
  await tvRefresh();
  setInterval(tvRefresh, 15000);
  tvAutoScroll();
}


// ══════════════════════════════════════════════
//  Nº DE INSCRIÇÃO / PULSEIRA (por evento; por prova no evento duplo)
// ══════════════════════════════════════════════
// Guardado em app_settings, uma linha por inscrição: 'bib:<evento>:<prova>:<inscrição>' = número.
// <prova> = '0' (evento simples) ou '1' / '2' (evento duplo). Não precisa mexer no banco.
// Automático: próximo número da fila de cada prova, em ordem de inscrição. Editável à mão.
let BIBS = {};
const bibPad = n => String(n).padStart(2, '0');
function bibOf(r, sub) { const n = BIBS[r.id + ':' + sub]; return n == null ? null : n; }
function bibTxt(r, sub) { const n = bibOf(r, sub); return n == null ? '' : ' · nº ' + bibPad(n); }
function fmtRegWhen(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function bibSubsFor(r, info) {
  if (!info.is_dual) return ['0'];
  const n1 = info.sub1_name || 'Evento 1', n2 = info.sub2_name || 'Evento 2', out = [];
  if (evRegInSub(r, n1, n2)) out.push('1');
  if (evRegInSub(r, n2, n1)) out.push('2');
  return out;
}
async function loadBibs(info) {
  BIBS = {};
  if (!info || !info.id) return;
  const { data, error } = await sb.from('app_settings').select('key,value').like('key', 'bib:' + info.id + ':%').limit(5000);
  if (error) { console.error(error); return; }
  (data || []).forEach(row => {
    const p = String(row.key).split(':');           // bib : evento : prova : inscrição
    const n = parseInt(row.value, 10);
    if (p.length === 4 && !isNaN(n)) BIBS[p[3] + ':' + p[2]] = n;
  });
}
// Carrega os números e dá o próximo número a quem ainda não tem (ordem de inscrição)
async function ensureBibs(info) {
  if (!info || !info.id) return;
  await loadBibs(info);
  const regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id).slice()
    .sort((a, b) => (new Date(a.created_at) - new Date(b.created_at)) || (a.id - b.id));
  const maxBy = {};
  Object.keys(BIBS).forEach(k => { const sub = k.split(':')[1]; maxBy[sub] = Math.max(maxBy[sub] || 0, BIBS[k]); });
  const rows = [], keys = [];
  regs.forEach(r => bibSubsFor(r, info).forEach(sub => {
    const k = r.id + ':' + sub;
    if (BIBS[k] == null) {
      const n = (maxBy[sub] || 0) + 1; maxBy[sub] = n; BIBS[k] = n; keys.push(k);
      rows.push({ key: `bib:${info.id}:${sub}:${r.id}`, value: String(n), updated_at: new Date().toISOString() });
    }
  }));
  if (!rows.length) return;
  const { error } = await sb.from('app_settings').upsert(rows, { onConflict: 'key' });
  if (error) { console.error(error); keys.forEach(k => delete BIBS[k]); }
}
async function setRegBib(reg, sub, raw, info) {
  raw = String(raw == null ? '' : raw).trim();
  const key = `bib:${info.id}:${sub}:${reg.id}`;
  if (raw === '') {                                    // vazio = volta para o automático
    await sb.from('app_settings').delete().eq('key', key);
    delete BIBS[reg.id + ':' + sub];
    await ensureBibs(info);
    return true;
  }
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 0) { toast('⚠️ Número inválido'); return false; }
  if (BIBS[reg.id + ':' + sub] === n) return true;
  const dup = EVENT_REGISTRATIONS.find(o => o.id !== reg.id && o.event_id === info.id && BIBS[o.id + ':' + sub] === n);
  if (dup && !confirm(`O número ${bibPad(n)} já é de ${dup.name}. Salvar mesmo assim?`)) return false;
  const { error } = await sb.from('app_settings').upsert({ key, value: String(n), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) { toast('⚠️ Erro ao salvar o número'); console.error(error); return false; }
  BIBS[reg.id + ':' + sub] = n;
  return true;
}

// ── Editar inscrição: linhas do nº de pulseira conforme os eventos marcados ──
function refreshEditBibRows() {
  const info = EVENT_INFO || defaultEventInfo();
  const reg = EVENT_REGISTRATIONS.find(r => r.id === editingRegId); if (!reg) return;
  const show = (sub, on) => {
    const row = document.getElementById('er-bib-row-' + sub), inp = document.getElementById('er-bib-' + sub);
    row.style.display = on ? '' : 'none';
    if (on && inp.dataset.loaded !== String(reg.id)) { inp.value = BIBS[reg.id + ':' + sub] != null ? BIBS[reg.id + ':' + sub] : ''; inp.dataset.loaded = String(reg.id); }
  };
  if (info.is_dual) {
    document.getElementById('er-bib-label-1').textContent = info.sub1_name || 'Evento 1';
    document.getElementById('er-bib-label-2').textContent = info.sub2_name || 'Evento 2';
    show('0', false); show('1', document.getElementById('er-sub1-check').checked); show('2', document.getElementById('er-sub2-check').checked);
  } else { show('0', true); show('1', false); show('2', false); }
}
async function saveEditBibs(info, reg) {
  if (!reg) return true;
  const subs = info.is_dual
    ? [document.getElementById('er-sub1-check').checked ? '1' : null, document.getElementById('er-sub2-check').checked ? '2' : null].filter(Boolean)
    : ['0'];
  let ok = true;
  for (const sub of subs) {
    const inp = document.getElementById('er-bib-' + sub);
    const before = BIBS[reg.id + ':' + sub];
    const raw = inp.value.trim();
    if (raw === '' && before == null) continue;               // nada a fazer; o automático entra no ensureBibs
    if (raw !== '' && parseInt(raw, 10) === before) continue;
    if (!(await setRegBib(reg, sub, raw, info))) ok = false;
  }
  await ensureBibs(info);
  return ok;
}
// ── Tela da equipe: nº de pulseira do inscrito selecionado ──
function fillResultBib(reg, info) {
  const wrap = document.getElementById('result-bib-wrap'), inp = document.getElementById('result-bib-input'); if (!wrap) return;
  const sub = info.is_dual ? currentSubEventContext : '0';
  inp.value = (reg && BIBS[reg.id + ':' + sub] != null) ? BIBS[reg.id + ':' + sub] : '';
  wrap.style.display = reg ? '' : 'none';
}
async function updateResultBib() {
  const regId = parseInt(document.getElementById('result-select').value); if (!regId) return;
  const reg = EVENT_REGISTRATIONS.find(r => r.id === regId); if (!reg) return;
  const info = EVENT_INFO || defaultEventInfo();
  const sub = info.is_dual ? currentSubEventContext : '0';
  const ok = await setRegBib(reg, sub, document.getElementById('result-bib-input').value, info);
  fillResultBib(reg, info);
  if (ok) { populateResultSelect(); document.getElementById('result-select').value = regId; toast(`✅ Nº de ${reg.name} atualizado!`); }
}

// ── Configuração do evento: time cap por prova + liberação do link da equipe ──
function capFrom(minId, secId) {
  return (parseInt(document.getElementById(minId).value) || 0) * 60 + (parseInt(document.getElementById(secId).value) || 0);
}
function fillTimeCapFields(info) {
  const set = (x, sec) => {
    document.getElementById('ev-cfg-timecap-min' + x).value = sec ? Math.floor(sec / 60) : '';
    document.getElementById('ev-cfg-timecap-sec' + x).value = sec ? sec % 60 : '';
  };
  set('', info.time_cap_seconds || 0);
  set('-1', info.time_cap_seconds_1 || 0);
  set('-2', info.time_cap_seconds_2 || 0);
}
// ══════════════════════════════════════════════
//  CRONÔMETRO DO EVENTO — admin: liberar / começar / pausar / encerrar · equipe: finalizar
// ══════════════════════════════════════════════
// Estado em event_info.clk[prova] = { state: 'ready'|'running'|'paused'|'ended', startAt: ms, accMs: ms }.
// prova = '1' (evento simples) ou '1' / '2' (evento duplo). event_info.live_sub = prova liberada para a equipe.
// O relógio roda sozinho a partir do instante do "Começar" e trava no Time Cap.
function clkKeys(info) { return info.is_dual ? ['1', '2'] : ['1']; }
function clkCapMs(info, key) {
  const sec = info.is_dual ? (key === '2' ? info.time_cap_seconds_2 : info.time_cap_seconds_1) : info.time_cap_seconds;
  return (sec || 0) * 1000;
}
function clkEntry(info, key) {
  const c = (info.clk && info.clk[key]) || null;
  if (info.live_sub === key) return c || { state: 'ready', startAt: 0, accMs: 0 };
  return (c && c.state === 'ended') ? c : { state: 'idle', startAt: 0, accMs: 0 };
}
function clkRawMs(e, now) { return (e.accMs || 0) + (e.state === 'running' ? Math.max(0, now - (e.startAt || now)) : 0); }
function clkView(info, key, now) {
  const e = clkEntry(info, key), cap = clkCapMs(info, key), raw = clkRawMs(e, now);
  const started = e.state === 'running' || e.state === 'paused' || e.state === 'ended';
  const timeUp = started && cap > 0 && raw >= cap;
  const ms = cap > 0 ? Math.min(raw, cap) : raw;
  return { state: e.state, ms, cap, timeUp, remainingMs: cap > 0 ? Math.max(0, cap - ms) : null };
}
const clkFmt = ms => formatTime(Math.floor(ms / 1000));
const CLK_LABEL = { idle: '🔒 Bloqueado', ready: '🟢 Liberado — aguardando início', running: '▶ Em andamento', paused: '⏸ Pausado', ended: '⏹ Encerrado' };
function liveName(info, key) {
  return info.is_dual ? (key === '2' ? '🥈 ' + (info.sub2_name || 'Evento 2') : '🥇 ' + (info.sub1_name || 'Evento 1')) : (info.name || 'Evento');
}

function renderLiveControls(info) {
  const box = document.getElementById('live-ctl-rows'); if (!box) return;
  info = info || EVENT_INFO || defaultEventInfo();
  if (!info.id) { box.innerHTML = '<div class="live-hint">Salve o evento primeiro para poder liberar.</div>'; return; }
  const now = Date.now();
  box.innerHTML = clkKeys(info).map(k => {
    const v = clkView(info, k, now);
    const up = v.timeUp && v.state === 'running';
    const st = up ? 'timeup' : v.state;
    const chip = up ? '⏰ TIME CAP atingido' : CLK_LABEL[v.state];
    const btn = (act, label, cls) => `<button class="live-btn ${cls || ''}" onclick="clkAction('${k}','${act}')">${label}</button>`;
    let btns = '';
    if (v.state === 'idle') btns = btn('release', '🔓 Liberar', 'go');
    else if (v.state === 'ready') btns = btn('start', '▶ Começar', 'go') + btn('block', '🔒 Bloquear');
    else if (v.state === 'running') btns = (up ? '' : btn('pause', '⏸ Pausar')) + btn('end', '⏹ Encerrar', 'stop');
    else if (v.state === 'paused') btns = btn('resume', '▶ Retomar', 'go') + btn('end', '⏹ Encerrar', 'stop');
    else if (v.state === 'ended') btns = btn('release', '🔓 Liberar de novo (zera)') + btn('block', '🔒 Bloquear');
    return `<div class="live-row" data-key="${k}">
      <div class="live-row-head"><div class="live-row-name">${tvEsc(liveName(info, k))}</div><span class="live-chip live-${st}">${chip}</span></div>
      <div class="live-clock" data-clk="${k}" data-up="${v.timeUp ? 1 : 0}">${clkFmt(v.ms)}</div>
      <div class="live-sub" data-clk-sub="${k}">${v.cap ? 'TIME CAP ' + clkFmt(v.cap) + ' · restam ' + clkFmt(v.remainingMs) : 'Sem time cap definido (o relógio só para no clique)'}</div>
      <div class="live-btns">${btns}</div>
    </div>`;
  }).join('');
}

async function clkAction(key, action) {
  const tap = Date.now();                                  // o relógio parte do instante do toque
  EVENT_INFO = null;
  const info = await getEventInfo();
  if (!info.id) return toast('⚠️ Salve o evento antes de liberar');
  const clk = { ...(info.clk || {}) };
  const other = key === '1' ? '2' : '1';
  const cur = clkEntry(info, key);
  const capMs = clkCapMs(info, key);
  const frozen = e => Math.min(clkRawMs(e, tap), capMs > 0 ? capMs : Infinity);
  let live = info.live_sub || '';
  let msg = '';

  if (action === 'release' || action === 'reset') {
    if (info.is_dual && live === other) {                   // só um evento fica ao vivo por vez
      const oe = clkEntry(info, other);
      if (oe.state === 'running' || oe.state === 'paused') {
        if (!confirm(`“${liveName(info, other).replace(/^\S+\s/, '')}” está em andamento. Encerrar e liberar este?`)) return;
        clk[other] = { state: 'ended', startAt: 0, accMs: Math.min(clkRawMs(oe, tap), clkCapMs(info, other) > 0 ? clkCapMs(info, other) : Infinity) };
      } else delete clk[other];
    }
    live = key; clk[key] = { state: 'ready', startAt: 0, accMs: 0 };
    msg = '🟢 Liberado para a equipe. Toque em ▶ Começar na largada';
  } else if (action === 'block') {
    if (live === key) live = '';
    delete clk[key];
    msg = '🔒 Bloqueado: a equipe não consegue lançar';
  } else if (action === 'start') {
    if (live !== key) return;
    clk[key] = { state: 'running', startAt: tap, accMs: 0 };
    msg = '▶ Cronômetro rodando!';
  } else if (action === 'pause') {
    if (cur.state !== 'running') return;
    clk[key] = { state: 'paused', startAt: 0, accMs: frozen(cur) };
    msg = '⏸ Pausado';
  } else if (action === 'resume') {
    if (cur.state !== 'paused') return;
    clk[key] = { state: 'running', startAt: tap, accMs: cur.accMs || 0 };
    msg = '▶ Retomado';
  } else if (action === 'end') {
    if (cur.state !== 'running' && cur.state !== 'paused') return;
    if (!confirm('Encerrar o evento? A equipe não poderá mais finalizar participantes por este link.')) return;
    clk[key] = { state: 'ended', startAt: 0, accMs: frozen(cur) };
    msg = '⏹ Evento encerrado';
  } else return;

  const newInfo = { ...info, live_sub: live, clk };
  if (!(await setSetting('event_info', newInfo))) return;
  EVENT_INFO = newInfo;
  renderLiveControls(newInfo);
  toast(msg);
}

// Relógios de tela (admin e equipe) andam a cada segundo
// Lista de inscritos do admin acompanha o que a equipe faz (ausente, resultado = presente, novas inscrições)
let ADMIN_LIVE_BUSY = false;
function adminRegsSig(info) {
  return EVENT_REGISTRATIONS.filter(r => r.event_id === info.id)
    .map(r => [r.id, r.name, r.fitness_level, r.sub_events, r.attended, r.attended_1, r.attended_2, r.result_value, r.result_value_1, r.result_value_2].join('~')).join('|');
}
async function adminLiveRefresh() {
  if (ADMIN_LIVE_BUSY) return;
  const ov = document.getElementById('modal-overlay'), panel = document.getElementById('tab-evento'), edit = document.getElementById('edit-reg-overlay');
  if (!ov || !panel || !ov.classList.contains('open') || !panel.classList.contains('active')) return;
  if (edit && edit.classList.contains('open')) return;                  // não mexe enquanto está editando uma inscrição
  ADMIN_LIVE_BUSY = true;
  try {
    const info = EVENT_INFO || defaultEventInfo();
    if (!info.id) return;
    const before = adminRegsSig(info);
    await loadEventRegistrations();
    if (adminRegsSig(info) === before) return;                          // nada mudou: não redesenha
    try { await ensureBibs(info); } catch (e) { console.error(e); }
    renderRegistrationsList();
    renderNoShowList();
  } catch (e) { console.error(e); }
  finally { ADMIN_LIVE_BUSY = false; }
}
setInterval(adminLiveRefresh, 8000);

function clkTickAll() {
  const info = EVENT_INFO; if (!info) return;
  const now = Date.now();
  document.querySelectorAll('#live-ctl-rows .live-clock').forEach(el => {
    const k = el.dataset.clk, v = clkView(info, k, now);
    el.textContent = clkFmt(v.ms);
    if (el.dataset.up !== (v.timeUp ? '1' : '0')) { renderLiveControls(info); return; }   // estourou o Time Cap: atualiza botões/etiqueta
    const sub = document.querySelector(`#live-ctl-rows [data-clk-sub="${k}"]`);
    if (sub && v.cap) sub.textContent = 'TIME CAP ' + clkFmt(v.cap) + ' · restam ' + clkFmt(v.remainingMs);
  });
  try { lancarApplyClock(); } catch (e) {}
}
setInterval(clkTickAll, 1000);

// ══════════════════════════════════════════════
//  SENHA DA EQUIPE (única: vale para Meta e para Lançar resultados) + TELA DE LANÇAMENTO
// ══════════════════════════════════════════════
// Guardada em app_settings ('staff_pw' = { h: hash }). Enquanto nunca for definida aqui,
// continua valendo a senha antiga cadastrada na Meta (mesmo hash), então nada para de funcionar.
let STAFF_PW = null;
async function loadStaffPw() {
  const v = await getSetting('staff_pw', null);
  STAFF_PW = (v && typeof v === 'object' && 'h' in v) ? v : null;
}
function staffHash() {
  if (STAFF_PW) return STAFF_PW.h || '';
  return (MT_CFG && MT_CFG.staffPw) || '';
}
function renderStaffPwState() {
  const el = document.getElementById('staff-pw-state'); if (!el) return;
  const has = !!staffHash();
  el.textContent = has ? '🔒 Senha definida. Digite uma nova só se quiser trocar.' : '⚠️ Sem senha: qualquer pessoa com os links pode registrar metas e lançar resultados.';
  el.style.color = has ? 'var(--green)' : 'var(--gold)';
  const inp = document.getElementById('staff-pw-input'); if (inp) inp.value = '';
}
async function saveStaffPw() {
  const pw = (document.getElementById('staff-pw-input').value || '').trim();
  if (!pw) return toast('⚠️ Digite a nova senha da equipe');
  const h = await mtHash(pw);
  if (!(await setSetting('staff_pw', { h }))) return;
  STAFF_PW = { h };
  renderStaffPwState();
  toast('🔒 Senha da equipe salva! Vale para Meta e Lançar resultados');
}
async function removeStaffPw() {
  if (!confirm('Remover a senha? Qualquer pessoa com os links poderá registrar metas e lançar resultados.')) return;
  if (!(await setSetting('staff_pw', { h: '' }))) return;
  STAFF_PW = { h: '' };
  renderStaffPwState();
  toast('🔓 Senha da equipe removida');
}
function appBaseUrl() { return location.href.split('#')[0].split('?')[0]; }
function copyLinkOf(id) {
  const el = document.getElementById(id); if (!el) return;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(el.value).then(() => toast('📋 Link copiado!'), () => toast(el.value));
  else { el.select(); document.execCommand('copy'); toast('📋 Link copiado!'); }
}
function fillTeamLinks() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('cfg-link-meta', appBaseUrl() + '?meta=1');
  set('cfg-link-launch', appBaseUrl() + '?lancar=resultados');
  set('ev-launch-link', appBaseUrl() + '?lancar=resultados');
  set('tv-link-input', appBaseUrl() + '?tv=resultados');
}
fillTeamLinks();

// ── Tela de lançamento da equipe ──
const LANCAR_KEY = 'ev_unlock';
function lancarUnlocked() {
  const sh = staffHash();
  if (!sh) return true;
  try { if (hasValidAdminSession()) return true; } catch (e) {}      // quem acabou de entrar como admin não precisa digitar de novo
  try { const u = JSON.parse(localStorage.getItem(LANCAR_KEY) || 'null'); return !!u && u.h === sh && u.e > Date.now(); } catch (e) { return false; }
}
async function lancarUnlock() {
  const inp = document.getElementById('lancar-pw');
  const h = await mtHash(inp.value.trim());
  if (h !== staffHash()) { inp.value = ''; return toast('❌ Senha incorreta'); }
  localStorage.setItem(LANCAR_KEY, JSON.stringify({ h, e: Date.now() + 12 * 3600e3 }));
  inp.value = '';
  await lancarShow();
}
function lancarLogout() { localStorage.removeItem(LANCAR_KEY); lancarShow(); }
async function lancarShow() {
  const ok = lancarUnlocked();
  document.getElementById('lancar-gate').style.display = ok ? 'none' : '';
  document.getElementById('lancar-main').style.display = ok ? '' : 'none';
  document.getElementById('lancar-logout').style.display = (ok && staffHash()) ? '' : 'none';
  if (ok) await lancarLoad();
  else setTimeout(() => document.getElementById('lancar-pw')?.focus(), 100);
}
let LANCAR_SIG = '', LANCAR_TICKS = 0, LANCAR_SNACK_T = null;
const LANCAR_BUSY = new Set();
function lancarSig(info) { return [info.id, info.live_sub || '', info.is_dual ? 1 : 0, info.result_type, info.result_type_1, info.result_type_2].join('|'); }
function lancarType(info) { const k = info.live_sub; return info.is_dual ? (k === '2' ? info.result_type_2 : info.result_type_1) : info.result_type; }
async function lancarLoad() {
  EVENT_INFO = null;
  const info = await getEventInfo();
  LANCAR_SIG = lancarSig(info);
  await loadEventRegistrations();
  try { await ensureBibs(info); } catch (e) { console.error(e); }
  await loadResultNotes();
  await loadResultStrava();
  const live = info.live_sub || '';
  const valid = live === '1' || (live === '2' && info.is_dual);
  const none = document.getElementById('lancar-none');
  const wrap = document.getElementById('result-panel-wrap');
  const nameEl = document.getElementById('lancar-event-name');
  if (!valid) {
    nameEl.textContent = info.name || 'Nenhum evento no momento';
    wrap.style.display = 'none';
    none.textContent = '🔒 Lançamento ainda não liberado. A administração libera o evento que está acontecendo no Controle ao vivo.';
    none.style.display = '';
    return;
  }
  currentSubEventContext = info.is_dual ? live : '1';
  const subName = info.is_dual ? (live === '2' ? (info.sub2_name || 'Evento 2') : (info.sub1_name || 'Evento 1')) : '';
  nameEl.textContent = '🔴 ' + (info.name || 'Evento') + (subName ? ' · ' + subName : '');
  const type = lancarType(info);
  if (!type) {
    wrap.style.display = 'none';
    none.textContent = 'O evento liberado ainda não tem tipo de resultado configurado (Tempo ou Rounds/Reps). Peça à administração para configurar.';
    none.style.display = '';
    return;
  }
  none.style.display = 'none';
  refreshResultPanelForContext(info);
  populateResultSelect();
  const tempo = type === 'tempo';
  document.getElementById('lv-finish-area').style.display = tempo ? '' : 'none';
  document.getElementById('lv-manual-hint').style.display = tempo ? 'none' : '';
  if (!tempo) document.getElementById('lv-more').open = true;
  document.getElementById('lv-live-card').dataset.sig = '';
  lancarApplyClock();
  lancarRenderList();
}

// Relógio + estado no topo do quadro
function lancarApplyClock() {
  const info = EVENT_INFO, card = document.getElementById('lv-live-card');
  if (!info || !card || !document.getElementById('lv-clock') || !info.live_sub) return;
  const v = clkView(info, info.live_sub, Date.now());
  const up = v.timeUp && v.state === 'running';
  const st = up ? 'timeup' : v.state;
  document.getElementById('lv-clock').textContent = clkFmt(v.ms);
  const stEl = document.getElementById('lv-clock-state');
  stEl.textContent = up ? '⏰ TIME CAP atingido' : CLK_LABEL[v.state];
  stEl.className = 'lv-clock-state lv-' + st;
  document.getElementById('lv-clock-sub').textContent = v.cap ? `TIME CAP ${clkFmt(v.cap)} · restam ${clkFmt(v.remainingMs)}` : '';
  if (card.dataset.sig !== st) { card.dataset.sig = st; lancarRenderList(); }      // muda o rótulo dos botões
}

// Lista de participantes com botão Finalizar (ordem do nº de pulseira)
function lancarRenderList() {
  const info = EVENT_INFO, box = document.getElementById('lv-runner-list');
  if (!info || !box || !info.live_sub) return;
  const key = info.live_sub, sfx = info.is_dual ? '_' + key : '', field = 'result_value' + sfx, sub = info.is_dual ? key : '0';
  let regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id);
  if (info.is_dual) {
    const n1 = info.sub1_name || 'Evento 1', n2 = info.sub2_name || 'Evento 2';
    regs = regs.filter(r => key === '2' ? evRegInSub(r, n2, n1) : evRegInSub(r, n1, n2));
  }
  const q = ((document.getElementById('lv-search') || {}).value || '').trim().toLowerCase();
  const match = r => {
    if (!q) return true;
    if (/^\d+$/.test(q) && bibOf(r, sub) != null && bibOf(r, sub) === parseInt(q, 10)) return true;
    return r.name.toLowerCase().includes(q);
  };
  const byBib = (a, b) => ((bibOf(a, sub) == null ? 1e9 : bibOf(a, sub)) - (bibOf(b, sub) == null ? 1e9 : bibOf(b, sub))) || a.name.localeCompare(b.name);
  const all = regs.filter(match);
  const attField = 'attended' + sfx;
  const pending = all.filter(r => !r[field] && r[attField] !== false).sort(byBib);
  const absent = all.filter(r => !r[field] && r[attField] === false).sort(byBib);
  const done = all.filter(r => r[field]).sort(byBib);
  const v = clkView(info, key, Date.now());
  const capUp = v.timeUp;
  const bibCell = r => `<div class="lv-bib">${bibOf(r, sub) != null ? bibPad(bibOf(r, sub)) : '—'}</div>`;
  const rowP = r => `<div class="lv-row">${bibCell(r)}<div class="lv-who"><div class="lv-name">${levelColor(r.fitness_level).emoji} ${tvEsc(r.name)}</div>${lancarStravaSummary(r, sfx)}<button class="lv-abs" onclick="lancarSetAttendance(${r.id}, false)">🚫 Ausente</button>${lancarStravaBtn(r, sfx)}</div><button class="lv-fin ${capUp ? 'cap' : ''}" onclick="lancarFinish(${r.id})">${capUp ? '🚫 TIME CAP' : '⏱ Finalizar'}</button></div>`;
  const rowD = r => `<div class="lv-row done">${bibCell(r)}<div class="lv-who"><div class="lv-name">${tvEsc(r.name)}</div>${lancarStravaSummary(r, sfx)}${lancarStravaBtn(r, sfx)}</div><div class="lv-val">${tvEsc(r[field])}</div><button class="lv-undo-btn" title="Desfazer" onclick="lancarClearResult(${r.id}, true)">↩</button></div>`;
  box.innerHTML =
    `<div class="lv-count">Faltam finalizar: ${pending.length}</div>` +
    (pending.length ? pending.map(rowP).join('') : '<div class="lv-hint" style="padding:10px 0">Ninguém pendente 🎉</div>') +
    (done.length ? `<div class="lv-count" style="margin-top:14px">✅ Finalizados: ${done.length}</div>` + done.map(rowD).join('') : '') +
    (absent.length ? `<div class="lv-count" style="margin-top:14px">🚫 Ausentes: ${absent.length}</div>` + absent.map(r => `<div class="lv-row absent">${bibCell(r)}<div class="lv-who"><div class="lv-name">${tvEsc(r.name)}</div></div><button class="lv-undo-btn" onclick="lancarSetAttendance(${r.id}, null)">↩ Voltar</button></div>`).join('') : '');
  const capBtn = document.getElementById('lv-capall');
  if (capBtn) capBtn.style.display = (capUp && pending.length && lancarType(info) === 'tempo') ? '' : 'none';
}

function lancarSnack(html) {
  const el = document.getElementById('lv-snack'); if (!el) return;
  el.innerHTML = html; el.style.display = '';
  clearTimeout(LANCAR_SNACK_T); LANCAR_SNACK_T = setTimeout(() => { el.style.display = 'none'; }, 12000);
}

// FINALIZAR: o tempo é o relógio do evento no instante do toque
async function lancarFinish(regId) {
  const tap = Date.now();
  const info = EVENT_INFO; if (!info || !info.live_sub) return;
  const key = info.live_sub;
  if (lancarType(info) !== 'tempo') return toast('Este evento é lançado manualmente. Use “Mais opções”.');
  const v = clkView(info, key, tap);
  if (v.state === 'ready') return toast('⏳ O evento ainda não começou');
  if (v.state === 'paused') return toast('⏸ Cronômetro pausado pela administração');
  if (v.state !== 'running') return toast('⏹ Evento encerrado. Ajustes em “Mais opções”.');
  if (LANCAR_BUSY.has(regId)) return;
  LANCAR_BUSY.add(regId);
  try {
    const value = v.timeUp ? 'TIME CAP' : clkFmt(v.ms);
    currentSubEventContext = info.is_dual ? key : '1';
    const ctx = await commitResultCore(regId, value, { onlyIfEmpty: true });
    if (!ctx) return;
    lancarRenderList();
    if (ctx.conflict) return;
    lancarSnack(`<span>✅ <b>${tvEsc(ctx.reg.name)}</b> — ${tvEsc(value)}</span><button onclick="lancarClearResult(${regId})">↩ Desfazer</button>`);
    toast(`✅ ${ctx.reg.name}: ${value}`);
    if (!document.getElementById('result-select').value) populateResultSelect();
    commitResultExtras(ctx, undefined).catch(e => console.error(e));        // pontos e telas em segundo plano
  } finally { LANCAR_BUSY.delete(regId); }
}

async function lancarClearResult(regId, ask) {
  const info = EVENT_INFO; if (!info || !info.live_sub) return;
  const reg = EVENT_REGISTRATIONS.find(r => r.id === regId); if (!reg) return;
  if (ask && !confirm(`Desfazer o resultado de ${reg.name}?`)) return;
  const sfx = info.is_dual ? '_' + info.live_sub : '', field = 'result_value' + sfx;
  const { error } = await sb.from('event_registrations').update({ [field]: null }).eq('id', regId);
  if (error) { toast('⚠️ Erro ao desfazer'); console.error(error); return; }
  reg[field] = null;
  await saveResultNote(regId, sfx, '');
  document.getElementById('lv-snack').style.display = 'none';
  lancarRenderList();
  if (!document.getElementById('result-select').value) populateResultSelect();
  toast(`↩ Resultado de ${reg.name} desfeito`);
  renderRegistrationsList(); renderResultsBoard(EVENT_INFO || defaultEventInfo()).catch(() => {});
}

// AUSENTE: o aluno não veio. Sai da lista e fica como faltante (mesma marcação do painel do admin)
async function lancarSetAttendance(regId, value) {
  const info = EVENT_INFO; if (!info || !info.live_sub) return;
  const reg = EVENT_REGISTRATIONS.find(r => r.id === regId); if (!reg) return;
  const sfx = info.is_dual ? '_' + info.live_sub : '', att = 'attended' + sfx;
  if (value === false && reg['result_value' + sfx]) return toast('⚠️ ' + reg.name + ' já tem resultado lançado');
  const key = 'att' + regId;
  if (LANCAR_BUSY.has(key)) return;
  LANCAR_BUSY.add(key);
  try {
    const { error } = await sb.from('event_registrations').update({ [att]: value }).eq('id', regId);
    if (error) { toast('⚠️ Erro ao salvar presença'); console.error(error); return; }
    reg[att] = value;
    lancarRenderList();
    if (value === false) {
      lancarSnack(`<span>🚫 <b>${tvEsc(reg.name)}</b> — ausente</span><button onclick="lancarSetAttendance(${regId}, null)">↩ Desfazer</button>`);
    } else {
      document.getElementById('lv-snack').style.display = 'none';
      toast(`↩ ${reg.name} voltou para a lista`);
    }
    try { renderRegistrationsList(); renderNoShowList(); } catch (e) {}
  } finally { LANCAR_BUSY.delete(key); }
}

// Depois do Time Cap: quem não terminou fica com TIME CAP de uma vez
async function lancarMarkRemainingCap() {
  const info = EVENT_INFO; if (!info || !info.live_sub) return;
  const key = info.live_sub, sfx = info.is_dual ? '_' + key : '', field = 'result_value' + sfx;
  let regs = EVENT_REGISTRATIONS.filter(r => r.event_id === info.id && !r[field] && r['attended' + sfx] !== false);
  if (info.is_dual) { const n1 = info.sub1_name || 'Evento 1', n2 = info.sub2_name || 'Evento 2'; regs = regs.filter(r => key === '2' ? evRegInSub(r, n2, n1) : evRegInSub(r, n1, n2)); }
  if (!regs.length) return;
  if (!confirm(`Marcar TIME CAP em ${regs.length} participante(s) que não terminaram?`)) return;
  currentSubEventContext = info.is_dual ? key : '1';
  let n = 0;
  for (const r of regs) {
    const ctx = await commitResultCore(r.id, 'TIME CAP', { onlyIfEmpty: true });
    if (ctx && !ctx.conflict) { n++; await commitResultExtras(ctx, undefined).catch(e => console.error(e)); }
  }
  lancarRenderList();
  toast(`🚫 TIME CAP marcado em ${n} participante(s)`);
}


// ══════════════════════════════════════════════
//  STRAVA POR PARTICIPANTE (tela Lançar resultados)
// ══════════════════════════════════════════════
// Link do Strava + km + tempo total ficam em app_settings ('result_strava'), então NÃO precisa criar coluna nova no banco.
// Chave: id da inscrição + sufixo do sub-evento ('' | '_1' | '_2'), igual às descrições.
let RESULT_STRAVA = {}, LV_SV_KEY = null;
async function loadResultStrava() {
  const v = await getSetting('result_strava', {});
  RESULT_STRAVA = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
}
const lvSvOk = l => /^https?:\/\/([a-z0-9-]+\.)?strava\.(com|app\.link)\//i.test(l);
function lvSvParseKm(t) {
  t = String(t || '').trim().toLowerCase().replace(/km$/, '').trim().replace(',', '.');
  if (!t) return '';
  const n = parseFloat(t);
  return (isFinite(n) && n >= 0 && /^\d+(\.\d+)?$/.test(t)) ? n : null;
}
function lvSvParseTime(t) {   // aceita 32:10 · 1:05:30 · 45 (minutos). Devolve texto padronizado, '' (vazio) ou null (inválido)
  t = String(t || '').trim();
  if (!t) return '';
  if (/^\d{1,3}$/.test(t)) t += ':00';
  const p = t.split(':');
  if (p.length < 2 || p.length > 3 || p.some(x => !/^\d{1,3}$/.test(x))) return null;
  let h = 0, m, sec;
  if (p.length === 3) { h = +p[0]; m = +p[1]; sec = +p[2]; } else { m = +p[0]; sec = +p[1]; }
  if (sec > 59 || (p.length === 3 && m > 59)) return null;
  const two = n => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(sec)}` : `${two(m)}:${two(sec)}`;
}
function lvSvSeconds(t) { if (!t) return 0; const p = t.split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; }
function lvSvPace(km, time) {
  const sec = lvSvSeconds(time); if (!(km > 0) || !(sec > 0)) return '';
  const ps = Math.round(sec / km), m = Math.floor(ps / 60), s = ps % 60;
  return `${m}:${String(s).padStart(2, '0')}/km`;
}
function lvSvKmTxt(km) { return String(+(+km).toFixed(2)).replace('.', ','); }
function lancarStravaSummary(r, sfx) {
  const d = RESULT_STRAVA[r.id + (sfx || '')]; if (!d) return '';
  const parts = [];
  if (d.km !== '' && d.km != null) parts.push(lvSvKmTxt(d.km) + ' km');
  if (d.time) parts.push(tvEsc(d.time));
  const pace = lvSvPace(d.km, d.time); if (pace) parts.push(pace);
  const link = d.link ? `<a href="${tvEsc(d.link)}" target="_blank" rel="noopener">🔗 Strava</a>` : '';
  return `<div class="lv-sv">📎 ${parts.join(' · ')}${link}</div>`;
}
function lancarStravaBtn(r, sfx) {
  const has = !!RESULT_STRAVA[r.id + (sfx || '')];
  return `<button class="lv-sv-btn ${has ? 'has' : ''}" onclick="lancarStravaOpen(${r.id})">${has ? '✏️ Editar Strava' : '📎 Strava'}</button>`;
}
function lancarStravaSfx() { const info = EVENT_INFO; return (info && info.is_dual && info.live_sub) ? '_' + info.live_sub : ''; }
function lancarStravaPaceHint() {
  const km = lvSvParseKm(document.getElementById('lv-sv-km').value), tm = lvSvParseTime(document.getElementById('lv-sv-time').value);
  const pace = (km && tm) ? lvSvPace(km, tm) : '';
  document.getElementById('lv-sv-pace').textContent = pace ? '⚡ Ritmo médio: ' + pace : '';
}
function lancarStravaOpen(regId) {
  const reg = EVENT_REGISTRATIONS.find(r => r.id === regId); if (!reg) return;
  const key = regId + lancarStravaSfx(), d = RESULT_STRAVA[key] || {};
  LV_SV_KEY = key;
  document.getElementById('lv-sv-who').textContent = reg.name;
  document.getElementById('lv-sv-link').value = d.link || '';
  document.getElementById('lv-sv-km').value = (d.km !== '' && d.km != null) ? lvSvKmTxt(d.km) : '';
  document.getElementById('lv-sv-time').value = d.time || '';
  document.getElementById('lv-sv-del').style.display = RESULT_STRAVA[key] ? '' : 'none';
  lancarStravaPaceHint();
  ['lv-sv-km', 'lv-sv-time'].forEach(id => { document.getElementById(id).oninput = lancarStravaPaceHint; });
  document.getElementById('lv-sv-ov').classList.add('open');
}
function lancarStravaClose() { document.getElementById('lv-sv-ov').classList.remove('open'); LV_SV_KEY = null; }
async function lancarStravaSave() {
  if (!LV_SV_KEY) return;
  const link = document.getElementById('lv-sv-link').value.trim();
  const km = lvSvParseKm(document.getElementById('lv-sv-km').value);
  const time = lvSvParseTime(document.getElementById('lv-sv-time').value);
  if (link && !lvSvOk(link)) return toast('⚠️ Cole um link válido do Strava');
  if (km === null) return toast('⚠️ Distância inválida (ex: 5,2)');
  if (time === null) return toast('⚠️ Tempo inválido (ex: 32:10 ou 1:05:30)');
  if (!link && km === '' && !time) return toast('⚠️ Preencha o link, a distância ou o tempo');
  await loadResultStrava();
  RESULT_STRAVA[LV_SV_KEY] = { link, km, time, at: new Date().toISOString() };
  if (!(await setSetting('result_strava', RESULT_STRAVA))) return;
  lancarStravaClose();
  lancarRenderList();
  toast('📎 Strava salvo!');
}
async function lancarStravaRemove() {
  if (!LV_SV_KEY || !confirm('Remover o Strava deste participante?')) return;
  await loadResultStrava();
  delete RESULT_STRAVA[LV_SV_KEY];
  if (!(await setSetting('result_strava', RESULT_STRAVA))) return;
  lancarStravaClose();
  lancarRenderList();
  toast('🗑 Strava removido');
}

// Vigilância: troca de evento/liberação recarrega; relógio e lista só se atualizam
async function lancarWatch() {
  if (!lancarUnlocked()) return;
  try {
    EVENT_INFO = null;
    const info = await getEventInfo();
    if (lancarSig(info) !== LANCAR_SIG) { await lancarLoad(); return; }
    lancarApplyClock();
    if (++LANCAR_TICKS % 2 === 0) {
      await loadEventRegistrations();
      if (!document.getElementById('lv-sv-ov').classList.contains('open')) await loadResultStrava();
      if (!document.getElementById('result-select').value) populateResultSelect();
      lancarRenderList();
    }
  } catch (e) {}
}
async function startLancar() {
  document.getElementById('lancar-view').classList.add('on');
  try { await mtLoadCfg(); } catch (e) {}
  await loadStaffPw();
  try { await loadMembers(); } catch (e) {}          // necessário para somar os pontos do evento ao ranking
  await lancarShow();
  setInterval(lancarWatch, 4000);
}

// ══════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════
async function start() {
  const params0 = new URLSearchParams(location.search);
  const archiveId = params0.get('resultado');
  if (archiveId) {
    // Link permanente de resultados arquivados — mostra só essa tela, sem carregar o resto do app
    document.querySelectorAll('body > *').forEach(el => {
      if (el.id !== 'archived-results-view') el.style.display = 'none';
    });
    await renderArchivedResults(archiveId);
    return;
  }

  if (params0.get('quicklaunch') === '1') { location.replace(appBaseUrl() + '?lancar=resultados'); return; }   // atalho antigo: agora abre a tela de lançamento

  if (params0.get('lancar') === 'resultados' && params0.get('meta') === null) {
    // Link da equipe: só o lançamento de resultados (pede a senha da equipe)
    document.querySelectorAll('body > *').forEach(el => { if (el.id !== 'lancar-view' && el.id !== 'toast' && el.tagName !== 'SCRIPT') el.style.display = 'none'; });
    await startLancar();
    return;
  }

  if (params0.get('tv') === 'resultados' && params0.get('meta') === null) {
    // Link de TV: só os resultados do evento atual, em tela cheia, sem o resto do app
    document.querySelectorAll('body > *').forEach(el => { if (el.id !== 'tv-results-view' && el.tagName !== 'SCRIPT') el.style.display = 'none'; });
    await startTvResults(params0);
    return;
  }

  if (params0.get('meta') !== null) {
    // Link direto da meta coletiva: mostra só essa tela
    document.querySelectorAll('body > *').forEach(el => { if (el.id !== 'meta-view' && el.tagName !== 'SCRIPT') el.style.display = 'none'; });
    if (params0.get('tv') !== null) {   // modo TV: sem botões, tela sempre ligada
      document.body.classList.add('meta-tv');
      try { if (navigator.wakeLock) { const wl = () => navigator.wakeLock.request('screen').catch(() => {}); wl(); document.addEventListener('visibilitychange', () => { if (!document.hidden) wl(); }); } } catch (e) {}
    }
    const rg = params0.get('reg'); if (rg !== null) { MT_REG = /^[ab]$/i.test(rg) ? rg.toUpperCase() : '1'; MT_OPEN_REG = true; }   // ?reg=A / ?reg=B / ?reg=1: abre direto o registro
    MT_OPEN_LAP = params0.get('volta') !== null;
    await mtStartPublic();
    return;
  }

  await loadMembers();
  try { await loadBadges(); } catch (e) { console.error('badges', e); }
  renderRanking();
  const params = new URLSearchParams(location.search);
  const urlTab = params.get('tab');
  if (urlTab && ['ranking','desafios','evento','assinante'].includes(urlTab)) {
    await setMainTab(urlTab);
  }
  // Link direto para inscrição: ?tab=evento&inscrever=1
  // Mostra o card completo do evento (nome, data, descrição, regras) em vez de pular direto pro formulário
  if (urlTab === 'evento' && params.get('inscrever') === '1') {
    setTimeout(() => {
      const heroCard = document.getElementById('event-hero');
      if (heroCard) {
        heroCard.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    }, 500);
  }

  // Link de atalho para lançar resultados rápido: ?quicklaunch=1
  // Se a sessão admin ainda estiver válida (até 20 min), pula a senha e vai direto pro painel
  // de lançamento de resultados. Se não, abre a tela de senha — depois de logar, o admin
  // ainda precisa clicar em Evento uma vez, mas a sessão fica salva pros próximos 20 min.
  if (params.get('quicklaunch') === '1') {
    document.getElementById('modal-overlay').classList.add('open');
    if (hasValidAdminSession()) {
      unlocked = true;
      document.getElementById('pass-gate').style.display='none';
      document.getElementById('admin-panel').style.display='block';
      document.getElementById('modal-title').textContent='PAINEL ADMIN';
      await loadHistory();
      renderAdminSelect(); renderMembersList(); renderRecentHistory(); renderQuickTap();
      await admTab('evento');
      setTimeout(() => {
        document.getElementById('result-select')?.focus();
      }, 300);
    } else {
      document.getElementById('pass-gate').style.display='block';
      document.getElementById('admin-panel').style.display='none';
      document.getElementById('modal-title').textContent='ACESSO';
      setTimeout(()=>document.getElementById('pass-input').focus(),300);
      // Marca que depois do login deve ir direto pra aba evento
      window.__quicklaunchPending = true;
    }
  }
}
start();

setInterval(async () => {
  await loadMembers();
  renderRanking();
}, 15000);
</script>
<!-- EDITAR INSCRIÇÃO -->
<div class="modal-overlay" id="edit-reg-overlay" onclick="if(event.target===this)closeEditRegistration()">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">✏️ EDITAR INSCRIÇÃO</div>
      <button class="close-btn" onclick="closeEditRegistration()">✕</button>
    </div>
    <div class="modal-body">
      <div class="er-who" id="er-who"></div>
      <div class="er-when" id="er-when"></div>

      <div class="er-hero">
        <div class="er-hero-title">⭐ Categoria e pulseira</div>
        <div class="field-group">
          <label class="field-label">Categoria / Nível</label>
          <select id="er-level">
              <option value="Iniciante">🟢 Iniciante</option>
              <option value="Intermediário">🟡 Intermediário</option>
              <option value="Avançado">🟠 Avançado</option>
          </select>
        </div>
        <div class="field-group" id="er-bib-row-0" style="display:none">
          <label class="field-label">🎽 Nº de pulseira / inscrição</label>
          <input type="number" id="er-bib-0" class="er-bib-input" min="0" inputmode="numeric" placeholder="auto">
        </div>
        <div class="field-group" id="er-bib-row-1" style="display:none">
          <label class="field-label">🎽 Nº de pulseira — <span id="er-bib-label-1">Evento 1</span></label>
          <input type="number" id="er-bib-1" class="er-bib-input" min="0" inputmode="numeric" placeholder="auto">
        </div>
        <div class="field-group" id="er-bib-row-2" style="display:none">
          <label class="field-label">🎽 Nº de pulseira — <span id="er-bib-label-2">Evento 2</span></label>
          <input type="number" id="er-bib-2" class="er-bib-input" min="0" inputmode="numeric" placeholder="auto">
        </div>
        <div class="er-hint">Cada evento tem a sua numeração em ordem de inscrição (a mesma pessoa pode ser 05 em um e 10 em outro). Pode trocar à mão; deixe vazio para gerar o próximo número automático.</div>
      </div>
      <button class="btn btn-blue" onclick="saveEditRegistration()">💾 Salvar Alterações</button>

      <div class="er-section-title">✏️ Editar outras informações</div>
      <div class="er-hint" style="margin:0 0 14px">Nome, idade, telefone, tipo de inscrição e eventos. Depois de mexer, salve de novo no botão lá embaixo.</div>
      <div class="field-group">
        <label class="field-label">Nome</label>
        <input type="text" id="er-name">
      </div>
      <div class="field-group">
        <label class="field-label">Idade</label>
        <input type="number" id="er-age" placeholder="ex: 28">
      </div>
      <div class="field-group">
        <label class="field-label">Telefone</label>
        <input type="text" id="er-phone" placeholder="ex: 21999998888">
      </div>
      <div class="field-group">
        <label class="field-label">Tipo de inscrição</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="er-is-clube" style="width:18px;height:18px;flex-shrink:0">
            <span>🏆 Membro do Clube</span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="er-is-ct" style="width:18px;height:18px;flex-shrink:0">
            <span>🏋️ Aluno do CT</span>
          </label>
        </div>
      </div>
      <div class="field-group" id="er-member-select-wrap" style="display:none">
        <label class="field-label">Nome no ranking (se Membro do Clube)</label>
        <select id="er-member-select"></select>
      </div>
      <div class="field-group" id="er-dual-wrap" style="display:none">
        <label class="field-label">🎯 Inscrito em</label>
        <div style="display:flex;flex-direction:column;gap:8px">
          <label style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="er-sub1-check" style="width:18px;height:18px;flex-shrink:0">
            <span id="er-sub1-label">Evento 1</span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;cursor:pointer">
            <input type="checkbox" id="er-sub2-check" style="width:18px;height:18px;flex-shrink:0">
            <span id="er-sub2-label">Evento 2</span>
          </label>
        </div>
      </div>
      <button class="btn btn-blue" onclick="saveEditRegistration()">💾 Salvar Alterações</button>
      <button class="btn-sm-danger" style="width:100%;padding:10px;margin-top:8px" onclick="closeEditRegistration()">Cancelar</button>
    </div>
  </div>
</div>

<!-- EDITOR DE RESULTADOS DE EVENTO ARQUIVADO -->
<div class="modal-overlay" id="archive-editor-overlay" onclick="if(event.target===this)closeArchiveEditor()">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="archive-editor-title" style="font-size:16px">Editar Resultados</div>
      <button class="close-btn" onclick="closeArchiveEditor()">✕</button>
    </div>
    <div class="modal-body">
      <div style="font-size:12px;color:var(--muted);margin-bottom:14px">Edite o resultado de qualquer participante — salva automaticamente ao sair do campo.</div>
      <div id="archive-editor-body"></div>
      <button class="btn-sm-danger" style="width:100%;padding:10px;margin-top:10px" onclick="closeArchiveEditor()">Fechar</button>
    </div>
  </div>
</div>

<!-- CONFIRMAÇÃO GRANDE DE INSCRIÇÃO — aparece no centro da tela -->
<div id="registration-confirm-overlay" class="registration-confirm-overlay" onclick="if(event.target===this)closeRegistrationConfirm()">
  <div class="registration-confirm-card">
    <div class="registration-confirm-emoji">😉💪🏻</div>
    <div class="registration-confirm-title">Inscrição confirmada!</div>
    <div class="registration-confirm-detail" id="registration-confirm-detail"></div>
    <button class="registration-confirm-btn" onclick="closeRegistrationConfirm()">Show! 🎉</button>
  </div>
</div>

<div class="bd-ov" id="bd-ov" onclick="if(event.target===this)this.classList.remove('open')"><div class="bd-box" id="bd-box"></div></div>
</body>
</html>
