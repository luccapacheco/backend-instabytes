import { GoogleGenerativeAI } from "@google/generative-ai";

// Cria uma instância do cliente GoogleGenerativeAI usando a chave da API, que está configurada na variável de ambiente 'GEMINI_API_KEY'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Obtém o modelo de IA Gemini 1.5 Flash para geração de conteúdo
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Função assíncrona que gera uma descrição da imagem fornecida usando o modelo Gemini.
export default async function gerarDescricaoComGemini(imageBuffer) {
  // Define o prompt que será enviado ao modelo para gerar uma descrição. O prompt foi aprimorado para maior clareza.
  const prompt =
    "Descreva a imagem fornecida em português do Brasil. Seja detalhado e mencione os elementos visíveis na imagem.";

  try {
    // Prepara a imagem que será enviada para o modelo. A imagem é convertida para base64 e enviada no formato MIME 'image/png'.
    const image = {
      inlineData: {
        data: imageBuffer.toString("base64"), // Converte a imagem (buffer) para base64
        mimeType: "image/png", // Define o tipo MIME da imagem como PNG
      },
    };

    // Envia o prompt e a imagem para o modelo, solicitando a geração do conteúdo (descrição).
    const res = await model.generateContent([prompt, image]);

    // Valida a resposta da API para garantir que o texto seja retornado corretamente
    const descricao = res?.response?.text?.() || "Descrição não disponível."; 

    // Retorna o texto gerado pelo modelo
    return descricao;
  } catch (erro) {
    // Se ocorrer um erro, o erro será capturado e exibido no console.
    console.error("Erro ao obter descrição da imagem:", erro.message, erro);
    // Lança um novo erro para que o chamador da função saiba que algo deu errado.
    throw new Error("Erro ao gerar descrição da imagem com o Gemini.");
  }
}
