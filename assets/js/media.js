// media.js - behavior for top 3-bar menu
document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('.menu-btn');
	const panels = document.querySelectorAll('.conteudo');
	const indicator = document.querySelector('.menu-indicator');

	function activate(id) {
		panels.forEach(p => p.classList.remove('ativo'));
		buttons.forEach(b => b.classList.remove('active'));
		const panel = document.getElementById(id);
		const btn = document.querySelector(`.menu-btn[data-target="${id}"]`);
		if (panel) {
			panel.classList.add('ativo');
			panel.removeAttribute('hidden');
		}
		panels.forEach(p => { if (p.id !== id) p.setAttribute('hidden', ''); });
		if (btn) {
			btn.classList.add('active');
			btn.setAttribute('aria-selected', 'true');
			// move indicator
			const idx = Array.from(buttons).indexOf(btn);
			if (indicator) indicator.style.transform = `translateX(${idx * 100}%)`;
		}
		buttons.forEach(b => { if (b.dataset.target !== id) b.setAttribute('aria-selected', 'false'); });
	}

	// Click handlers
	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			activate(target);
		});
		// keyboard support (Enter/Space)
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				const target = btn.dataset.target;
				activate(target);
			}
			// arrow navigation
			if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
				e.preventDefault();
				const idx = Array.from(buttons).indexOf(btn);
				const dir = e.key === 'ArrowRight' ? 1 : -1;
				const nxt = buttons[(idx + dir + buttons.length) % buttons.length];
				nxt.focus();
				activate(nxt.dataset.target);
			}
		});
	});

	// Initialize first panel
	const first = buttons[0]?.dataset.target || 'ensino';
	activate(first);
});
