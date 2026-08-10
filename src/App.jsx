import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dumbbell, ListChecks, Plus, X, Search,
  ChevronDown, ChevronRight, Trash2, Pencil, Timer,
  Users, Lock, Save, Layers, Target, Share2, Check, ArrowLeft,
  PlayCircle, Link as LinkIcon, Megaphone, KeyRound, Star, BookOpen
} from "lucide-react";
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

const protocoloFromDb = (r) => ({
  id: r.id, titulo: r.titulo || "", resumo: r.resumo || "", descricao: r.descricao || "",
  duracao: r.duracao || "", objetivo: r.objetivo || "", tags: r.tags || "",
  criadoEm: r.criado_em, atualizadoEm: r.atualizado_em,
});
const protocoloToDb = (p) => ({
  titulo: p.titulo, resumo: p.resumo, descricao: p.descricao,
  duracao: p.duracao, objetivo: p.objetivo, tags: p.tags || "",
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

async function fetchProtocolos() {
  const { data, error } = await supabase.from("protocolos").select("*").order("criado_em", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(protocoloFromDb);
}
async function inserirProtocoloDb(p) {
  const agora = new Date().toISOString();
  const payload = { ...protocoloToDb(p), criado_em: agora, atualizado_em: agora };
  const { data, error } = await supabase.from("protocolos").insert(payload).select().single();
  if (error) { console.error(error); return null; }
  return protocoloFromDb(data);
}
async function atualizarProtocoloDb(id, p) {
  const payload = { ...protocoloToDb(p), atualizado_em: new Date().toISOString() };
  const { data, error } = await supabase.from("protocolos").update(payload).eq("id", id).select().single();
  if (error) { console.error(error); return null; }
  return protocoloFromDb(data);
}
async function excluirProtocoloDb(id) {
  const { error } = await supabase.from("protocolos").delete().eq("id", id);
  if (error) console.error(error);
}
async function fetchProtocoloById(id) {
  const { data, error } = await supabase.from("protocolos").select("*").eq("id", id).maybeSingle();
  if (error || !data) { if (error) console.error(error); return null; }
  return protocoloFromDb(data);
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

async function fetchApresentacoes() {
  const { data, error } = await supabase.from("apresentacoes").select("*").order("criado_em", { ascending: true });
  if (error) { console.error(error); return []; }
  return data.map((r) => ({
    id: r.id, tag: r.tag || "", titulo: r.titulo || "", descricao: r.descricao || "",
    criadoEm: r.criado_em, atualizadoEm: r.atualizado_em,
  }));
}
async function inserirApresentacaoDb(ap) {
  const agora = new Date().toISOString();
  const payload = { tag: ap.tag || "", titulo: ap.titulo || "", descricao: ap.descricao || "", criado_em: agora, atualizado_em: agora };
  const { data, error } = await supabase.from("apresentacoes").insert(payload).select().single();
  if (error) { console.error(error); return null; }
  return { id: data.id, tag: data.tag || "", titulo: data.titulo || "", descricao: data.descricao || "", criadoEm: data.criado_em, atualizadoEm: data.atualizado_em };
}
async function atualizarApresentacaoDb(id, ap) {
  const payload = { tag: ap.tag || "", titulo: ap.titulo || "", descricao: ap.descricao || "", atualizado_em: new Date().toISOString() };
  const { error } = await supabase.from("apresentacoes").update(payload).eq("id", id);
  if (error) { console.error(error); return false; }
  return true;
}
async function excluirApresentacaoDb(id) {
  const { error } = await supabase.from("apresentacoes").delete().eq("id", id);
  if (error) console.error(error);
}
// Migração de uma vez só: se a tabela antiga (singular, "apresentacao") tiver conteúdo e a nova
// lista ainda estiver vazia, aproveita o texto antigo como o primeiro bloco da lista nova.
async function migrarApresentacaoAntiga() {
  const { data, error } = await supabase.from("apresentacao").select("*").eq("id", 1).maybeSingle();
  if (error || !data || !data.titulo) return null;
  return { tag: data.tag || "", titulo: data.titulo || "", descricao: data.descricao || "" };
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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);
  return (
    <textarea
      {...props}
      ref={ref}
      style={{ ...inputStyle, resize: "vertical", minHeight: 88, overflow: "hidden", lineHeight: 1.5, ...(props.style || {}) }}
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
  const [novaCategoria, setNovaCategoria] = useState(false);
  const [form, setForm] = useState({ nome: "", grupoGrande: "", grupoMenor: "", equipamento: "", descricao: "", link: "" });
  const { pedir, Modal } = useSenhaGate(senha);

  const categoriasExistentes = Array.from(
    new Set([...GRUPOS_SUGERIDOS, ...exercicios.map((e) => e.grupoGrande).filter(Boolean)])
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const abrirNovo = () => pedir(() => {
    setEditando(null);
    setNovaCategoria(false);
    setForm({ nome: "", grupoGrande: "", grupoMenor: "", equipamento: "", descricao: "", link: "" });
    setSheetAberto(true);
  });
  const abrirEdicao = (ex) => pedir(() => { setEditando(ex.id); setNovaCategoria(false); setForm(ex); setSheetAberto(true); });

  const salvar = async () => {
    if (!form.nome.trim() || salvando) return;
    setSalvando(true);
    await salvarExercicioDb(form, editando);
    setSalvando(false);
    setSheetAberto(false);
    recarregar();
  };
  const excluir = (id) => pedir(async () => { await excluirExercicioDb(id); recarregar(); });

  const textoBuscavelEx = (e) => [e.nome, e.grupoGrande, e.grupoMenor, e.equipamento, e.descricao]
    .filter(Boolean).join(" ").toLowerCase();
  const filtrados = exercicios.filter((e) => textoBuscavelEx(e).includes(busca.trim().toLowerCase()));
  const grupos = {};
  filtrados.forEach((e) => { const g = e.grupoGrande || "Sem grupo"; grupos[g] = grupos[g] || []; grupos[g].push(e); });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#71727A" }} />
          <TextInput placeholder="Buscar por nome, categoria, equipamento, descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 32 }} />
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
          <Field label="Grupo grande (categoria)">
            <Select
              value={novaCategoria ? "__nova__" : form.grupoGrande}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__nova__") { setNovaCategoria(true); setForm({ ...form, grupoGrande: "" }); }
                else { setNovaCategoria(false); setForm({ ...form, grupoGrande: v }); }
              }}
            >
              <option value="">Selecione uma categoria...</option>
              {categoriasExistentes.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__nova__">+ Criar nova categoria...</option>
            </Select>
            {novaCategoria && (
              <TextInput
                value={form.grupoGrande}
                onChange={(e) => setForm({ ...form, grupoGrande: e.target.value })}
                placeholder="Digite o nome da nova categoria"
                style={{ marginTop: 6 }}
                autoFocus
              />
            )}
          </Field>
          <Field label="Grupo menor / variação">
            <TextInput value={form.grupoMenor} onChange={(e) => setForm({ ...form, grupoMenor: e.target.value })} placeholder="Ex: Power Snatch" />
          </Field>
          <Field label="Equipamento">
            <TextInput value={form.equipamento} onChange={(e) => setForm({ ...form, equipamento: e.target.value })} placeholder="Ex: Barra, anilhas" />
          </Field>
          <Field label="Descrição / técnica">
            <AutoTextArea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Pontos-chave de execução..." />
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
  return { id: uid(), titulo: "", nivel: "Verde", formato: FORMATOS[0], timeCap: "", requisitos: "", objetivos: "", conteudo: "", resultado: "", resultadoData: null };
}

function WorkoutForm({ inicial, onSalvar, onCancelar, legendas = {}, salvando }) {
  const [form, setForm] = useState(inicial || {
    nome: "", data: new Date().toISOString().slice(0, 10), categoria: "", tags: "",
    warmupGeral: "", warmupEspecifico: "", skill: "", blocos: [blocoVazio()],
  });

  const atualizarBloco = (id, campo, valor) => setForm({
    ...form,
    blocos: form.blocos.map((b) => {
      if (b.id !== id) return b;
      const atualizado = { ...b, [campo]: valor };
      if (campo === "resultado") atualizado.resultadoData = new Date().toISOString();
      return atualizado;
    }),
  });
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
        <AutoTextArea value={form.warmupGeral} onChange={(e) => setForm({ ...form, warmupGeral: e.target.value })} placeholder="Aquecimento geral..." />
      </Field>
      <Field label="E-WARM UP (específico)">
        <AutoTextArea value={form.warmupEspecifico} onChange={(e) => setForm({ ...form, warmupEspecifico: e.target.value })} placeholder="Aquecimento específico do movimento..." />
      </Field>
      <Field label="Skill">
        <AutoTextArea value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} placeholder="Trabalho de habilidade/técnica..." />
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
          <Field label="Time cap (opcional)">
            <TextInput
              value={b.timeCap || ""}
              onChange={(e) => atualizarBloco(b.id, "timeCap", e.target.value)}
              placeholder="Ex: 20' ou 12min"
            />
          </Field>
          <Field label="Requisitos p/ esse workout">
            <AutoTextArea value={b.requisitos} onChange={(e) => atualizarBloco(b.id, "requisitos", e.target.value)} placeholder="Pré-requisitos técnicos, peso mínimo, mobilidade..." />
          </Field>
          <Field label="Objetivos">
            <AutoTextArea value={b.objetivos} onChange={(e) => atualizarBloco(b.id, "objetivos", e.target.value)} placeholder="O que esse bloco desenvolve..." />
          </Field>
          <Field label="Conteúdo (movimentos, reps, tempo)">
            <AutoTextArea value={b.conteudo} onChange={(e) => atualizarBloco(b.id, "conteudo", e.target.value)} placeholder={"Ex: 21-15-9\nThrusters\nPull-ups"} style={{ minHeight: 160 }} />
          </Field>
          <Field label="Resultado (opcional)">
            <AutoTextArea
              value={b.resultado || ""}
              onChange={(e) => atualizarBloco(b.id, "resultado", e.target.value)}
              placeholder="Ex: Time cap ultrapassado aos 40'"
              style={{ minHeight: 70 }}
            />
            {b.resultado && b.resultadoData && (
              <div style={{ fontSize: 11, color: "#5f6066", marginTop: 5 }}>
                Registrado automaticamente em {formatarDataHora(b.resultadoData)}
              </div>
            )}
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
            {b.timeCap && <Badge><Timer size={10} style={{ display: "inline", marginRight: 3, verticalAlign: -1 }} />Time cap {b.timeCap}</Badge>}
          </div>
          {legendas[b.nivel] && <div style={{ fontSize: 11.5, color: "#8C8D91", fontStyle: "italic", marginBottom: 6 }}>{legendas[b.nivel]}</div>}
          {b.requisitos && <div style={{ fontSize: 12.5, color: "#B9BABF", marginBottom: 4 }}><span style={{ color: "#9A9A94", fontWeight: 600 }}>Requisitos: </span>{b.requisitos}</div>}
          {b.objetivos && <div style={{ fontSize: 12.5, color: "#B9BABF", marginBottom: 4 }}><span style={{ color: "#9A9A94", fontWeight: 600 }}>Objetivos: </span>{b.objetivos}</div>}
          {b.conteudo && <div style={{ fontSize: 13, color: "#F1EFE9", whiteSpace: "pre-wrap", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{b.conteudo}</div>}
          {b.resultado && (
            <div style={{ marginTop: 10, background: "rgba(228,222,0,0.08)", border: "1px solid rgba(228,222,0,0.3)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#E4DE00", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Resultado</div>
              <div style={{ fontSize: 13, color: "#F1EFE9", whiteSpace: "pre-wrap" }}>{b.resultado}</div>
              {b.resultadoData && <div style={{ fontSize: 10.5, color: "#8C8D91", marginTop: 4 }}>{formatarDataHora(b.resultadoData)}</div>}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function WorkoutCard({ w, onEditar, onExcluir, onCompartilhar, expandido, onToggle, legendas, destaque, senha }) {
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
                <AutoTextArea value={form.descricao || ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes do aviso..." />
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
                <AutoTextArea value={form.observacao || ""} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Ex: bora treinar pesado hoje!" />
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
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const buscaAtiva = busca.trim().length > 0;

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

  // A busca roda sempre, independente do modo, direto no banco, e não pede senha.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!busca.trim()) { setResultadosBusca([]); setBuscando(false); return; }
    setBuscando(true);
    debounceRef.current = setTimeout(async () => {
      const rows = await searchWorkoutsDb(busca.trim());
      setResultadosBusca(rows);
      setBuscando(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [busca]);

  const carregarMais = async () => {
    setCarregandoMais(true);
    const { rows } = await fetchWorkoutsPage(workouts.length);
    setWorkouts((prev) => [...prev, ...rows]);
    setCarregandoMais(false);
  };

  const abrirNovoTreino = () => pedir(() => { setEditando(null); setSheetAberto(true); });
  const abrirEdicaoTreino = (w) => pedir(() => { setEditando(w.id); setSheetAberto(true); });
  const abrirTodos = () => pedir(() => { setModoTodos(true); carregarPrimeiraPagina(); });
  const voltarRecentes = () => setModoTodos(false);

  const recarregarTudo = async () => {
    await carregarRecentes();
    if (modoTodos) await carregarPrimeiraPagina();
    if (busca.trim()) {
      const rows = await searchWorkoutsDb(busca.trim());
      setResultadosBusca(rows);
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
    setResultadosBusca((prev) => prev.filter((w) => w.id !== id));
    setTotalGeral((prev) => Math.max(0, prev - 1));
  });

  const compartilhar = async (w) => {
    const ok = await copyToClipboard(buildShareUrl(w.id));
    onToast(ok ? "Link do treino copiado!" : "Não consegui copiar o link");
  };

  const listaExibida = buscaAtiva ? resultadosBusca : (modoTodos ? workouts : recentes);
  const carregandoLista = buscaAtiva ? false : (modoTodos ? carregando : carregandoRecentes);
  const treinoEmEdicao = [...recentes, ...workouts, ...resultadosBusca].find((w) => w.id === editando);

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

      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#71727A" }} />
        <TextInput
          placeholder="Buscar por qualquer palavra: nome, código, categoria, tag..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ paddingLeft: 32 }}
        />
      </div>

      {!buscaAtiva && modoTodos && (
        <GhostButton onClick={voltarRecentes} style={{ marginBottom: 14 }}>
          <ArrowLeft size={14} /> Voltar aos recentes
        </GhostButton>
      )}

      {!buscaAtiva && !modoTodos && (
        <div style={{ fontSize: 11.5, color: "#5f6066", marginBottom: 12 }}>
          Mostrando os {Math.min(6, totalGeral)} treinos mais recentes
        </div>
      )}

      {buscaAtiva && (
        <div style={{ fontSize: 11.5, color: "#5f6066", marginBottom: 12 }}>
          {buscando ? "Buscando..." : `${resultadosBusca.length} resultado(s) para "${busca.trim()}"`}
        </div>
      )}

      {carregandoLista ? (
        <Spinner label="Carregando treinos..." />
      ) : (
        <>
          {listaExibida.length === 0 && (
            <EmptyState text={buscaAtiva ? "Nenhum treino encontrado para essa busca." : "Nenhum treino programado ainda. Toque em 'Novo treino'."} />
          )}
          {listaExibida.map((w) => (
            <WorkoutCard
              key={w.id} w={w} expandido={expandidoId === w.id}
              onToggle={() => setExpandidoId(expandidoId === w.id ? null : w.id)}
              onEditar={abrirEdicaoTreino}
              onExcluir={excluir} onCompartilhar={compartilhar} legendas={legendas}
              destaque={w.id === bannerWorkoutId}
              senha={senha}
            />
          ))}
          {!buscaAtiva && modoTodos && workouts.length < total && (
            <GhostButton onClick={carregarMais} style={{ width: "100%" }}>
              {carregandoMais ? "Carregando..." : `Carregar mais (${workouts.length}/${total})`}
            </GhostButton>
          )}
          {!buscaAtiva && !modoTodos && totalGeral > 6 && (
            <GhostButton onClick={abrirTodos} style={{ width: "100%" }}>
              <Lock size={14} /> Ver todos os treinos ({totalGeral})
            </GhostButton>
          )}
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
   PROTOCOLOS DE TREINO
================================================================= */

function buildShareUrlProtocolo(protocoloId) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/p/${protocoloId}`;
}

function ProtocoloForm({ inicial, onSalvar, onCancelar, salvando, erro }) {
  const [form, setForm] = useState(inicial || { titulo: "", resumo: "", duracao: "", objetivo: "", tags: "", descricao: "" });

  return (
    <div>
      <Field label="Título do protocolo">
        <TextInput value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder='Ex: "Protocolo de força — 8 semanas"' />
      </Field>
      <Field label="Resumo breve (aparece na lista)">
        <AutoTextArea
          value={form.resumo}
          onChange={(e) => setForm({ ...form, resumo: e.target.value })}
          placeholder="Em 1-2 frases: do que se trata esse protocolo..."
          style={{ minHeight: 60 }}
        />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Duração (opcional)">
          <TextInput value={form.duracao} onChange={(e) => setForm({ ...form, duracao: e.target.value })} placeholder="Ex: 8 semanas" />
        </Field>
        <Field label="Objetivo (opcional)">
          <TextInput value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="Ex: Hipertrofia" />
        </Field>
      </div>
      <Field label="Tags / palavras-chave">
        <TextInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Ex: força, iniciante, retorno de lesão" />
      </Field>
      <Field label="Descrição completa do protocolo">
        <AutoTextArea
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          placeholder={"Explique as fases, regras, progressão, observações..."}
          style={{ minHeight: 180 }}
        />
      </Field>
      {erro && <div style={{ color: "#E6483F", fontSize: 12.5, marginBottom: 12 }}>{erro}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <GhostButton onClick={onCancelar} style={{ flex: 1 }}>Cancelar</GhostButton>
        <PrimaryButton onClick={() => onSalvar(form)} disabled={salvando} style={{ flex: 1 }}>
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar protocolo"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function BlocoApresentacao({ ap, onEditar, onExcluir }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          display: "inline-block", background: "#E4DE00", color: "#0A0A0A", fontWeight: 800,
          fontSize: 11, letterSpacing: "0.08em", padding: "5px 12px", borderRadius: 4, marginBottom: 14,
          textTransform: "uppercase",
        }}>
          {ap.tag || "SOBRE O MÉTODO"}
        </span>
        <div style={{ display: "flex", gap: 12, flexShrink: 0, marginTop: 4 }}>
          <Pencil size={16} color="#71727A" style={{ cursor: "pointer" }} onClick={() => onEditar(ap)} />
          <Trash2 size={16} color="#71727A" style={{ cursor: "pointer" }} onClick={() => onExcluir(ap.id)} />
        </div>
      </div>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 1.15, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.01em" }}>
        {ap.titulo}
      </div>
      {ap.descricao && (
        <div style={{ fontSize: 14, color: "#B9BABF", lineHeight: 1.6, marginTop: 14, whiteSpace: "pre-wrap" }}>
          {ap.descricao}
        </div>
      )}
      <div style={{ height: 1, background: "#26272B", marginTop: 20 }} />
    </div>
  );
}

function ApresentacoesMetodo({ apresentacoes, setApresentacoes, senha, onToast }) {
  const { pedir, Modal } = useSenhaGate(senha);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ tag: "SOBRE O MÉTODO", titulo: "", descricao: "" });

  const abrirNovo = () => pedir(() => {
    setEditandoId(null);
    setForm({ tag: "SOBRE O MÉTODO", titulo: "", descricao: "" });
    setErro("");
    setSheetAberto(true);
  });
  const abrirEdicao = (ap) => pedir(() => {
    setEditandoId(ap.id);
    setForm(ap);
    setErro("");
    setSheetAberto(true);
  });
  const excluir = (id) => pedir(async () => {
    await excluirApresentacaoDb(id);
    setApresentacoes((prev) => prev.filter((a) => a.id !== id));
  });

  const salvar = async () => {
    setSalvando(true);
    setErro("");
    if (editandoId) {
      const ok = await atualizarApresentacaoDb(editandoId, form);
      setSalvando(false);
      if (!ok) { setErro("Não consegui salvar no banco. Confirme se a tabela \"apresentacoes\" existe no Supabase."); return; }
      setApresentacoes((prev) => prev.map((a) => (a.id === editandoId ? { ...form, id: editandoId, atualizadoEm: new Date().toISOString() } : a)));
    } else {
      const nova = await inserirApresentacaoDb(form);
      setSalvando(false);
      if (!nova) { setErro("Não consegui salvar no banco. Confirme se a tabela \"apresentacoes\" existe no Supabase (rode o supabase-schema.sql)."); return; }
      setApresentacoes((prev) => [...prev, nova]);
    }
    setSheetAberto(false);
    if (onToast) onToast("Apresentação salva!");
  };

  return (
    <div>
      {apresentacoes.map((ap) => (
        <BlocoApresentacao key={ap.id} ap={ap} onEditar={abrirEdicao} onExcluir={excluir} />
      ))}

      <button
        onClick={abrirNovo}
        style={{
          width: "100%", background: "none", border: "1px dashed #3A3B40", borderRadius: 10, padding: "14px",
          color: "#71727A", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 6, marginBottom: 22,
        }}
      >
        <Plus size={14} /> Adicionar apresentação do método
      </button>

      {Modal}

      {sheetAberto && (
        <Sheet title={editandoId ? "Editar apresentação" : "Nova apresentação"} onClose={() => setSheetAberto(false)}>
          <Field label="Etiqueta pequena (opcional)">
            <TextInput value={form.tag || ""} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Ex: SOBRE O MÉTODO" />
          </Field>
          <Field label="Título grande">
            <AutoTextArea
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder='Ex: "CANTIL É UM MÉTODO DE TREINO FUNCIONAL"'
              style={{ minHeight: 70 }}
            />
          </Field>
          <Field label="Texto de apresentação">
            <AutoTextArea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Explique sua proposta, filosofia de treino, o que torna o método diferente..."
              style={{ minHeight: 140 }}
            />
          </Field>
          {erro && <div style={{ color: "#E6483F", fontSize: 12.5, marginBottom: 12 }}>{erro}</div>}
          <PrimaryButton onClick={salvar} disabled={salvando} style={{ width: "100%" }}>
            <Save size={16} /> {salvando ? "Salvando..." : "Salvar apresentação"}
          </PrimaryButton>
        </Sheet>
      )}
    </div>
  );
}

function ProtocoloCard({ p, expandido, onToggle, onEditar, onExcluir, onCompartilhar }) {
  const tags = (p.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <div style={{
      background: "linear-gradient(160deg, #1C1D20, #151618)", border: "1px solid #2A2B2F",
      borderLeft: "3px solid #E4DE00", borderRadius: 12, marginBottom: 14, overflow: "hidden",
    }}>
      <div style={{ padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, cursor: "pointer" }} onClick={onToggle}>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#E4DE00", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Protocolo
            </span>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: "#FFFFFF", letterSpacing: "0.02em", textTransform: "uppercase", marginTop: 4, lineHeight: 1.15 }}>
              {p.titulo || "Protocolo sem título"}
            </div>
          </div>
          {expandido ? <ChevronDown size={20} color="#71727A" style={{ flexShrink: 0, marginTop: 4 }} /> : <ChevronRight size={20} color="#71727A" style={{ flexShrink: 0, marginTop: 4 }} />}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {p.duracao && <Badge>{p.duracao}</Badge>}
          {p.objetivo && <Badge>{p.objetivo}</Badge>}
        </div>

        {p.resumo && (
          <div style={{ fontSize: 14.5, color: "#D8D8D3", marginTop: 12, lineHeight: 1.55 }}>{p.resumo}</div>
        )}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        )}

        {!expandido && (
          <button
            onClick={onToggle}
            style={{ background: "none", border: "none", color: "#E4DE00", fontSize: 12.5, fontWeight: 700, padding: 0, marginTop: 14, cursor: "pointer" }}
          >
            Ler protocolo completo →
          </button>
        )}
      </div>

      {expandido && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #26272B" }}>
          {p.descricao && (
            <div style={{ fontSize: 13.5, color: "#D8D8D3", whiteSpace: "pre-wrap", marginTop: 16, lineHeight: 1.6 }}>{p.descricao}</div>
          )}
          {(p.criadoEm || p.atualizadoEm) && (
            <div style={{ fontSize: 11, color: "#5f6066", marginTop: 14 }}>
              {p.criadoEm && `Criado em ${formatarDataHora(p.criadoEm)}`}
              {p.atualizadoEm && p.atualizadoEm !== p.criadoEm && ` · Editado em ${formatarDataHora(p.atualizadoEm)}`}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <GhostButton onClick={() => onCompartilhar(p)} style={{ flex: 1 }}><Share2 size={14} /> Compartilhar</GhostButton>
            <GhostButton onClick={() => onEditar(p)} style={{ flex: 1 }}><Pencil size={14} /> Editar</GhostButton>
            <GhostButton onClick={() => onExcluir(p.id)} style={{ flex: 1 }}><Trash2 size={14} /> Excluir</GhostButton>
          </div>
        </div>
      )}
    </div>
  );
}

function ProtocolosTab({ senha, onToast }) {
  const [protocolos, setProtocolos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [apresentacoes, setApresentacoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [sheetAberto, setSheetAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [expandidoId, setExpandidoId] = useState(null);
  const { pedir, Modal } = useSenhaGate(senha);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [rows, protocolosRows] = await Promise.all([fetchApresentacoes(), fetchProtocolos()]);
    let listaFinal = rows;
    if (rows.length === 0) {
      const antiga = await migrarApresentacaoAntiga();
      if (antiga) {
        const nova = await inserirApresentacaoDb(antiga);
        if (nova) listaFinal = [nova];
      }
    }
    setApresentacoes(listaFinal);
    setProtocolos(protocolosRows);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => pedir(() => { setEditando(null); setErro(""); setSheetAberto(true); });
  const abrirEdicao = (p) => pedir(() => { setEditando(p.id); setErro(""); setSheetAberto(true); });
  const excluir = (id) => pedir(async () => {
    await excluirProtocoloDb(id);
    setProtocolos((prev) => prev.filter((p) => p.id !== id));
  });

  const salvar = async (form) => {
    if (salvando) return;
    setSalvando(true);
    setErro("");
    const resultado = editando ? await atualizarProtocoloDb(editando, form) : await inserirProtocoloDb(form);
    setSalvando(false);
    if (!resultado) {
      setErro("Não consegui salvar no banco. Confirme se a tabela \"protocolos\" existe no Supabase (rode o supabase-schema.sql) e tente de novo.");
      return;
    }
    setSheetAberto(false);
    setEditando(null);
    if (onToast) onToast("Protocolo salvo!");
    carregar();
  };

  const compartilhar = async (p) => {
    const ok = await copyToClipboard(buildShareUrlProtocolo(p.id));
    onToast(ok ? "Link do protocolo copiado!" : "Não consegui copiar o link");
  };

  const textoBuscavel = (p) => [p.titulo, p.resumo, p.descricao, p.duracao, p.objetivo, p.tags].filter(Boolean).join(" ").toLowerCase();
  const buscaAtiva = busca.trim().length > 0;
  const listaExibida = buscaAtiva ? protocolos.filter((p) => textoBuscavel(p).includes(busca.trim().toLowerCase())) : protocolos;

  return (
    <div>
      <ApresentacoesMetodo apresentacoes={apresentacoes} setApresentacoes={setApresentacoes} senha={senha} onToast={onToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: "#71727A", display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={13} /> Visível para todos que usam o site
        </div>
        <PrimaryButton onClick={abrirNovo}><Plus size={15} /> Novo protocolo</PrimaryButton>
      </div>
      <div style={{ height: 12 }} />

      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#71727A" }} />
        <TextInput
          placeholder="Buscar por título, objetivo, tag, conteúdo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ paddingLeft: 32 }}
        />
      </div>

      {carregando ? (
        <Spinner label="Carregando protocolos..." />
      ) : (
        <>
          {listaExibida.length === 0 && (
            <EmptyState text={buscaAtiva ? "Nenhum protocolo encontrado para essa busca." : "Nenhum protocolo criado ainda. Toque em 'Novo protocolo'."} />
          )}
          {listaExibida.map((p) => (
            <ProtocoloCard
              key={p.id}
              p={p}
              expandido={expandidoId === p.id}
              onToggle={() => setExpandidoId(expandidoId === p.id ? null : p.id)}
              onEditar={abrirEdicao}
              onExcluir={excluir}
              onCompartilhar={compartilhar}
            />
          ))}
        </>
      )}

      {Modal}

      {sheetAberto && (
        <Sheet title={editando ? "Editar protocolo" : "Novo protocolo"} onClose={() => { setSheetAberto(false); setEditando(null); }}>
          <ProtocoloForm
            inicial={editando ? protocolos.find((p) => p.id === editando) : null}
            onSalvar={salvar}
            onCancelar={() => { setSheetAberto(false); setEditando(null); }}
            salvando={salvando}
            erro={erro}
          />
        </Sheet>
      )}
    </div>
  );
}

/* =================================================================
   TELA SOMENTE-LEITURA DE PROTOCOLO (aberta via link compartilhado)
================================================================= */

function ViewOnlyProtocolo({ id, onVoltar }) {
  const [p, setP] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetchProtocoloById(id);
      setP(r);
      setCarregando(false);
    })();
  }, [id]);

  if (!p) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: 20 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ color: "#9A9A94", textAlign: "center", marginTop: 60, fontSize: 14 }}>
          {carregando ? "Carregando protocolo..." : "Protocolo não encontrado (o link pode estar errado ou o protocolo foi removido)."}
        </div>
        {!carregando && (
          <GhostButton onClick={onVoltar} style={{ margin: "20px auto 0" }}>
            <ArrowLeft size={14} /> Ver todos os protocolos
          </GhostButton>
        )}
      </div>
    );
  }

  const tags = (p.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "'Inter', sans-serif", paddingBottom: 40 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ padding: "20px 16px 10px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E4DE00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookOpen size={18} color="#0A0A0A" />
        </div>
        <div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: "#FFFFFF", letterSpacing: "0.03em", lineHeight: 1 }}>CANTIL</div>
          <div style={{ fontSize: 9, color: "#E4DE00", letterSpacing: "0.35em", marginTop: 2 }}>FITNESS</div>
        </div>
        <Badge>somente visualização</Badge>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: "#1A1B1E", border: "1px solid #26272B", borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: "#F1EFE9", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {p.titulo || "Protocolo sem título"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {p.duracao && <Badge>{p.duracao}</Badge>}
            {p.objetivo && <Badge>{p.objetivo}</Badge>}
            {tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
          {p.resumo && <div style={{ fontSize: 13, color: "#B9BABF", marginTop: 12, lineHeight: 1.5 }}>{p.resumo}</div>}
          {p.descricao && <div style={{ fontSize: 13, color: "#D8D8D3", whiteSpace: "pre-wrap", marginTop: 14, lineHeight: 1.5 }}>{p.descricao}</div>}
        </div>
        <GhostButton onClick={onVoltar} style={{ width: "100%", marginTop: 16 }}>
          <ArrowLeft size={14} /> Ver todos os protocolos no site
        </GhostButton>
      </div>
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
function parseHashProtocoloId() {
  const m = window.location.hash.match(/^#\/p\/(.+)$/);
  return m ? m[1] : null;
}

export default function App() {
  const [aba, setAba] = useState("protocolos");
  const [carregando, setCarregando] = useState(true);
  const [exercicios, setExercicios] = useState([]);
  const [legendas, setLegendas] = useState({});
  const [banner, setBanner] = useState(null);
  const [senha, setSenha] = useState(SENHA_PADRAO);
  const [toast, setToast] = useState("");
  const [viewOnlyId, setViewOnlyId] = useState(parseHashWorkoutId());
  const [viewOnlyProtocoloId, setViewOnlyProtocoloId] = useState(parseHashProtocoloId());

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    const onHashChange = () => {
      setViewOnlyId(parseHashWorkoutId());
      setViewOnlyProtocoloId(parseHashProtocoloId());
    };
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
  if (viewOnlyProtocoloId) {
    return (
      <ViewOnlyProtocolo
        id={viewOnlyProtocoloId}
        onVoltar={() => { window.location.hash = ""; setViewOnlyProtocoloId(null); }}
      />
    );
  }

  const abas = [
    { id: "protocolos", label: "Protocolos", icon: BookOpen },
    { id: "workouts", label: "Workouts", icon: ListChecks },
    { id: "biblioteca", label: "Biblioteca", icon: Dumbbell },
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
            {aba === "protocolos" && <ProtocolosTab senha={senha} onToast={mostrarToast} />}
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
