const commentValidations = (comentario) => {
    if (!comentario || comentario.length === 0) return 'Escriba un comentario'
    if (comentario.length > 280) return 'Sobrepaso el maximo de caracteres permitido'
    return null
}

module.exports = commentValidations