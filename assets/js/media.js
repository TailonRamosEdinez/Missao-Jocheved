// media.js - behavior for the top menu and video category rendering
document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('.menu-btn');
	const panels = document.querySelectorAll('.conteudo');
	const indicator = document.querySelector('.menu-indicator');
	const videoCategoriesContainer = document.querySelector('.video-categories');
	const videoResultsTitle = document.querySelector('#video-results h3');
	const videoResultsText = document.querySelector('#video-results p');
	const videoList = document.querySelector('.video-list');

	const defaultVideoCatalog = {
		ensino: {
			title: 'Ensino',
			categories: [
				{
					slug: 'lado-do-bem',
					name: 'Lado do Bem',
					description: 'Vídeos de ensino, estudos bíblicos e reflexões para aprofundar a fé.',
					videos: [
						{
							id: 'M7lc1UVf-VE',
							title: 'Estudo bíblico introdutório',
							description: 'Exemplo de vídeo que pode vir do banco de dados futuramente.'
						},
						{
							id: 'aqz-KE-bpKQ',
							title: 'Reflexão da semana',
							description: 'Conteúdo de ensino preparado para ser substituído por dados reais.'
						}
					]
				}
			]
		},
		testemunho: {
			title: 'Testemunho',
			categories: [
				{
					slug: 'historias-de-fe',
					name: 'Histórias de Fé',
					description: 'Relatos e experiências que edificam e inspiram.',
					videos: [
						{
							id: 'ScMzIvxBSi4',
							title: 'Testemunho de transformação',
							description: 'Exemplo de vídeo para organizar por categoria.'
						}
					]
				}
			]
		},
		beleza: {
			title: 'Beleza Divina',
			categories: [
				{
					slug: 'contemplacao',
					name: 'Contemplação',
					description: 'Vídeos contemplativos e visualmente inspiradores.',
					videos: [
						{
							id: '2Vv-BfVoq4g',
							title: 'Beleza Divina em imagens',
							description: 'Exemplo de vídeo para futura integração com o banco.'
						}
					]
				}
			]
		}
	};

	function getVideoCatalog() {
		if (window.MissaoJochevedVideoCatalog) {
			return window.MissaoJochevedVideoCatalog;
		}

		return defaultVideoCatalog;
	}

	function renderVideos(sectionId, categorySlug) {
		const catalog = getVideoCatalog();
		const sectionData = catalog[sectionId];
		const category = sectionData?.categories?.find(item => item.slug === categorySlug) || sectionData?.categories?.[0];

		if (!videoCategoriesContainer || !videoList || !sectionData || !category) {
			return;
		}

		const buttons = videoCategoriesContainer.querySelectorAll('.video-category');
		buttons.forEach(button => {
			const isActive = button.dataset.category === category.slug;
			button.classList.toggle('active', isActive);
			button.setAttribute('aria-selected', isActive ? 'true' : 'false');
		});

		if (videoResultsTitle) {
			videoResultsTitle.textContent = category.name;
		}

		if (videoResultsText) {
			videoResultsText.textContent = category.description || 'Selecione uma categoria para ver os vídeos.';
		}

		videoList.innerHTML = '';

		if (!category.videos?.length) {
			videoList.innerHTML = '<div class="video-empty">Ainda não há vídeos cadastrados para esta categoria. Você pode conectar o banco de dados aqui.</div>';
			return;
		}

		const fragment = document.createDocumentFragment();
		category.videos.forEach(video => {
			const card = document.createElement('article');
			card.className = 'video-card';
			card.innerHTML = `
				<div class="video-frame">
					<iframe src="https://www.youtube.com/embed/${video.id}" title="${video.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
				</div>
				<div class="video-card-content">
					<h4>${video.title}</h4>
					<p>${video.description || 'Vídeo vinculado à categoria selecionada.'}</p>
				</div>
			`;
			fragment.appendChild(card);
		});

		videoList.appendChild(fragment);
	}

	function renderCategoryButtons(sectionId) {
		const catalog = getVideoCatalog();
		const sectionData = catalog[sectionId];

		if (!videoCategoriesContainer || !sectionData) {
			return;
		}

		videoCategoriesContainer.innerHTML = '';

		sectionData.categories.forEach((category, index) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = `video-category${index === 0 ? ' active' : ''}`;
			button.dataset.section = sectionId;
			button.dataset.category = category.slug;
			button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
			button.textContent = category.name;
			button.addEventListener('click', () => renderVideos(sectionId, category.slug));
			videoCategoriesContainer.appendChild(button);
		});

		const firstCategory = sectionData.categories[0];
		if (firstCategory) {
			renderVideos(sectionId, firstCategory.slug);
		}
	}

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
			const idx = Array.from(buttons).indexOf(btn);
			if (indicator) indicator.style.transform = `translateX(${idx * 100}%)`;
		}
		buttons.forEach(b => { if (b.dataset.target !== id) b.setAttribute('aria-selected', 'false'); });
		renderCategoryButtons(id);
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			activate(target);
		});
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				const target = btn.dataset.target;
				activate(target);
			}
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

	const first = buttons[0]?.dataset.target || 'ensino';
	activate(first);
});
