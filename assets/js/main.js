const phrases = [
  'Uma página com propósito, fé e espaço para crescer.',
  'Conteúdo religioso, acolhedor e em constante evolução.',
  'Aqui, cada bloco pode virar uma nova oportunidade de conexão.',
  'A base está pronta para receber sua história e sua visão.'
];

const dynamicText = document.getElementById('dynamic-text');

if (dynamicText) {
  let index = 0;
  setInterval(() => {
    index = (index + 1) % phrases.length;
    dynamicText.textContent = phrases[index];
  }, 3500);
}
