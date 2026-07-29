import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dumbbell, ListChecks, ClipboardList, Plus, X, Search,
  ChevronDown, ChevronRight, Trash2, Pencil, Timer,
  Users, Lock, Save, Layers, Flag, Target, Zap, Share2, Check, ArrowLeft, LogOut,
  PlayCircle, Link as LinkIcon, Megaphone, KeyRound, Star, TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "./supabaseClient.js";

/* ---------------------------------------------------------
   CANTIL FITNESS
   Biblioteca de exercícios + programação de treinos + log pessoal
   Dados no Supabase (Postgres). Pensado para muitos workouts:
   a lista é paginada e a busca roda direto no banco.
--------------------------------------------------------- */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
`;

const NIVEIS = [
  { nome: "Verde", cor: "#4CAF6D" },
  { nome: "Amarelo", cor: "#D4B93C" },
  { nome: "Laranja", cor: "#FF8A3D" },
  { nome: "Vermelho", cor: "#E6483F" },
  { nome: "Azul", cor: "#4B9EEA" },
  { nome: "Roxo", cor: "#9B6BD9" },
  { nome: "Preto", cor: "#2B2B2E" },
];
const corDoNivel = (nome) => (NIVEIS.find((n) => n.nome === nome) || NIVEIS[0]).cor;

const FORMATOS = ["FOR TIME", "AMRAP", "EMOM", "BLOCO", "TABATA", "RX / SCALED"];
const GRUPOS_SUGERIDOS = [
  "Ginástica", "Levantamento Olímpico", "Levantamento de Força",
  "Monoestrutural / Cardio", "Core", "Mobilidade",
];

// Senha padrão inicial (só usada até alguém trocar pelo app). Fica salva na tabela config do Supabase.
const SENHA_PADRAO = "cantil123";
const PAGE_SIZE = 20;

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function buildShareUrl(workoutId) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/w/${workoutId}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

function formatarDataHora(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Tenta ler o campo "resultado" (texto livre) como tempo (mm:ss) ou como pontuação (número).
function parseResultado(resultado) {
  if (!resultado) return null;
  const str = resultado.trim();
  const m = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    const partes = [m[1], m[2], m[3]].filter(Boolean).map(Number);
    let segundos;
    if (partes.length === 3) segundos = partes[0] * 3600 + partes[1] * 60 + partes[2];
    else segundos = partes[0] * 60 + partes[1];
    return { valor: segundos, ehTempo: true };
  }
  const n = str.match(/\d+(\.\d+)?/);
  if (n) return { valor: parseFloat(n[0]), ehTempo: false };
  return null;
}

function formatarSegundos(s) {
  const total = Math.round(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// Agrupa os registros do atleta por treino (mesmo nome + mesmo bloco) pra montar o progresso.
function agruparProgresso(logs) {
  const grupos = {};
  logs.forEach((l) => {
    const parsed = parseResultado(l.resultado);
    if (!parsed) return;
    const chave = `${(l.workoutNome || "").trim().toLowerCase()}|${(l.blocoNome || "").trim().toLowerCase()}`;
    if (!grupos[chave]) {
      grupos[chave] = { nome: l.workoutNome || "Treino livre", blocoNome: l.blocoNome || "", ehTempo: parsed.ehTempo, itens: [] };
    }
    grupos[chave].itens.push({ data: l.data, valor: parsed.valor, resultado: l.resultado });
  });
  return Object.values(grupos)
    .filter((g) => g.itens.length >= 2)
    .map((g) => {
      const ordenado = [...g.itens].sort((a, b) => (a.data < b.data ? -1 : 1));
      const valores = ordenado.map((i) => i.valor);
      const melhor = g.ehTempo ? Math.min(...valores) : Math.max(...valores);
      const pior = g.ehTempo ? Math.max(...valores) : Math.min(...valores);
      return { ...g, itens: ordenado, melhor, pior };
    });
}

/* ---------------------------- mapeamento banco <-> app ---------------------------- */

const exercicioFromDb = (r) => ({
  id: r.id, nome: r.nome || "", grupoGrande: r.grupo_grande || "",
  grupoMenor: r.grupo_menor || "", equipamento: r.equipamento || "", descricao: r.descricao || "",
  link: r.link || "",
});
const exercicioToDb = (e) => ({
  nome: e.nome, grupo_grande: e.grupoGrande, grupo_menor: e.grupoMenor,
  equipamento: e.equipamento, descricao: e.descricao, link: e.link || "",
});

const workoutFromDb = (r) => ({
  id: r.id, codigo: r.codigo || "", nome: r.nome || "", data: r.data, categoria: r.categoria || "",
  tags: r.tags || "", warmupGeral: r.warmup_geral || "", warmupEspecifico: r.warmup_especifico || "",
  skill: r.skill || "", blocos: r.blocos && r.blocos.length ? r.blocos : [blocoVazio()],
  criadoEm: r.criado_em, atualizadoEm: r.atualizado_em,
});
const workoutToDb = (w) => ({
  codigo: w.codigo, nome: w.nome, data: w.data, categoria: w.categoria, tags: w.tags || "",
  warmup_geral: w.warmupGeral, warmup_especifico: w.warmupEspecifico, skill: w.skill, blocos: w.blocos,
});

const logFromDb = (r) => ({
  id: r.id, atleta: r.atleta, data: r.data, workoutId: r.workout_id, workoutNome: r.workout_nome || "",
  blocoNome: r.bloco_nome || "", nivel: r.nivel || "Verde", resultado: r.resultado || "",
  ajuste: r.ajuste || "", notas: r.notas || "",
});
const logToDb = (l) => ({
  atleta: l.atleta, data: l.data, workout_id: l.workoutId || null, workout_nome: l.workoutNome,
  bloco_nome: l.blocoNome, nivel: l.nivel, resultado: l.resultado, ajuste: l.ajuste, notas: l.notas,
});

/* ---------------------------- acesso a dados (Supabase) ---------------------------- */

async function fetchExercicios() {
  const { data, error } = await supabase.from("exercicios").select("*").order("grupo_grande");
  if (error) { console.error(error); return []; }
  return data.map(exercicioFromDb);
}
async function salvarExercicioDb(exercicio, editandoId) {
  if (editandoId) {
    const { error } = await supabase.from("exercicios").update(exercicioToDb(exercicio)).eq("id", editandoId);
    if (error) console.error(error);
  } else {
    const { error } = await supabase.from("exercicios").insert(exercicioToDb(exercicio));
    if (error) console.error(error);
  }
}
async function excluirExercicioDb(id) {
  const { error } = await supabase.from("exercicios").delete().eq("id", id);
  if (error) console.error(error);
}

async function fetchLegendas() {
  const { data, error } = await supabase.from("legendas").select("*");
  if (error) { console.error(error); return {}; }
  const obj = {};
  data.forEach((r) => { obj[r.nivel] = r.texto || ""; });
  return obj;
}
async function salvarLegendaDb(nivel, texto) {
  const { error } = await supabase.from("legendas").upsert({ nivel, texto });
  if (error) console.error(error);
}

async function gerarCodigoTreino(dataISO) {
  const [ano, mes, dia] = (dataISO || "").split("-");
  if (!ano || !mes || !dia) return "";
  const base = `${dia}${mes}${ano.slice(2)}`;
  const { data, error } = await supabase.from("workouts").select("codigo").ilike("codigo", `${base}%`);
  if (error) { console.error(error); return base; }
  const codigos = new Set((data || []).map((r) => r.codigo));
  if (!codigos.has(base)) return base;
  let n = 2;
  while (codigos.has(`${base}${n}`)) n++;
  return `${base}${n}`;
}

async function fetchWorkoutsPage(offset) {
  const { data, error, count } = await supabase
    .from("workouts")
    .select("*", { count: "exact" })
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (error) { console.error(error); return { rows: [], total: 0 }; }
  return { rows: data.map(workoutFromDb), total: count || 0 };
}
async function fetchWorkoutsRecentes(limite = 6) {
  const { data, error, count } = await supabase
    .from("workouts")
    .select("*", { count: "exact" })
    .order("atualizado_em", { ascending: false })
    .limit(limite);
  if (error) { console.error(error); return { rows: [], total: 0 }; }
  return { rows: data.map(workoutFromDb), total: count || 0 };
}
async function searchWorkoutsDb(termo) {
  const like = `%${termo}%`;
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .or(`nome.ilike.${like},codigo.ilike.${like},tags.ilike.${like},categoria.ilike.${like}`)
    .order("data", { ascending: false })
    .limit(100);
  if (error) { console.error(error); return []; }
  return data.map(workoutFromDb);
}
async function fetchWorkoutById(id) {
  const { data, error } = await supabase.from("workouts").select("*").eq("id", id).maybeSingle();
  if (error || !data) { if (error) console.error(error); return null; }
  return workoutFromDb(data);
}
async function inserirWorkoutDb(w) {
  const agora = new Date().toISOString();
  const codigo = await gerarCodigoTreino(w.data);
  const payload = { ...workoutToDb(w), codigo, criado_em: agora, atualizado_em: agora };
  const { data, error } = await supabase.from("workouts").insert(payload).select().single();
  if (error) { console.error(error); return null; }
  return workoutFromDb(data);
}
async function atualizarWorkoutDb(id, w) {
  const agora = new Date().toISOString();
  const payload = { ...workoutToDb(w), atualizado_em: agora };
  const { data, error } = await supabase.from("workouts").update(payload).eq("id", id).select().single();
  if (error) { console.error(error); return null; }
  return workoutFromDb(data);
}
async function excluirWorkoutDb(id) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) console.error(error);
}

async function fetchLogs(atleta) {
  const { data, error } = await supabase
    .from("logs").select("*").eq("atleta", atleta)
    .order("data", { ascending: false }).order("criado_em", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(logFromDb);
}
async function inserirLogDb(l) {
  const { data, error } = await supabase.from("logs").insert(logToDb(l)).select().single();
  if (error) { console.error(error); return null; }
  return logFromDb(data);
}
async function excluirLogDb(id) {
  const { error } = await supabase.from("logs").delete().eq("id", id);
  if (error) console.error(error);
}

async function fetchConfig() {
  const { data, error } = await supabase.from("config").select("*").eq("id", 1).maybeSingle();
  if (error || !data) { if (error) console.error(error); return SENHA_PADRAO; }
  return data.senha || SENHA_PADRAO;
}
async function salvarConfigDb(senha) {
  const { error } = await supabase.from("config").upsert({ id: 1, senha });
  if (error) console.error(error);
}

async function fetchBanner() {
  const { data, error } = await supabase.from("banner").select("*").eq("id", 1).maybeSingle();
  if (error || !data || !data.tipo) { if (error) console.error(error); return null; }
  return {
    tipo: data.tipo, workoutId: data.workout_id || "", observacao: data.observacao || "",
    titulo: data.titulo || "", descricao: data.descricao || "", atualizadoEm: data.atualizado_em,
  };
}
async function salvarBannerDb(banner) {
  const payload = {
    id: 1, tipo: banner.tipo, workout_id: banner.workoutId || null,
    observacao: banner.observacao || "", titulo: banner.titulo || "", descricao: banner.descricao || "",
    atualizado_em: new Date().toISOString(),
  };
  const { error } = await supabase.from("banner").upsert(payload);
  if (error) console.error(error);
}
async function removerBannerDb() {
  const { error } = await supabase.from("banner").upsert({
    id: 1, tipo: null, workout_id: null, titulo: null, descricao: null, observacao: null,
    atualizado_em: new Date().toISOString(),
  });
  if (error) console.error(error);
}

async function fetchWorkoutOptions() {
  const { data, error } = await supabase
    .from("workouts").select("id, nome, data, codigo")
    .order("data", { ascending: false }).limit(150);
  if (error) { console.error(error); return []; }
  return data;
}

/* ---------------------------- UI primitives ---------------------------- */

function Stamp({ nome, cor, size = "md" }) {
  const s = size === "sm" ? { pad: "2px 10px", font: 11 } : { pad: "4px 14px", font: 13 };
  return (
    <span style={{
      display: "inline-block", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase", color: cor, border: `2px solid ${cor}`,
      borderRadius: 999, padding: s.pad, fontSize: s.font, transform: "rotate(-1.5deg)", background: `${cor}14`,
    }}>
      {nome}
    </span>
  );
}
function Badge({ children }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      color: "#B9BABF", border: "1px solid #3A3B40", borderRadius: 6, padding: "3px 8px",
    }}>
      {children}
    </span>
  );
}
function Section({ title, icon, children, right }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 15, letterSpacing: "0.05em", color: "#F1EFE9", textTransform: "uppercase" }}>
            {title}
          </span>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#9A9A94", marginBottom: 5, letterSpacing: "0.02em" }}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = {
  width: "100%", background: "#1C1D20", border: "1px solid #3A3B40", borderRadius: 8, padding: "10px 12px",
  color: "#F1EFE9", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box",
};
function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function TextArea(props) { return <textarea {...props} style={{ ...inputStyle, resize: "vertical", minHeight: 70, ...(props.style || {}) }} />; }
function AutoTextArea(props) {
  const ref = useRef(null);
  const ajustarAltura = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => { ajustarAltura(); }, [props.value]);
  return (
    <textarea
      {...props}
      ref={ref}
      onInput={ajustarAltura}
      style={{ ...inputStyle, resize: "vertical", minHeight: 160, overflow: "hidden", lineHeight: 1.5, ...(props.style || {}) }}
    />
  );
}
function Select(props) { return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>{props.children}</select>; }

function PrimaryButton({ children, onClick, style, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#4a4910" : "#E4DE00", color: "#0A0A0A", fontWeight: 800, border: "none",
      borderRadius: 8, padding: "11px 16px", fontSize: 14, letterSpacing: "0.02em",
      cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 6, ...style,
    }}>
      {children}
    </button>
  );
}
function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: "#B9BABF", border: "1px solid #3A3B40", borderRadius: 8,
      padding: "10px 14px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 6, ...style,
    }}>
      {children}
    </button>
  );
}
function Sheet({ title, onClose, children }) {
  const [alturaVisivel, setAlturaVisivel] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const atualizar = () => setAlturaVisivel(vv.height);
    atualizar();
    vv.addEventListener("resize", atualizar);
    vv.addEventListener("scroll", atualizar);
    return () => {
      vv.removeEventListener("resize", atualizar);
      vv.removeEventListener("scroll", atualizar);
    };
  }, []);

  const rolarCampoParaVisivel = (e) => {
    const alvo = e.target;
    setTimeout(() => {
      if (alvo && alvo.scrollIntoView) {
        alvo.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 300);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        onFocus={rolarCampoParaVisivel}
        style={{
          background: "#212226", width: "100%", maxWidth: 640, margin: "0 auto",
          maxHeight: Math.round(alturaVisivel * 0.92), overflowY: "auto",
          borderRadius: "16px 16px 0 0", padding: "18px 16px 28px", borderTop: "3px solid #E4DE00",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: "#F1EFE9", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9A9A94", cursor: "pointer" }}><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function EmptyState({ text }) {
  return <div style={{ border: "1px dashed #3A3B40", borderRadius: 10, padding: "24px 16px", textAlign: "center", color: "#71727A", fontSize: 13 }}>{text}</div>;
}
function Toast({ text }) {
  if (!text) return null;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#F1EFE9",
      color: "#0A0A0A", padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 6, zIndex: 100, boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
    }}>
      <Check size={14} /> {text}
    </div>
  );
}
function Spinner({ label = "Carregando..." }) {
  return <div style={{ color: "#71727A", textAlign: "center", padding: 30, fontSize: 13 }}>{label}</div>;
}

/* ---------------------------- proteção por senha (reutilizável) ---------------------------- */

function useSenhaGate(senhaCorreta) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState(false);
  const acaoRef = useRef(null);

  const pedir = (acao) => {
    acaoRef.current = acao;
    setValor("");
    setErro(false);
    setAberto(true);
  };

  const confirmar = () => {
    if (valor === senhaCorreta) {
      setAberto(false);
      const acao = acaoRef.current;
      acaoRef.current = null;
      setValor("");
      if (acao) acao();
    } else {
      setErro(true);
    }
  };

  const Modal = !aberto ? null : (
    <Sheet title="Senha necessária" onClose={() => setAberto(false)}>
      <div style={{ fontSize: 13, color: "#B9BABF", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Lock size={16} color="#E4DE00" style={{ flexShrink: 0, marginTop: 1 }} />
        Só quem tem a senha pode fazer essa alteração.
      </div>
      <Field label="Senha">
        <TextInput
          type="password"
          value={valor}
          onChange={(e) => { setValor(e.target.value); setErro(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") confirmar(); }}
          placeholder="Digite a senha"
          autoFocus
        />
      </Field>
      {erro && <div style={{ color: "#E6483F", fontSize: 12.5, marginBottom: 12 }}>Senha incorreta. Tente de novo.</div>}
      <PrimaryButton onClick={confirmar} style={{ width: "100%" }}>
        <Lock size={15} /> Confirmar
      </PrimaryButton>
    </Sheet>
  );

  return { pedir, Modal };
}

function TrocarSenha({ senha, setSenha }) {
  const { pedir, Modal } = useSenhaGate(senha);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const abrir = () => pedir(() => {
    setNovaSenha("");
    setConfirmaSenha("");
    setErro("");
    setSheetAberto(true);
  });

  const salvar = async () => {
    if (!novaSenha.trim()) { setErro("Digite a nova senha."); return; }
    if (novaSenha !== confirmaSenha) { setErro("As senhas não coincidem."); return; }
    setSalvando(true);
    await salvarConfigDb(novaSenha);
    setSenha(novaSenha);
    setSalvando(false);
    setSheetAberto(false);
  };

  return (
    <>
      <button
        onClick={abrir}
        title="Alterar senha"
        style={{ background: "none", border: "none", color: "#71727A", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }}
      >
        <KeyRound size={18} />
      </button>
      {Modal}
      {sheetAberto && (
        <Sheet title="Alterar senha" onClose={() => setSheetAberto(false)}>
          <Field label="Nova senha">
            <TextInput type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha" autoFocus />
          </Field>
          <Field label="Confirmar nova senha">
            <TextInput type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} placeholder="Repita a nova senha" />
          </Field>
          {erro && <div style={{ color: "#E6483F", fontSize: 12.5, marginBottom: 12 }}>{erro}</div>}
          <PrimaryButton onClick={salvar} disabled={salvando} style={{ width: "100%" }}>
            <Save size={16} /> {salvando ? "Salvando..." : "Salvar nova senha"}
          </PrimaryButton>
        </Sheet>
      )}
    </>
  );
}

/* =================================================================
   BIBLIOTECA DE EXERCÍCIOS
================================================================= */

function BibliotecaTab({ exercicios, recarregar, senha }) {
  const [busca, setBusca] = useState("");
  const [sheetAberto, setSheetAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", grupoGrande: "", grupoMenor: "", equipamento: "", descricao: "", link: "" });
  const { pedir, Modal } = useSenhaGate(senha);

  const abrirNovo = () => pedir(() => {
    setEditando(null);
    setForm({ nome: "", grupoGrande: "", grupoMenor: "", equipamento: "", descricao: "", link: "" });
    setSheetAberto(true);
  });
  const abrirEdicao = (ex) => pedir(() => { setEditando(ex.id); setForm(ex); setSheetAberto(true); });

  const salvar = async () => {
    if (!form.nome.trim() || salvando) return;
    setSalvando(true);
    await salvarExercicioDb(form, editando);
    setSalvando(false);
    setSheetAberto(false);
    recarregar();
  };
  const excluir = (id) => pedir(async () => { await excluirExercicioDb(id); recarregar(); });

  const filtrados = exercicios.filter((e) => (e.nome + e.grupoGrande + e.grupoMenor).toLowerCase().includes(busca.toLowerCase()));
  const grupos = {};
  filtrados.forEach((e) => { const g = e.grupoGrande || "Sem grupo"; grupos[g] = grupos[g] || []; grupos[g].push(e); });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#71727A" }} />
          <TextInput placeholder="Buscar exercício..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <button onClick={abrirNovo} style={{ background: "#E4DE00", border: "none", borderRadius: 8, width: 42, color: "#0A0A0A", cursor: "pointer" }}>
          <Plus size={20} style={{ margin: "auto" }} />
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#71727A", marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
        <Users size={13} /> Visível para todos que usam o site
      </div>

      {Object.keys(grupos).length === 0 && <EmptyState text="Nenhum exercício ainda. Toque em + para adicionar o primeiro." />}

      {Object.entries(grupos).map(([grupo, lista]) => (
        <Section key={grupo} title={grupo} icon={<Layers size={16} color="#E4DE00" />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lista.map((ex) => (
              <div key={ex.id} style={{ background: "#212226", border: "1px solid #2E2F34", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#F1EFE9", fontSize: 14 }}>{ex.nome}</div>
                    {ex.grupoMenor && <div style={{ marginTop: 4 }}><Badge>{ex.grupoMenor}</Badge></div>}
                    {ex.equipamento && <div style={{ fontSize: 12, color: "#9A9A94", marginTop: 6 }}>Equip: {ex.equipamento}</div>}
                    {ex.descricao && <div style={{ fontSize: 12.5, color: "#B9BABF", marginTop: 6, lineHeight: 1.4 }}>{ex.descricao}</div>}
                    {ex.link && (
                      <a
                        href={ex.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, color: "#E4DE00", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                      >
                        <PlayCircle size={14} /> Ver demonstração
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: 8 }}>
                    <Pencil size={15} color="#71727A" style={{ cursor: "pointer" }} onClick={() => abrirEdicao(ex)} />
                    <Trash2 size={15} color="#71727A" style={{ cursor: "pointer" }} onClick={() => excluir(ex.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}

      {sheetAberto && (
        <Sheet title={editando ? "Editar exercício" : "Novo exercício"} onClose={() => setSheetAberto(false)}>
          <Field label="Nome do exercício">
            <TextInput value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Snatch" />
          </Field>
          <Field label="Grupo grande">
            <TextInput list="grupos-grandes" value={form.grupoGrande} onChange={(e) => setForm({ ...form, grupoGrande: e.target.value })} placeholder="Ex: Levantamento Olímpico" />
            <datalist id="grupos-grandes">{GRUPOS_SUGERIDOS.map((g) => <option key={g} value={g} />)}</datalist>
          </Field>
          <Field label="Grupo menor / variação">
            <TextInput value={form.grupoMenor} onChange={(e) => setForm({ ...form, grupoMenor: e.target.value })} placeholder="Ex: Power Snatch" />
          </Field>
          <Field label="Equipamento">
            <TextInput value={form.equipamento} onChange={(e) => setForm({ ...form, equipamento: e.target.value })} placeholder="Ex: Barra, anilhas" />
          </Field>
          <Field label="Descrição / técnica">
            <TextArea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Pontos-chave de execução..." />
          </Field>
          <Field label="Link de demonstração (vídeo)">
            <TextInput type="url" value={form.link || ""} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Cole o link do vídeo (YouTube, Instagram...)" />
          </Field>
          <PrimaryButton onClick={salvar} disabled={salvando} style={{ width: "100%", marginTop: 6 }}>
            <Save size={16} /> {salvando ? "Salvando..." : "Salvar exercício"}
          </PrimaryButton>
        </Sheet>
      )}
      {Modal}
    </div>
  );
}

/* =================================================================
   WORKOUTS
================================================================= */

function blocoVazio() {
  return { id: uid(), titulo: "", nivel: "Verde", formato: FORMATOS[0], requisitos: "", objetivos: "", conteudo: "" };
}

function WorkoutForm({ inicial, onSalvar, onCancelar, legendas = {}, salvando }) {
  const [form, setForm] = useState(inicial || {
    nome: "", data: new Date().toISOString().slice(0, 10), categoria: "", tags: "",
    warmupGeral: "", warmupEspecifico: "", skill: "", blocos: [blocoVazio()],
  });

  const atualizarBloco = (id, campo, valor) => setForm({ ...form, blocos: form.blocos.map((b) => (b.id === id ? { ...b, [campo]: valor } : b)) });
  const addBloco = () => setForm({ ...form, blocos: [...form.blocos, blocoVazio()] });
  const removerBloco = (id) => setForm({ ...form, blocos: form.blocos.filter((b) => b.id !== id) });

  return (
    <div>
      <Field label="Nome do treino">
        <TextInput value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Treino de Terça" />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Data">
          <TextInput type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
        </Field>
        <Field label="Categoria">
          <TextInput value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Força" />
        </Field>
      </div>
      <Field label="Tags / palavras-chave">
        <TextInput value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Ex: força, superior, halteres (separe por vírgula)" />
      </Field>

      <Field label="G-WARM UP (geral)">
        <TextArea value={form.warmupGeral} onChange={(e) => setForm({ ...form, warmupGeral: e.target.value })} placeholder="Aquecimento geral..." />
      </Field>
      <Field label="E-WARM UP (específico)">
        <TextArea value={form.warmupEspecifico} onChange={(e) => setForm({ ...form, warmupEspecifico: e.target.value })} placeholder="Aquecimento específico do movimento..." />
      </Field>
      <Field label="Skill">
        <TextArea value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} placeholder="Trabalho de habilidade/técnica..." />
      </Field>

      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: "#F1EFE9", textTransform: "uppercase", margin: "18px 0 8px", letterSpacing: "0.04em" }}>
        Blocos do treino
      </div>

      {form.blocos.map((b, i) => (
        <div key={b.id} style={{ background: "#1C1D20", border: `1px solid ${corDoNivel(b.nivel)}55`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#9A9A94" }}>WORKOUT {i + 1}</span>
            {form.blocos.length > 1 && <Trash2 size={14} color="#71727A" style={{ cursor: "pointer" }} onClick={() => removerBloco(b.id)} />}
          </div>
          <Field label="Título (opcional)">
            <TextInput value={b.titulo} onChange={(e) => atualizarBloco(b.id, "titulo", e.target.value)} placeholder='Ex: "Metcon do dia"' />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Nível / cor">
              <Select value={b.nivel} onChange={(e) => atualizarBloco(b.id, "nivel", e.target.value)}>
                {NIVEIS.map((n) => <option key={n.nome} value={n.nome}>{n.nome}</option>)}
              </Select>
              {legendas[b.nivel] && <div style={{ fontSize: 11, color: "#71727A", marginTop: 5 }}>{legendas[b.nivel]}</div>}
            </Field>
            <Field label="Formato">
              <Select
                value={FORMATOS.includes(b.formato) ? b.formato : "Outro..."}
                onChange={(e) => {
                  const v = e.target.value;
                  atualizarBloco(b.id, "formato", v === "Outro..." ? "" : v);
                }}
              >
                {FORMATOS.map((f) => <option key={f} value={f}>{f}</option>)}
                <option value="Outro...">Outro...</option>
              </Select>
              {!FORMATOS.includes(b.formato) && (
                <TextInput
                  value={b.formato}
                  onChange={(e) => atualizarBloco(b.id, "formato", e.target.value)}
                  placeholder="Digite o formato (ex: CHIPPER)"
                  style={{ marginTop: 6 }}
                  autoFocus
                />
              )}
            </Field>
          </div>
          <Field label="Requisitos p/ esse workout">
            <TextArea value={b.requisitos} onChange={(e) => atualizarBloco(b.id, "requisitos", e.target.value)} placeholder="Pré-requisitos técnicos, peso mínimo, mobilidade..." />
          </Field>
          <Field label="Objetivos">
            <TextArea value={b.objetivos} onChange={(e) => atualizarBloco(b.id, "objetivos", e.target.value)} placeholder="O que esse bloco desenvolve..." />
          </Field>
          <Field label="Conteúdo (movimentos, reps, tempo)">
            <AutoTextArea value={b.conteudo} onChange={(e) => atualizarBloco(b.id, "conteudo", e.target.value)} placeholder={"Ex: 21-15-9\nThrusters\nPull-ups"} />
          </Field>
        </div>
      ))}

      <GhostButton onClick={addBloco} style={{ width: "100%", marginBottom: 16 }}><Plus size={15} /> Adicionar workout / bloco</GhostButton>

      <div style={{ display: "flex", gap: 10 }}>
        <GhostButton onClick={onCancelar} style={{ flex: 1 }}>Cancelar</GhostButton>
        <PrimaryButton onClick={() => onSalvar(form)} disabled={salvando} style={{ flex: 1 }}>
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar treino"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function WorkoutDetalhes({ w, legendas = {} }) {
  const tags = (w.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <>
      {(w.codigo || tags.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {w.codigo && <Badge>#{w.codigo}</Badge>}
          {tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
      )}
      {(w.criadoEm || w.atualizadoEm) && (
        <div style={{ fontSize: 11, color: "#5f6066", marginTop: 6 }}>
          {w.criadoEm && `Criado em ${formatarDataHora(w.criadoEm)}`}
          {w.atualizadoEm && w.atualizadoEm !== w.criadoEm && ` · Editado em ${formatarDataHora(w.atualizadoEm)}`}
        </div>
      )}
      {w.warmupGeral && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9A9A94", marginBottom: 4 }}>G — WARM UP</div>
          <div style={{ fontSize: 13, color: "#D8D8D3", whiteSpace: "pre-wrap" }}>{w.warmupGeral}</div>
        </div>
      )}
      {w.warmupEspecifico && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9A9A94", marginBottom: 4 }}>E — WARM UP</div>
          <div style={{ fontSize: 13, color: "#D8D8D3", whiteSpace: "pre-wrap" }}>{w.warmupEspecifico}</div>
        </div>
      )}
      {w.skill && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9A9A94", marginBottom: 4 }}>SKILL</div>
          <div style={{ fontSize: 13, color: "#D8D8D3", whiteSpace: "pre-wrap" }}>{w.skill}</div>
        </div>
      )}
      {w.blocos.map((b, i) => (
        <div key={b.id} style={{ marginTop: 16, borderLeft: `3px solid ${corDoNivel(b.nivel)}`, paddingLeft: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, color: "#F1EFE9", textTransform: "uppercase" }}>
              Workout {i + 1} {b.titulo && `— ${b.titulo}`}
            </span>
            <Stamp nome={b.nivel} cor={corDoNivel(b.nivel)} size="sm" />
            <Badge>{b.formato}</Badge>
          </div>
          {legendas[b.nivel] && <div style={{ fontSize: 11.5, color: "#8C8D91", fontStyle: "italic", marginBottom: 6 }}>{legendas[b.nivel]}</div>}
          {b.requisitos && <div style={{ fontSize: 12.5, color: "#B9BABF", marginBottom: 4 }}><span style={{ color: "#9A9A94", fontWeight: 600 }}>Requisitos: </span>{b.requisitos}</div>}
          {b.objetivos && <div style={{ fontSize: 12.5, color: "#B9BABF", marginBottom: 4 }}><span style={{ color: "#9A9A94", fontWeight: 600 }}>Objetivos: </span>{b.objetivos}</div>}
          {b.conteudo && <div style={{ fontSize: 13, color: "#F1EFE9", whiteSpace: "pre-wrap", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{b.conteudo}</div>}
        </div>
      ))}
    </>
  );
}

function WorkoutCard({ w, onEditar, onExcluir, onCompartilhar, expandido, onToggle, legendas, destaque }) {
  const tags = (w.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <div style={{
      background: destaque ? "linear-gradient(135deg, rgba(228,222,0,0.10), rgba(228,222,0,0.02))" : "#1A1B1E",
      border: destaque ? "1px solid rgba(228,222,0,0.5)" : "1px solid #26272B",
      borderRadius: 12, marginBottom: 10, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={onToggle}>
        <div>
          {destaque && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#E4DE00", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              <Star size={11} fill="#E4DE00" /> Destaque
            </div>
          )}
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 15, color: destaque ? "#FFFFFF" : "#D8D8D3", letterSpacing: "0.03em", textTransform: "uppercase" }}>{w.nome || "Treino sem nome"}</div>
          <div style={{ fontSize: 12, color: "#6B6C72", marginTop: 3, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span>{w.data}</span>
            {w.codigo && <Badge>#{w.codigo}</Badge>}
            {w.categoria && <Badge>{w.categoria}</Badge>}
          </div>
          {tags.length > 0 && <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>{tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {w.blocos.map((b) => <Stamp key={b.id} nome={b.nivel} cor={corDoNivel(b.nivel)} size="sm" />)}
          </div>
        </div>
        {expandido ? <ChevronDown size={18} color="#71727A" /> : <ChevronRight size={18} color="#71727A" />}
      </div>

      {expandido && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #2E2F34" }}>
          <WorkoutDetalhes w={w} legendas={legendas} />
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <GhostButton onClick={() => onCompartilhar(w)} style={{ flex: 1 }}><Share2 size={14} /> Compartilhar</GhostButton>
            <GhostButton onClick={() => onEditar(w)} style={{ flex: 1 }}><Pencil size={14} /> Editar</GhostButton>
            <GhostButton onClick={() => onExcluir(w.id)} style={{ flex: 1 }}><Trash2 size={14} /> Excluir</GhostButton>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendaNiveis({ legendas, setLegendas, senha }) {
  const [aberto, setAberto] = useState(false);
  const { pedir, Modal } = useSenhaGate(senha);
  const salvar = async (nivel, texto) => {
    setLegendas({ ...legendas, [nivel]: texto });
    await salvarLegendaDb(nivel, texto);
  };
  const alternar = () => {
    if (aberto) { setAberto(false); return; }
    pedir(() => setAberto(true));
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={alternar} style={{
        width: "100%", background: "#1C1D20", border: "1px solid #2E2F34", borderRadius: 8, padding: "10px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between", color: "#B9BABF", fontSize: 13, cursor: "pointer",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Target size={14} color="#E4DE00" /> Legenda dos níveis</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!aberto && <Lock size={12} color="#71727A" />}
          {aberto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {aberto && (
        <div style={{ background: "#1C1D20", border: "1px solid #2E2F34", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 12 }}>
          {NIVEIS.map((n) => (
            <div key={n.nome} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 78, flexShrink: 0 }}><Stamp nome={n.nome} cor={n.cor} size="sm" /></div>
              <TextInput
                value={legendas[n.nome] || ""}
                onChange={(e) => setLegendas({ ...legendas, [n.nome]: e.target.value })}
                onBlur={(e) => salvar(n.nome, e.target.value)}
                placeholder="O que esse nível significa..."
                style={{ fontSize: 12.5, padding: "7px 10px" }}
              />
            </div>
          ))}
        </div>
      )}
      {Modal}
    </div>
  );
}

function BannerDestaque({ banner, setBanner, senha }) {
  const { pedir, Modal } = useSenhaGate(senha);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [opcoes, setOpcoes] = useState([]);
  const [workoutDoBanner, setWorkoutDoBanner] = useState(null);
  const [form, setForm] = useState(banner || { tipo: "Treino do dia", workoutId: "", observacao: "", titulo: "", descricao: "" });

  useEffect(() => {
    (async () => {
      if (banner && banner.workoutId && banner.tipo !== "Aviso") {
        const w = await fetchWorkoutById(banner.workoutId);
        setWorkoutDoBanner(w);
      } else {
        setWorkoutDoBanner(null);
      }
    })();
  }, [banner]);

  const abrirEdicao = () => pedir(async () => {
    setForm(banner || { tipo: "Treino do dia", workoutId: "", observacao: "", titulo: "", descricao: "" });
    const rows = await fetchWorkoutOptions();
    setOpcoes(rows);
    setSheetAberto(true);
  });

  const salvar = async () => {
    setSalvando(true);
    await salvarBannerDb(form);
    setBanner({ ...form });
    setSalvando(false);
    setSheetAberto(false);
  };
  const remover = async () => {
    setSalvando(true);
    await removerBannerDb();
    setBanner(null);
    setSalvando(false);
    setSheetAberto(false);
  };

  const ehAviso = form.tipo === "Aviso";
  const temConteudo = banner && (banner.tipo === "Aviso" ? banner.titulo : workoutDoBanner);

  return (
    <div style={{ marginBottom: 18 }}>
      {temConteudo ? (
        <div style={{
          position: "relative", background: "linear-gradient(135deg, rgba(228,222,0,0.14), rgba(228,222,0,0.03))",
          border: "1px solid rgba(228,222,0,0.4)", borderRadius: 12, padding: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#E4DE00", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Megaphone size={13} /> {banner.tipo || "Destaque"}
              </span>

              {banner.tipo === "Aviso" ? (
                <>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, color: "#FFFFFF", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {banner.titulo}
                  </div>
                  {banner.descricao && <div style={{ fontSize: 13, color: "#D8D8D3", marginTop: 6, lineHeight: 1.4 }}>{banner.descricao}</div>}
                </>
              ) : workoutDoBanner ? (
                <>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, color: "#FFFFFF", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {workoutDoBanner.nome || "Treino sem nome"}
                  </div>
                  <div style={{ fontSize: 12, color: "#B9BABF", marginTop: 4, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span>{workoutDoBanner.data}</span>
                    {workoutDoBanner.codigo && <Badge>#{workoutDoBanner.codigo}</Badge>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {workoutDoBanner.blocos.map((b) => <Stamp key={b.id} nome={b.nivel} cor={corDoNivel(b.nivel)} size="sm" />)}
                  </div>
                  {banner.observacao && <div style={{ fontSize: 13, color: "#D8D8D3", marginTop: 8, lineHeight: 1.4 }}>{banner.observacao}</div>}
                  <a
                    href={buildShareUrl(workoutDoBanner.id)}
                    onClick={(e) => { e.preventDefault(); window.location.hash = `/w/${workoutDoBanner.id}`; }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, color: "#E4DE00", fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}
                  >
                    <LinkIcon size={13} /> Ver treino completo
                  </a>
                </>
              ) : (
                <div style={{ fontSize: 12.5, color: "#71727A", marginTop: 8 }}>O treino desse destaque foi removido.</div>
              )}
            </div>
            <Pencil size={16} color="#9A9A94" style={{ cursor: "pointer", flexShrink: 0 }} onClick={abrirEdicao} />
          </div>
        </div>
      ) : (
        <button
          onClick={abrirEdicao}
          style={{
            width: "100%", background: "none", border: "1px dashed #3A3B40", borderRadius: 10, padding: "12px",
            color: "#71727A", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
          }}
        >
          <Plus size={14} /> Adicionar destaque na página inicial
        </button>
      )}

      {Modal}

      {sheetAberto && (
        <Sheet title="Editar destaque" onClose={() => setSheetAberto(false)}>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option>Treino do dia</option>
              <option>Treino destaque</option>
              <option>Aviso</option>
            </Select>
          </Field>

          {ehAviso ? (
            <>
              <Field label="Título">
                <TextInput value={form.titulo || ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Box fechada no feriado" />
              </Field>
              <Field label="Descrição">
                <TextArea value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes do aviso..." />
              </Field>
            </>
          ) : (
            <>
              <Field label="Qual treino?">
                <Select value={form.workoutId || ""} onChange={(e) => setForm({ ...form, workoutId: e.target.value })}>
                  <option value="">Selecione um treino...</option>
                  {opcoes.map((w) => (
                    <option key={w.id} value={w.id}>{w.nome || "Treino sem nome"} — {w.data} {w.codigo && `(#${w.codigo})`}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Observação (opcional)">
                <TextArea value={form.observacao || ""} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Ex: bora treinar pesado hoje!" />
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {banner && (
              <GhostButton onClick={remover} style={{ flex: 1 }}><Trash2 size={14} /> Remover</GhostButton>
            )}
            <PrimaryButton onClick={salvar} disabled={salvando || (!ehAviso && !form.workoutId)} style={{ flex: 1 }}>
              <Save size={16} /> {salvando ? "Salvando..." : "Salvar destaque"}
            </PrimaryButton>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function WorkoutsTab({ legendas, setLegendas, onToast, senha, bannerWorkoutId }) {
  const [recentes, setRecentes] = useState([]);
  const [carregandoRecentes, setCarregandoRecentes] = useState(true);
  const [totalGeral, setTotalGeral] = useState(0);

  const [modoTodos, setModoTodos] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvandoTreino, setSalvandoTreino] = useState(false);
  const [expandidoId, setExpandidoId] = useState(null);
  const debounceRef = useRef(null);
  const { pedir, Modal } = useSenhaGate(senha);

  const carregarRecentes = useCallback(async () => {
    setCarregandoRecentes(true);
    const { rows, total: t } = await fetchWorkoutsRecentes(6);
    setRecentes(rows);
    setTotalGeral(t);
    setCarregandoRecentes(false);
  }, []);

  useEffect(() => { carregarRecentes(); }, [carregarRecentes]);

  const carregarPrimeiraPagina = useCallback(async () => {
    setCarregando(true);
    const { rows, total: t } = await fetchWorkoutsPage(0);
    setWorkouts(rows);
    setTotal(t);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (!modoTodos) return;
    clearTimeout(debounceRef.current);
    if (!busca.trim()) { carregarPrimeiraPagina(); return; }
    setBuscando(true);
    debounceRef.current = setTimeout(async () => {
      const rows = await searchWorkoutsDb(busca.trim());
      setWorkouts(rows);
      setBuscando(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, modoTodos]);

  const carregarMais = async () => {
    setCarregandoMais(true);
    const { rows } = await fetchWorkoutsPage(workouts.length);
    setWorkouts((prev) => [...prev, ...rows]);
    setCarregandoMais(false);
  };

  const abrirNovoTreino = () => pedir(() => { setEditando(null); setSheetAberto(true); });
  const abrirEdicaoTreino = (w) => pedir(() => { setEditando(w.id); setSheetAberto(true); });
  const abrirTodos = () => pedir(() => { setModoTodos(true); carregarPrimeiraPagina(); });
  const voltarRecentes = () => { setModoTodos(false); setBusca(""); };

  const recarregarTudo = async () => {
    await carregarRecentes();
    if (modoTodos) {
      if (busca.trim()) { const rows = await searchWorkoutsDb(busca.trim()); setWorkouts(rows); }
      else { await carregarPrimeiraPagina(); }
    }
  };

  const salvar = async (form) => {
    if (salvandoTreino) return;
    setSalvandoTreino(true);
    if (editando) {
      await atualizarWorkoutDb(editando, form);
    } else {
      await inserirWorkoutDb(form);
    }
    setSalvandoTreino(false);
    setSheetAberto(false);
    setEditando(null);
    await recarregarTudo();
  };

  const excluir = (id) => pedir(async () => {
    await excluirWorkoutDb(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    setRecentes((prev) => prev.filter((w) => w.id !== id));
    setTotalGeral((prev) => Math.max(0, prev - 1));
  });

  const compartilhar = async (w) => {
    const ok = await copyToClipboard(buildShareUrl(w.id));
    onToast(ok ? "Link do treino copiado!" : "Não consegui copiar o link");
  };

  const listaExibida = modoTodos ? workouts : recentes;
  const carregandoLista = modoTodos ? carregando : carregandoRecentes;
  const treinoEmEdicao = modoTodos
    ? workouts.find((w) => w.id === editando)
    : recentes.find((w) => w.id === editando);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: "#71727A", display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={13} /> Visível para todos {totalGeral > 0 && `· ${totalGeral} treinos`}
        </div>
        <PrimaryButton onClick={abrirNovoTreino}><Plus size={15} /> Novo treino</PrimaryButton>
      </div>
      <div style={{ height: 12 }} />

      <LegendaNiveis legendas={legendas} setLegendas={setLegendas} senha={senha} />

      {modoTodos ? (
        <>
          <GhostButton onClick={voltarRecentes} style={{ marginBottom: 14 }}>
            <ArrowLeft size={14} /> Voltar aos recentes
          </GhostButton>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#71727A" }} />
            <TextInput placeholder="Buscar por nome, código, categoria ou tag..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11.5, color: "#5f6066", marginBottom: 12 }}>
          Mostrando os {Math.min(6, totalGeral)} treinos mais recentes
        </div>
      )}

      {carregandoLista ? (
        <Spinner label="Carregando treinos..." />
      ) : (
        <>
          {listaExibida.length === 0 && (
            <EmptyState text={busca.trim() ? "Nenhum treino encontrado para essa busca." : "Nenhum treino programado ainda. Toque em 'Novo treino'."} />
          )}
          {listaExibida.map((w) => (
            <WorkoutCard
              key={w.id} w={w} expandido={expandidoId === w.id}
              onToggle={() => setExpandidoId(expandidoId === w.id ? null : w.id)}
              onEditar={abrirEdicaoTreino}
              onExcluir={excluir} onCompartilhar={compartilhar} legendas={legendas}
              destaque={w.id === bannerWorkoutId}
            />
          ))}
          {modoTodos && !busca.trim() && workouts.length < total && (
            <GhostButton onClick={carregarMais} style={{ width: "100%" }}>
              {carregandoMais ? "Carregando..." : `Carregar mais (${workouts.length}/${total})`}
            </GhostButton>
          )}
          {!modoTodos && totalGeral > 6 && (
            <GhostButton onClick={abrirTodos} style={{ width: "100%" }}>
              <Lock size={14} /> Ver todos os treinos ({totalGeral})
            </GhostButton>
          )}
          {buscando && <div style={{ fontSize: 12, color: "#71727A", textAlign: "center", marginTop: 8 }}>Buscando...</div>}
        </>
      )}

      {Modal}

      {sheetAberto && (
        <Sheet title={editando ? "Editar treino" : "Novo treino"} onClose={() => { setSheetAberto(false); setEditando(null); }}>
          <WorkoutForm
            inicial={editando ? treinoEmEdicao : null}
            onSalvar={salvar}
            onCancelar={() => { setSheetAberto(false); setEditando(null); }}
            legendas={legendas}
            salvando={salvandoTreino}
          />
        </Sheet>
      )}
    </div>
  );
}

/* =================================================================
   LOG PESSOAL (execução + ajustes)
================================================================= */

function ProgressoTreinos({ logs }) {
  const grupos = agruparProgresso(logs);
  if (grupos.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: "'Anton', sans-serif", fontSize: 14, color: "#F1EFE9", textTransform: "uppercase",
        marginBottom: 10, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 7,
      }}>
        <TrendingUp size={15} color="#E4DE00" /> Seu progresso
      </div>

      {grupos.map((g) => (
        <div key={`${g.nome}|${g.blocoNome}`} style={{ background: "#1A1B1E", border: "1px solid #26272B", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, color: "#F1EFE9", fontSize: 14 }}>
            {g.nome}{g.blocoNome && ` — ${g.blocoNome}`}
          </div>
          <div style={{ fontSize: 11, color: "#71727A", marginBottom: 12 }}>
            {g.ehTempo ? "Tempo — menor é melhor" : "Pontuação — maior é melhor"} · {g.itens.length} registros
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10.5, color: "#71727A", textTransform: "uppercase", letterSpacing: "0.04em" }}>Melhor</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, color: "#4CAF6D", fontWeight: 700 }}>
                {g.ehTempo ? formatarSegundos(g.melhor) : g.melhor}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: "#71727A", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pior</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, color: "#E6483F", fontWeight: 700 }}>
                {g.ehTempo ? formatarSegundos(g.pior) : g.pior}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={g.itens} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26272B" />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: "#71727A" }} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71727A" }}
                  reversed={g.ehTempo}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => (g.ehTempo ? formatarSegundos(v) : v)}
                  width={46}
                />
                <Tooltip
                  contentStyle={{ background: "#212226", border: "1px solid #3A3B40", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#F1EFE9" }}
                  formatter={(v) => [g.ehTempo ? formatarSegundos(v) : v, "Resultado"]}
                />
                <Line type="monotone" dataKey="valor" stroke="#E4DE00" strokeWidth={2} dot={{ r: 3, fill: "#E4DE00" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 10.5, color: "#5f6066", marginTop: 4, textAlign: "center" }}>
            (linha subindo = evolução, mesmo em treinos por tempo)
          </div>
        </div>
      ))}
    </div>
  );
}

function LogTab({ legendas }) {
  const [atleta, setAtletaState] = useState(() => localStorage.getItem("cantil_atleta_nome") || "");
  const [nomeInput, setNomeInput] = useState("");
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [workoutsRecentes, setWorkoutsRecentes] = useState([]);
  const [form, setForm] = useState({ data: new Date().toISOString().slice(0, 10), workoutId: "", blocoId: "", nivel: "Verde", resultado: "", ajuste: "", notas: "" });

  const carregarLogs = useCallback(async (nome) => {
    setCarregando(true);
    const rows = await fetchLogs(nome);
    setLogs(rows);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (atleta) carregarLogs(atleta);
  }, [atleta, carregarLogs]);

  useEffect(() => {
    (async () => {
      const { rows } = await fetchWorkoutsPage(0);
      setWorkoutsRecentes(rows);
    })();
  }, []);

  const confirmarNome = () => {
    if (!nomeInput.trim()) return;
    localStorage.setItem("cantil_atleta_nome", nomeInput.trim());
    setAtletaState(nomeInput.trim());
  };
  const trocarUsuario = () => {
    localStorage.removeItem("cantil_atleta_nome");
    setAtletaState("");
    setLogs([]);
  };

  if (!atleta) {
    return (
      <div style={{ paddingTop: 30 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: "#F1EFE9", textTransform: "uppercase" }}>Quem é você?</div>
          <div style={{ fontSize: 12.5, color: "#71727A", marginTop: 6, padding: "0 10px" }}>
            Seu nome fica salvo neste aparelho para separar o seu registro do de outros alunos.
          </div>
        </div>
        <Field label="Seu nome">
          <TextInput value={nomeInput} onChange={(e) => setNomeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmarNome(); }} placeholder="Ex: Ana Souza" autoFocus />
        </Field>
        <PrimaryButton onClick={confirmarNome} style={{ width: "100%" }}>Continuar</PrimaryButton>
      </div>
    );
  }

  const workoutSelecionado = workoutsRecentes.find((w) => w.id === form.workoutId);
  const blocosDisponiveis = workoutSelecionado ? workoutSelecionado.blocos : [];

  const abrirNovo = () => {
    setForm({ data: new Date().toISOString().slice(0, 10), workoutId: "", blocoId: "", nivel: "Verde", resultado: "", ajuste: "", notas: "" });
    setSheetAberto(true);
  };

  const salvar = async () => {
    if (salvando) return;
    setSalvando(true);
    const bloco = blocosDisponiveis.find((b) => b.id === form.blocoId);
    const entrada = {
      atleta, data: form.data, workoutId: form.workoutId || null,
      workoutNome: workoutSelecionado ? workoutSelecionado.nome : "Treino livre",
      blocoNome: bloco ? (bloco.titulo || `Workout ${blocosDisponiveis.indexOf(bloco) + 1}`) : "",
      nivel: form.nivel, resultado: form.resultado, ajuste: form.ajuste, notas: form.notas,
    };
    await inserirLogDb(entrada);
    setSalvando(false);
    setSheetAberto(false);
    carregarLogs(atleta);
  };
  const excluir = async (id) => { await excluirLogDb(id); setLogs((prev) => prev.filter((l) => l.id !== id)); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: "#71727A", display: "flex", alignItems: "center", gap: 5 }}>
          <Lock size={12} /> {atleta}
          <button onClick={trocarUsuario} style={{ background: "none", border: "none", color: "#71727A", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, marginLeft: 4, fontSize: 11.5, textDecoration: "underline" }}>
            <LogOut size={11} /> trocar
          </button>
        </div>
        <PrimaryButton onClick={abrirNovo}><Plus size={15} /> Registrar</PrimaryButton>
      </div>
      <div style={{ height: 12 }} />

      {carregando ? <Spinner label="Carregando seu log..." /> : (
        <>
          <ProgressoTreinos logs={logs} />
          {logs.length === 0 && <EmptyState text="Nenhum registro ainda. Registre seu resultado e eventuais ajustes/adaptações do treino." />}
          {logs.map((l) => (
            <div key={l.id} style={{ background: "#212226", border: "1px solid #2E2F34", borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#71727A" }}>{l.data}</div>
                  <div style={{ fontWeight: 700, color: "#F1EFE9", fontSize: 14, marginTop: 2 }}>{l.workoutNome}{l.blocoNome && ` — ${l.blocoNome}`}</div>
                  <div style={{ marginTop: 6 }}><Stamp nome={l.nivel} cor={corDoNivel(l.nivel)} size="sm" /></div>
                </div>
                <Trash2 size={15} color="#71727A" style={{ cursor: "pointer" }} onClick={() => excluir(l.id)} />
              </div>
              {l.resultado && (
                <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#F1EFE9" }}>
                  <Flag size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} color="#E4DE00" />{l.resultado}
                </div>
              )}
              {l.ajuste && (
                <div style={{ marginTop: 8, fontSize: 12.5, color: "#FF8A3D" }}>
                  <Zap size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />Ajuste: {l.ajuste}
                </div>
              )}
              {l.notas && <div style={{ marginTop: 6, fontSize: 12.5, color: "#B9BABF" }}>{l.notas}</div>}
            </div>
          ))}
        </>
      )}

      {sheetAberto && (
        <Sheet title="Registrar treino" onClose={() => setSheetAberto(false)}>
          <Field label="Data">
            <TextInput type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </Field>
          <Field label="Treino (opcional)">
            <Select value={form.workoutId} onChange={(e) => setForm({ ...form, workoutId: e.target.value, blocoId: "" })}>
              <option value="">Treino livre / não listado</option>
              {workoutsRecentes.map((w) => <option key={w.id} value={w.id}>{w.nome} — {w.data}</option>)}
            </Select>
          </Field>
          {blocosDisponiveis.length > 0 && (
            <Field label="Bloco / Workout">
              <Select value={form.blocoId} onChange={(e) => {
                const b = blocosDisponiveis.find((bl) => bl.id === e.target.value);
                setForm({ ...form, blocoId: e.target.value, nivel: b ? b.nivel : form.nivel });
              }}>
                <option value="">Selecione...</option>
                {blocosDisponiveis.map((b, i) => <option key={b.id} value={b.id}>Workout {i + 1} {b.titulo && `— ${b.titulo}`}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Nível executado">
            <Select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
              {NIVEIS.map((n) => <option key={n.nome} value={n.nome}>{n.nome}</option>)}
            </Select>
            {legendas[form.nivel] && <div style={{ fontSize: 11, color: "#71727A", marginTop: 5 }}>{legendas[form.nivel]}</div>}
          </Field>
          <Field label="Resultado (tempo, rounds, peso...)">
            <TextInput value={form.resultado} onChange={(e) => setForm({ ...form, resultado: e.target.value })} placeholder="Ex: 12:34 / 5 rounds + 10 reps" />
          </Field>
          <Field label="Ajuste / adaptação feita">
            <TextArea value={form.ajuste} onChange={(e) => setForm({ ...form, ajuste: e.target.value })} placeholder="Ex: troquei push press por strict press por causa do ombro" />
          </Field>
          <Field label="Notas">
            <TextArea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Como se sentiu, observações..." />
          </Field>
          <PrimaryButton onClick={salvar} disabled={salvando} style={{ width: "100%", marginTop: 6 }}>
            <Save size={16} /> {salvando ? "Salvando..." : "Salvar registro"}
          </PrimaryButton>
        </Sheet>
      )}
    </div>
  );
}

/* =================================================================
   TELA SOMENTE-LEITURA (aberta via link compartilhado)
================================================================= */

function ViewOnlyWorkout({ id, legendas }) {
  const [w, setW] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetchWorkoutById(id);
      setW(r);
      setCarregando(false);
    })();
  }, [id]);

  const voltar = () => { window.location.hash = ""; };

  if (!w) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: 20 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ color: "#9A9A94", textAlign: "center", marginTop: 60, fontSize: 14 }}>
          {carregando ? "Carregando treino..." : "Treino não encontrado (o link pode estar errado ou o treino foi removido)."}
        </div>
        {!carregando && <GhostButton onClick={voltar} style={{ margin: "20px auto 0" }}><ArrowLeft size={14} /> Ver todos os treinos</GhostButton>}
      </div>
    );
  }
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "'Inter', sans-serif", paddingBottom: 40 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ padding: "20px 16px 10px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E4DE00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Dumbbell size={18} color="#0A0A0A" />
        </div>
        <div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: "#FFFFFF", letterSpacing: "0.03em", lineHeight: 1 }}>CANTIL</div>
          <div style={{ fontSize: 9, color: "#E4DE00", letterSpacing: "0.35em", marginTop: 2 }}>FITNESS</div>
        </div>
        <Badge>somente visualização</Badge>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: "#212226", border: "1px solid #2E2F34", borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: "#F1EFE9", textTransform: "uppercase", letterSpacing: "0.03em" }}>{w.nome || "Treino sem nome"}</div>
          <div style={{ fontSize: 12, color: "#71727A", marginTop: 4, display: "flex", gap: 8, alignItems: "center" }}>
            <span>{w.data}</span>
            {w.categoria && <Badge>{w.categoria}</Badge>}
          </div>
          <WorkoutDetalhes w={w} legendas={legendas} />
        </div>
        <GhostButton onClick={voltar} style={{ width: "100%", marginTop: 16 }}><ArrowLeft size={14} /> Ver todos os treinos no site</GhostButton>
      </div>
    </div>
  );
}

/* =================================================================
   APP ROOT
================================================================= */

function parseHashWorkoutId() {
  const m = window.location.hash.match(/^#\/w\/(.+)$/);
  return m ? m[1] : null;
}

export default function App() {
  const [aba, setAba] = useState("workouts");
  const [carregando, setCarregando] = useState(true);
  const [exercicios, setExercicios] = useState([]);
  const [legendas, setLegendas] = useState({});
  const [banner, setBanner] = useState(null);
  const [senha, setSenha] = useState(SENHA_PADRAO);
  const [toast, setToast] = useState("");
  const [viewOnlyId, setViewOnlyId] = useState(parseHashWorkoutId());

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    const onHashChange = () => setViewOnlyId(parseHashWorkoutId());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const recarregarExercicios = useCallback(async () => setExercicios(await fetchExercicios()), []);

  useEffect(() => {
    (async () => {
      const [ex, leg, ban, cfgSenha] = await Promise.all([
        fetchExercicios(), fetchLegendas(), fetchBanner(), fetchConfig(),
      ]);
      setExercicios(ex);
      setLegendas(leg);
      setBanner(ban);
      setSenha(cfgSenha);
      setCarregando(false);
    })();
  }, []);

  if (viewOnlyId) return <ViewOnlyWorkout id={viewOnlyId} legendas={legendas} />;

  const abas = [
    { id: "biblioteca", label: "Biblioteca", icon: Dumbbell },
    { id: "workouts", label: "Workouts", icon: ListChecks },
    { id: "log", label: "Meu log", icon: ClipboardList },
  ];

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <div style={{ padding: "20px 16px 8px", borderBottom: "1px solid #222" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#E4DE00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Dumbbell size={20} color="#0A0A0A" />
            </div>
            <div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: "#FFFFFF", letterSpacing: "0.03em", lineHeight: 1 }}>CANTIL</div>
              <div style={{ fontSize: 10, color: "#E4DE00", letterSpacing: "0.4em", marginTop: 3 }}>FITNESS</div>
            </div>
          </div>
          <TrocarSenha senha={senha} setSenha={setSenha} />
        </div>
      </div>

      <div style={{ padding: "16px 16px 90px", maxWidth: 640, margin: "0 auto" }}>
        {carregando ? <Spinner /> : (
          <>
            {aba === "biblioteca" && <BibliotecaTab exercicios={exercicios} recarregar={recarregarExercicios} senha={senha} />}
            {aba === "workouts" && (
              <>
                <BannerDestaque banner={banner} setBanner={setBanner} senha={senha} />
                <WorkoutsTab
                  legendas={legendas}
                  setLegendas={setLegendas}
                  onToast={mostrarToast}
                  senha={senha}
                  bannerWorkoutId={banner && banner.tipo !== "Aviso" ? banner.workoutId : null}
                />
              </>
            )}
            {aba === "log" && <LogTab legendas={legendas} />}
          </>
        )}
      </div>

      <Toast text={toast} />

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1C1D20", borderTop: "1px solid #2E2F34", display: "flex", padding: "8px 6px 14px" }}>
        <div style={{ display: "flex", maxWidth: 640, margin: "0 auto", width: "100%" }}>
          {abas.map((a) => {
            const Icon = a.icon;
            const ativo = aba === a.id;
            return (
              <button key={a.id} onClick={() => setAba(a.id)} style={{
                flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex",
                flexDirection: "column", alignItems: "center", gap: 3, color: ativo ? "#E4DE00" : "#71727A", padding: "6px 0",
              }}>
                <Icon size={20} />
                <span style={{ fontSize: 10.5, fontWeight: 600 }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
