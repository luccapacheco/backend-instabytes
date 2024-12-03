// Função para enviar respostas padronizadas
export function sendResponse(res, status, message, data = null) {
    return res.status(status).json({
      message,
      data,
    });
  }
  