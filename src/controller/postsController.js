import "dotenv/config"; // Carrega as variáveis de ambiente
import { createPosts, atualizarPost, getAllPosts } from "../model/postsModel.js";
import fs from "fs";
import path from "path"; // Importação do módulo path
import gerarDescricaoComGemini from "../services/geminiServices.js";

const uploadDir = path.resolve("uploads");

// Garante que o diretório de uploads existe. Se não existir, ele será criado.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Diretório 'uploads' criado.");
}

// Função para listar todos os posts
export async function listPosts(req, res) {
  try {
    const posts = await getAllPosts();
    sendResponse(res, 200, "Posts listados com sucesso.", posts);
  } catch (erro) {
    sendResponse(res, 500, "Falha ao listar posts.");
  }
}

// Função para criar um novo post
export async function createNewPosts(req, res) {
  const novoPost = req.body;
  try {
    const postCriado = await createPosts(novoPost);
    sendResponse(res, 201, "Post criado com sucesso.", postCriado);
  } catch (erro) {
    sendResponse(res, 500, "Falha ao criar post.");
  }
}

// Função para fazer upload de imagem
export async function uploadImagem(req, res) {
    if (!req.file) {
        return res.status(400).json({ Erro: "Nenhuma imagem foi enviada." });
    }

    const novoPost = {
        descricao: "",
        imgUrl: "",
        alt: "",
    };

    try {
        const postCriado = await createPosts(novoPost);

        const novoNomeImagem = `${postCriado.insertedId}.png`;
        const caminhoAntigo = req.file.path;
        const caminhoNovo = path.join(uploadDir, novoNomeImagem);

        fs.renameSync(caminhoAntigo, caminhoNovo);
        console.log("Imagem salva e renomeada:", caminhoNovo);

        novoPost.imgUrl = `http://localhost:3000/uploads/${novoNomeImagem}`;

        res.status(201).json({
            mensagem: "Imagem enviada com sucesso.",
            post: novoPost,
        });
    } catch (erro) {
        console.error("Erro ao processar upload:", erro.message);
        // Substitui a chamada para sendResponse pela forma correta de enviar resposta.
        res.status(500).json({ Erro: "Falha ao enviar imagem." });
    }
}

// Função para atualizar post com base no ID
export async function refreshNewPosts(req, res) {
    const id = req.params.id; // Obtém o ID do post da URL
    const caminhoImagem = path.join(uploadDir, `${id}.png`);

    // Verifica se a imagem existe no diretório
    if (!fs.existsSync(caminhoImagem)) {
        return res.status(404).json({ Erro: "Imagem não encontrada." });
    }

    try {
        // Lê a imagem e gera o buffer
        const imgBuffer = fs.readFileSync(caminhoImagem);

        // Chama o Gemini para gerar a descrição
        const descricao = await gerarDescricaoComGemini(imgBuffer);

        // Cria um objeto com os dados atualizados
        const postAtualizado = {
            imgUrl: `http://localhost:3000/uploads/${id}.png`, // URL da imagem
            descricao: descricao || "Descrição não gerada.", // Caso a descrição não tenha sido gerada
            alt: req.body.alt || "Descrição gerada automaticamente.", // Texto alternativo
        };

        // Atualiza o post no banco de dados
        const resultado = await atualizarPost(id, postAtualizado);

        // Envia a resposta com o post atualizado
        res.status(200).json({
            mensagem: "Post atualizado com sucesso.",
            post: resultado,
        });
    } catch (erro) {
        console.error("Erro ao atualizar post:", erro.message);
        res.status(500).json({ Erro: "Falha ao atualizar post." });
    }
}
