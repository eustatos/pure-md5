// Тестируем tree-shaking: импортируем только md5
// Должны увидеть только необходимые части, а не весь бандл

const code = `
import { md5 } from './dist/index.js';

console.log(md5('test'));
`;

console.log('Testing tree-shaking with current setup...');
console.log('If you see all module exports, tree-shaking is not working well.');
console.log('If you see only md5, tree-shaking is working.');
