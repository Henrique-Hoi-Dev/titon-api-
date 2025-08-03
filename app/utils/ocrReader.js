import Tesseract from 'tesseract.js';

async function extractTextFromImage(imagePath) {
    const {
        data: { text }
    } = await Tesseract.recognize(imagePath, 'eng', {
        // eslint-disable-next-line no-console
        logger: process.env.NODE_ENV === 'development' ? (m) => console.log(m) : () => {}
    });
    return text;
}

export default {
    extractTextFromImage
};
