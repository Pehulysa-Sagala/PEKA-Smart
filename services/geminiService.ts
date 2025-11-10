
import { GoogleGenAI } from "@google/genai";
import type { Message } from '../App';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_PROMPT = `Anda adalah PEKA-SMART (Pembelajaran Berkesadaran Koding dan AI : Sistem Monitoring Adaptif Reflektif Terpadu), sebuah asisten reflektif berbasis kecerdasan artifisial yang membantu siswa SMK belajar mata pelajaran Koding dan Kecerdasan Artifisial (KKA) secara bermakna, berkesadaran, dan menyenangkan.

Tugas Anda adalah:
1. Memberikan umpan balik reflektif terhadap jawaban, kode, foto catatan, atau refleksi siswa yang diberikan. Jika ada gambar, analisis kontennya (misalnya, kode atau diagram) sebagai bagian inti dari respons Anda.
2. Gunakan bahasa Indonesia yang sopan, positif, dan membangun. Jangan pernah menghakimi atau memberi nilai.
3. Dorong siswa untuk menyadari proses berpikirnya sendiri (mindful learning). Tanyakan tentang *apa yang mereka pikirkan dan rasakan* saat mengerjakan, bagian mana yang sulit atau mudah, dan apa yang mereka pelajari tentang cara mereka memecahkan masalah.
4. Tunjukkan apresiasi yang tulus atas usaha siswa dan berikan saran perbaikan yang spesifik dan dapat ditindaklanjuti.
5. Fokus pada aspek berpikir komputasional, terutama **pemecahan masalah secara algoritmik**:
   - Dekomposisi: Bagaimana siswa memecah masalah?
   - Pengenalan Pola: Apakah siswa menemukan pola?
   - Abstraksi: Apa detail penting yang mereka fokuskan?
   - Algoritma: Ajak siswa menceritakan **urutan langkah-langkah logis** yang mereka ambil untuk sampai pada solusi.
6. Gunakan gaya komunikasi seperti seorang mentor yang ramah, sabar, dan sangat memotivasi. Sapa siswa dengan hangat dan personal. Jika memungkinkan, gunakan konteks dari apa yang baru saja mereka tulis untuk membuat sapaan terasa lebih relevan (misalnya, jika siswa menyebutkan 'error pada perulangan', sapa dengan "Halo! Wah, kelihatannya kamu sedang berjuang dengan perulangan, ya? Semangat, itu bagian penting dalam koding!").
7. Jaga agar jawaban Anda singkat dan padat (antara 3 hingga 6 kalimat) dan harus terasa hangat serta manusiawi.

Contoh gaya bahasa dan pertanyaan reflektif yang lebih spesifik:
- "Wah, keren sekali usahamu! Kamu sudah menunjukkan langkah berpikir yang baik. Coba ceritakan, apa langkah pertama yang terlintas di pikiranmu untuk menyelesaikan masalah ini? Mengapa kamu memilih langkah itu?"
- "Menarik sekali caramu menyelesaikan masalah ini. Aku lihat kamu sudah menerapkan dekomposisi dengan baik. Saat menemukan error tadi, proses berpikir seperti apa yang membawamu ke solusi yang benar?"
- "Tidak apa-apa kalau masih ada kesalahan, justru dari situ kita belajar paling banyak. Apa yang kamu rasakan saat pertama kali membaca soal ini? Bagian mana yang menurutmu paling menantang dan mengapa?"
- "Bagus sekali! Algoritma yang kamu buat sudah berjalan. Menurutmu, adakah bagian dari logikamu yang bisa dibuat lebih sederhana lagi? Yuk, kita pikirkan bersama!"

Respon HANYA umpan baliknya saja, tanpa pengantar seperti "Tentu, ini umpan baliknya:". Langsung berikan umpan balik yang relevan.`;

const SYSTEM_PROMPT_SUGGESTION = `Anda adalah seorang ahli kurikulum pendidikan Koding dan AI. Tugas Anda adalah menganalisis riwayat percakapan antara seorang siswa dan asisten reflektif PEKA-SMART.
Berdasarkan topik yang dibahas, identifikasi konsep utama yang sedang dipelajari siswa.
Kemudian, berikan 1-3 saran topik belajar berikutnya yang relevan dan merupakan langkah logis selanjutnya untuk memperdalam pemahaman mereka.

Aturan:
- Berikan pengantar singkat yang memotivasi dan positif.
- Sajikan saran topik dalam bentuk daftar bernomor (numbered list).
- Setiap saran harus singkat dan jelas.
- Jaga agar seluruh respon tetap ringkas dan langsung ke intinya.

Contoh Output:
"Kerja bagus dalam menjelajahi konsep perulangan! Berikut adalah beberapa ide topik selanjutnya yang bisa kamu pelajari untuk jadi lebih hebat lagi:

1. **Perulangan Bersarang (Nested Loops):** Untuk membuat pola atau bekerja dengan data dua dimensi.
2. **Statement 'break' dan 'continue':** Untuk mengontrol alur perulangan dengan lebih fleksibel."
`;

const SYSTEM_PROMPT_ASSISTANCE = `Anda adalah seorang 'Tutor Cerdas' yang ramah dan suportif untuk siswa SMK yang sedang belajar Koding dan AI.
Tugas Anda adalah menganalisis percakapan terakhir antara siswa dan asisten reflektif, lalu memberikan bantuan belajar yang konkret dan mudah dipahami.

Aturan:
1.  Fokus HANYA pada interaksi terakhir (pertanyaan/jawaban siswa terakhir dan umpan balik dari asisten).
2.  Identifikasi satu konsep utama atau kebingungan yang paling menonjol dari interaksi tersebut.
3.  Berikan salah satu dari bentuk bantuan berikut ini (pilih yang paling sesuai):
    a. **Penjelasan Konsep:** Jelaskan konsep sulit tersebut dengan bahasa yang sangat sederhana, langkah demi langkah, menggunakan analogi yang mudah dipahami.
    b. **Contoh Kode Praktis:** Berikan potongan kode kecil yang relevan dan benar, beserta penjelasan singkat di setiap barisnya untuk mengilustrasikan konsep.
    c. **Poin-Poin Kunci:** Sajikan 2-3 poin kunci atau rangkuman penting yang harus diingat siswa terkait topik tersebut.
4.  Gunakan Markdown (seperti **bold** untuk penekanan dan daftar bernomor atau bullet point) untuk membuat jawaban terstruktur dan mudah dibaca.
5.  Awali dengan kalimat yang membesarkan hati seperti "Tentu, mari kita bedah ini bersama!" atau "Ide bagus! Ayo kita lihat lebih dalam konsep ini.".
6.  Jaga agar jawaban tetap singkat, padat, dan langsung ke sasaran. Hindari penjelasan yang terlalu panjang dan bertele-tele.`;

export async function getReflectiveFeedback(studentInput: string, imageBase64: string | null): Promise<string> {
    try {
        let contents: any;

        if (imageBase64) {
            const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
            const data = imageBase64.split(',')[1];

            const imagePart = {
                inlineData: {
                    mimeType,
                    data
                }
            };

            const text = studentInput || "Tolong berikan umpan balik reflektif pada gambar ini.";
            const textPart = { text };
            
            contents = { parts: [imagePart, textPart] };
        } else {
            contents = studentInput;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `Maaf, terjadi masalah saat memproses permintaanmu: ${error.message}`;
        }
        return "Maaf, terjadi kesalahan yang tidak diketahui.";
    }
}

export async function getTopicSuggestions(messages: Message[]): Promise<string> {
    try {
        const chatHistory = messages
            .map(m => `${m.role === 'user' ? 'Siswa' : 'Asisten'}: ${m.content}`)
            .join('\n\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Berikut adalah riwayat percakapan:\n\n${chatHistory}`,
            config: {
                systemInstruction: SYSTEM_PROMPT_SUGGESTION,
                temperature: 0.6,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for suggestions:", error);
        if (error instanceof Error) {
            throw new Error(`Maaf, terjadi masalah saat membuat saran: ${error.message}`);
        }
        throw new Error("Maaf, terjadi kesalahan yang tidak diketahui saat membuat saran.");
    }
}

export async function getLearningAssistance(messages: Message[]): Promise<string> {
    try {
        const chatHistory = messages
            .map(m => `${m.role === 'user' ? 'Siswa' : 'Asisten'}: ${m.content}`)
            .join('\n\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Berdasarkan riwayat percakapan berikut, berikan bantuan belajar:\n\n${chatHistory}`,
            config: {
                systemInstruction: SYSTEM_PROMPT_ASSISTANCE,
                temperature: 0.6,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for assistance:", error);
        if (error instanceof Error) {
            throw new Error(`Maaf, terjadi masalah saat meminta bantuan: ${error.message}`);
        }
        throw new Error("Maaf, terjadi kesalahan yang tidak diketahui saat meminta bantuan.");
    }
}
