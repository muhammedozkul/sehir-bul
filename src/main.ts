import "./style.css";
import { iller, SINIR, type Il } from "./data/iller";

const TOPLAM_HAK = 5;
const SVG_NS = "http://www.w3.org/2000/svg";

const harita = document.querySelector<SVGSVGElement>("#harita")!;
const hedefYazi = document.querySelector<HTMLParagraphElement>("#hedef")!;
const skorYazi = document.querySelector<HTMLElement>("#skor")!;
const haklarKutu = document.querySelector<HTMLElement>("#haklar")!;
const sonKutu = document.querySelector<HTMLDivElement>("#son")!;
const sonMesaj = document.querySelector<HTMLParagraphElement>("#son-mesaj")!;
const tekrarDugme = document.querySelector<HTMLButtonElement>("#tekrar")!;

// Oyun durumu
let hak = TOPLAM_HAK;
let hedef: Il | null = null;
let bulunanlar = new Set<number>();
let bitti = false;

const yollar = new Map<number, SVGPathElement>();

function haritayiCiz(): void {
  const [minX, minY, maxX, maxY] = SINIR;
  const bosluk = 10;
  harita.setAttribute(
    "viewBox",
    `${minX - bosluk} ${minY - bosluk} ${maxX - minX + bosluk * 2} ${maxY - minY + bosluk * 2}`,
  );

  const grup = document.createElementNS(SVG_NS, "g");
  for (const il of iller) {
    const yol = document.createElementNS(SVG_NS, "path");
    yol.setAttribute("d", il.path);
    yol.classList.add("il");
    yol.dataset.plaka = String(il.plaka);
    // Üstüne gelinen il komşularının altında kalmasın diye en üste taşınır.
    yol.addEventListener("pointerenter", () => {
      if (grup.lastElementChild !== yol) grup.appendChild(yol);
    });
    yol.addEventListener("click", () => tikla(il));
    grup.appendChild(yol);
    yollar.set(il.plaka, yol);
  }
  harita.appendChild(grup);
}

function haklariGoster(): void {
  haklarKutu.innerHTML = "";
  for (let i = 0; i < TOPLAM_HAK; i++) {
    const kalp = document.createElement("span");
    kalp.className = i < hak ? "kalp" : "kalp bos";
    kalp.textContent = "♥";
    haklarKutu.appendChild(kalp);
  }
  haklarKutu.setAttribute("aria-label", `Kalan hak: ${hak}`);
}

function yeniHedef(): void {
  // Önceki turun kırmızıları temizlenir; yeşiller kalır.
  for (const yol of yollar.values()) yol.classList.remove("yanlis");

  const kalanlar = iller.filter((il) => !bulunanlar.has(il.plaka));
  if (kalanlar.length === 0) {
    oyunuBitir("Tebrikler! 81 ilin hepsini buldun.");
    return;
  }
  hedef = kalanlar[Math.floor(Math.random() * kalanlar.length)];
  hedefYazi.innerHTML = `Bul: <strong>${hedef.ad}</strong>`;
}

function tikla(il: Il): void {
  if (bitti || !hedef) return;
  const yol = yollar.get(il.plaka)!;
  if (bulunanlar.has(il.plaka) || yol.classList.contains("yanlis")) return;

  if (il.plaka === hedef.plaka) {
    yol.classList.add("dogru");
    bulunanlar.add(il.plaka);
    skorYazi.textContent = String(bulunanlar.size);
    hedef = null;
    setTimeout(yeniHedef, 600);
    return;
  }

  yol.classList.add("yanlis");
  hak--;
  haklariGoster();
  if (hak === 0) {
    yollar.get(hedef.plaka)!.classList.add("cevap");
    oyunuBitir(`Hakların bitti. ${hedef.ad} burasıydı. ${bulunanlar.size} il buldun.`);
  }
}

function oyunuBitir(mesaj: string): void {
  bitti = true;
  sonMesaj.textContent = mesaj;
  sonKutu.hidden = false;
  tekrarDugme.focus();
}

function oyunuBaslat(): void {
  hak = TOPLAM_HAK;
  bulunanlar = new Set();
  bitti = false;
  for (const yol of yollar.values()) yol.classList.remove("dogru", "yanlis", "cevap");
  skorYazi.textContent = "0";
  sonKutu.hidden = true;
  haklariGoster();
  yeniHedef();
}

tekrarDugme.addEventListener("click", oyunuBaslat);
haritayiCiz();
oyunuBaslat();
