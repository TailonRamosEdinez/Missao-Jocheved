document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.faq-link');
  const blocks = document.querySelectorAll('.faq-block');

  function showBlock(targetId) {
    blocks.forEach((block) => {
      block.classList.toggle('active-block', block.id === targetId);
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.dataset.target === targetId);
    });
  }

  links.forEach((link) => {
    link.addEventListener('click', () => {
      showBlock(link.dataset.target);
    });
  });

  showBlock('nosas');
});
