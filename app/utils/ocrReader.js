import Tesseract from 'tesseract.js';

async function extractTextFromImage(imagePath) {
    const {
        data: { text }
    } = await Tesseract.recognize(imagePath, 'eng', {
        // eslint-disable-next-line no-console
        logger: (m) => console.log(m) // pode remover em produção
    });
    return text;
}

export default {
    extractTextFromImage
};
