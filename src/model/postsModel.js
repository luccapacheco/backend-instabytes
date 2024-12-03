import "dotenv/config"; // Carrega as variáveis de ambiente
import { ObjectId } from "mongodb"; // Importa o manipulador de IDs do MongoDB
import conectarAoBanco from "../config/dbConfig.js"; // Importa a função de conexão

let conexao; // Variável de conexão para manter a persistência da conexão com o banco

// Garante que a conexão ao banco de dados seja estabelecida apenas uma vez
async function getConnection() {
    if (!conexao) {
        try {
            conexao = await conectarAoBanco(process.env.STRING_CONEXAO);
            console.log("Conexão com o banco estabelecida.");
        } catch (error) {
            console.error("Erro ao conectar ao banco:", error.message);
            throw new Error("Falha ao conectar ao banco de dados.");
        }
    }
    return conexao;
}

// Função para obter a coleção de posts
async function getPostsCollection() {
    const db = (await getConnection()).db("imersao-instabytes");
    return db.collection("posts");
}

// Função para buscar todos os posts do banco de dados
export async function getAllPosts() {
    try {
        const colecao = await getPostsCollection();
        return await colecao.find().toArray();
    } catch (error) {
        console.error("Erro ao buscar posts:", error.message);
        throw new Error("Falha ao buscar posts.");
    }
}

// Função para criar um novo post
export async function createPosts(novoPost) {
    try {
        const colecao = await getPostsCollection();
        const resultado = await colecao.insertOne(novoPost);

        return {
            insertedId: resultado.insertedId,
            novoPost: { ...novoPost, _id: resultado.insertedId },
        };
    } catch (error) {
        console.error("Erro ao criar post:", error.message);
        throw new Error("Falha ao criar post.");
    }
}

// Função para atualizar um post
export async function atualizarPost(id, novoPost) {
    try {
        const colecao = await getPostsCollection();
        const resultado = await colecao.updateOne(
            { _id: new ObjectId(id) }, // Converte a string do ID para ObjectId
            { $set: novoPost } // Atualiza os campos do post
        );

        if (resultado.matchedCount === 0) {
            throw new Error(`Post com ID ${id} não encontrado.`);
        }

        return { id, modificado: resultado.modifiedCount > 0 };
    } catch (error) {
        console.error(`Erro ao atualizar post com ID ${id}:`, error.message);
        throw new Error(`Falha ao atualizar post com ID ${id}.`);
    }
}
